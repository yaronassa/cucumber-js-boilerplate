import {InfrastructureObject} from "../infrastructureObject";
import {IPropertyField} from "../logic/propertyFields";

interface ITestable {
    test: (value: any) => boolean,
    field: IPropertyField,
    toString: () => string
}

interface ITestableOptions {
    partial?: boolean,
    trim?: boolean,
    ignoreCase?: boolean
}

const moment = require('moment');

class VariableProcessor extends InfrastructureObject {
    private variableProcessors: Map<string, (value: string) => Promise<string>> = new Map<string, (value: string) => Promise<string>>();

    constructor() {
        super();

        this.initProcessors();
    }

    public async parseObjectVariables(value: string) {
        const innerValue = value.toString().replace(/\${(.+)}/g, '$1');

        if (innerValue.match(/^\[.*]$/)) { // array
            return this.infra.utils.parser.safeSplit(innerValue.replace(/^\[(.*)]$/, '$1'), ',').map(item => item.trim())
                .filter(item => item.trim() !== '');
        }
        if (innerValue.match(/^\/.+?\/[igm]*$/)) { // regexp
            const regexpParts = innerValue.match(/^\/(.+?)\/([igm]*)$/);
            return new RegExp(regexpParts[1], regexpParts[2] || '');
        }
        if (innerValue.match(/^{.+}$/)) { // JSON
            return JSON.parse(innerValue);
        }

        return undefined;
    }

    public async processVariables(value: string): Promise<string> {
        let result = value;
        const processedVariableMessage = [];
        const variableStart = [];
        let i = 0;
        while (i < result.length) {
            if (result[i] === '$' && i < result.length - 1 && result[i + 1] === '{' && (i === 0 || result[i - 1] !== '\\')) {
                variableStart.push(i);
            }

            if (result[i] === '}' && (i === 0 || result[i - 1] !== '\\')) {
                const start = variableStart.pop();
                if (start !== undefined) {
                    const variableToProcess = result.substr(start, i - start + 1);
                    const modifiedOptions = this.extractValueOptions(variableToProcess);
                    let processResult = (modifiedOptions) ? variableToProcess : await this.processVariableValue(variableToProcess);
                    processResult = (processResult === undefined) ? 'undefined' : processResult.toString();

                    if (/\${passwords?_.*/i.test(variableToProcess)) {
                        processedVariableMessage.push(`"${variableToProcess}" => ${processResult[0]}************* (password variable)`);
                    } else {
                        if (variableToProcess !== processResult) processedVariableMessage.push(`"${variableToProcess}" => ${processResult}`);
                    }

                    result = result.substring(0, start) + processResult + result.substring(i + 1);
                    i += processResult.length - variableToProcess.length;

                }
            }

            i = i + 1;
        }

        if (processedVariableMessage.length > 0) this.log(`Variables processed: ${processedVariableMessage.join(', ')}`);


        return result;
    }

    public async getTestable(field: IPropertyField, options: ITestableOptions = {ignoreCase : false, trim : true, partial : false}): Promise<ITestable> {
        const _self = this;

        const modifiedOptions = this.extractValueOptions(field.fieldValue);
        if (modifiedOptions) return this.getTestable({fieldName: field.fieldName, fieldValue: modifiedOptions.innerValue}, Object.assign(options, modifiedOptions.options));

        const parsedValue = await this.processVariables(field.fieldValue);
        const objectValue = await this.parseObjectVariables(parsedValue) || parsedValue;

        const result: ITestable = {
            field,
            test(target: any): boolean {
                if (target === null || target === undefined) {
                    return (parsedValue === null || parsedValue === undefined || parsedValue === 'null' || parsedValue === 'undefined' || parsedValue === '');
                }

                // TODO: add support for regexp and other variables

                const compareSource = (target instanceof Object || objectValue instanceof RegExp) ? objectValue : parsedValue;

                // String comparison as default last result
                return _self.compareTestableWithOptions(compareSource, target, options);
            },
            toString() {
                if (objectValue) return JSON.stringify(objectValue);
                return parsedValue.toString();
            }

        };

        return result;
    }

    private compareTestableWithOptions(source: any, target: any, options: ITestableOptions) {
        const _self = this;

        let compareSource = source;
        let compareTarget = target;

        if (typeof compareTarget === 'string' || typeof compareTarget === 'number' || typeof compareTarget === 'boolean') {
            compareTarget = compareTarget.toString();

            if (compareSource instanceof RegExp ) return compareSource.test(compareTarget);

            compareSource = compareSource.toString();
            if (options.ignoreCase) { compareSource = compareSource.toLowerCase(); compareTarget = compareTarget.toLowerCase(); }
            if (options.trim) { compareSource = compareSource.trim(); compareTarget = compareTarget.trim(); }

            // tslint:disable-next-line:triple-equals
            return (options.partial) ? (compareTarget.indexOf(compareSource) >= 0 || compareSource.indexOf(compareTarget) >= 0) : (compareSource == compareTarget);
        }

        if (Array.isArray(target)) {
            if (!Array.isArray(compareSource)) compareSource = [compareSource];
            let result = compareSource.every(item => compareTarget.some(compareValue => _self.compareTestableWithOptions(item, compareValue, {})));
            if (!options.partial) result = (result && (compareTarget.length === compareSource.length));
            return result;
        }

        // TODO: add regexp, json, and others
    }

    private async processVariableValue(variableEnclosure): Promise<string> {
        const variableContent = variableEnclosure.replace(/^\${(.*)}$/, '$1');
        const splitVariable = variableContent.split('_');
        const type = splitVariable.splice(0, 1)[0].toLowerCase();

        const objectParse = await this.parseObjectVariables(variableContent);

        if (objectParse !== undefined) return variableEnclosure;

        const processor = this.variableProcessors.get(type) || this.variableProcessors.get(`${type}s`);

        if (!processor) throw new Error('Cannot find variable processor for ' + type);

        const result = await processor.call(this, splitVariable.join('_'));

        return result;
    }

    private extractValueOptions(value: string): {innerValue: string, options: ITestableOptions} {
        const options = value.toString().match(/\${(!)?(ignoreCase|trim|partial|contains?):(.+)}/i);
        if (options) {

            const optionToggle = (options[1] === undefined);
            let optionName = options[2];
            const innerValue = options[3];

            switch (optionName.toLowerCase()) {
                case 'ignorecase':
                    optionName = 'ignoreCase';
                    break;
                case 'partial':
                case 'contain':
                case 'contains':
                    optionName = 'partial';
                    break;
                default:
                    optionName = optionName.toLowerCase();
                    break;
            }

            const result = {innerValue, options : {}};
            result.options[optionName] = optionToggle;

            return result;
        }
    }


    private initProcessors() {
        const _self = this;

        // TODO:IMPLEMENT_ME - Add your own variables and behaviours

        this.variableProcessors.set('todelete', async variable => '${toDelete}');
        this.variableProcessors.set('this', async variable => {
            const splitVariable = variable.split('.');
            splitVariable[0] = splitVariable[0] + '_this';
            return _self.variableProcessors.get('entities')(splitVariable.join('.'));
        });
        this.variableProcessors.set('=', async variable => {
            if (!variable.match(/^[\d+\-*() ]+$/)) throw new Error(`Cannot parse variable into math equation: ${variable}`);
            // tslint:disable-next-line:no-eval
            const result = eval(variable);

            const propFields = await _self.infra.utils.parser.parseFieldPairs(`equation=${variable}`);

            _self.infra.data.storeRawEntityData(result.toString(), 'math', propFields);

            return result.toString();
        });
        this.variableProcessors.set('random', async variable => {
            const splitVariable = variable.split('_');
            const min = Number(splitVariable[0] || '1');
            const max = Number(splitVariable[1] || '50');

            if (isNaN(max) || isNaN(min)) throw new Error(`Cannot parse min/max numbers for ${variable}`);

            const result = Math.floor(Math.random() * (max - min)) + min;

            const propFields = await _self.infra.utils.parser.parseFieldPairs(`min=${min}, max=${max}`);

            _self.infra.data.storeRawEntityData(result.toString(), 'random', propFields);

            return result.toString();
        });
        this.variableProcessors.set('entities', async variable => {
            const splitVariable = variable.split('.');
            const entityIdentifierSplit = splitVariable.shift().split('_');
            const propertyPath = splitVariable.join('.');
            const entityDescription = entityIdentifierSplit.pop();
            const entityType = entityIdentifierSplit.join('_');

            const entityIndex = (/^\d+$/.test(entityDescription)) ? Number(entityDescription) : 'latest';

            if (entityIndex === 0) throw new Error(`Entity indices are 1-based. Don't use a zero based index`);

            const storedEntity = _self.infra.data.getScenarioEntity(entityType, entityIndex);

            if (storedEntity === undefined) throw new Error(`Cannot find ${entityDescription} ${entityType} in internal storage`);

            let entityProperty = _self.infra.utils.getPropertyRecursive(storedEntity, `entity.${propertyPath}`);
            if (entityProperty === undefined) entityProperty = _self.infra.utils.getPropertyRecursive(storedEntity, propertyPath);
            return entityProperty;
        });
        this.variableProcessors.set('date', async variable => {
            let outFormat = 'DD/MM/YYYY';

            const splitVariable = variable.split('_');
            const baseDate = splitVariable.splice(0, 1)[0].toLowerCase();

            let parsedBaseDate;

            switch (baseDate) {
                case 'today':
                case 'now':
                    parsedBaseDate = new moment();
                    break;
                default:
                    parsedBaseDate = new moment(baseDate, 'DD/MM/YYYY');
                    break;
            }

            for (let i = 0; i < splitVariable.length; i += 2) {
                const modifierValue = splitVariable[i];
                const modifierType = splitVariable[i + 1] || 'day';

                if (modifierValue === 'format') {
                    outFormat = modifierType;
                } else {
                    parsedBaseDate = parsedBaseDate.add(Number(modifierValue), modifierType);
                }
            }

            return parsedBaseDate.format(outFormat);
        });
        this.variableProcessors.set('password', async variable => {
            const splitVariable = variable.split('_');
            const [system, domain] = splitVariable.splice(0, 2);
            const user = splitVariable.join('_');

            return _self.infra.data.getUserPassword(system, domain, user);
        });
        this.variableProcessors.set('global', async variable => {
            const splitVariable = variable.split('.');
            const variableName = splitVariable.shift();
            const propertyPath = splitVariable.join('.');

            const globalVariable = this.infra.data.globalData.globalVariables[variableName];
            return this.infra.utils.getPropertyRecursive(globalVariable, propertyPath);
        });

        this.variableProcessors.set('externalparam', async variable => {
            const result = this.infra.config.externalParams[variable];
            if (result === undefined) throw new Error(`Could not get value for external param ${variable}`);
            return result;
        });
        this.variableProcessors.set('externalparams', async variable => {
            return this.variableProcessors.get('externalparam')(variable);
        });
    }
}

export {VariableProcessor, ITestable};
