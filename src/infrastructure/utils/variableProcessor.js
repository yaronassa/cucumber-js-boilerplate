'use strict';


/**
 * @typedef {object} Testable
 * @property {function(object):boolean} test
 * @property {function():string} toString
 */

/**
 * @typedef {object} TestableOptions
 * @property {boolean} [partial=false]
 * @property {boolean} [trim=true]
 * @property {boolean} [ignoreCase=true]
 */

let moment = require('moment');

/**
 * Processes ${} variables in strings
 */
class VariableProcessor{
    /**
     * @param {AutomationInfrastructure} infra The automation infrastructure
     * @returns {VariableProcessor}
     */
    constructor(infra){
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
        
        let _self = this;
        
        let generatedIDs = {
            math: 0,
            random: 0
        };


        //noinspection JSUnusedGlobalSymbols - Called dynamically
        this._variableProcessors = {
            this(variable){
                let splitVariable = variable.split('.');
                splitVariable[0] = splitVariable[0] + '_this';
                return _self._variableProcessors.createdentities(splitVariable.join('.'));
            },
            '='(variable){
                if (!variable.match(/^[\d+\-*()/ ]+$/)) throw new Error(`Cannot parse variable into math equation: ${variable}`);
                // eslint-disable-next-line no-eval
                let result = eval(variable);

                let reference = {
                    created: true,
                    type: 'math',
                    entity: result.toString(),
                    rawSources: {api: result.toString()},
                    query: {queryProps: infra.utils.parser.parseFieldPairs(`equation=${variable}`)},
                    history:[]
                };
                
                _self._infra.data.updateDataWithNewEntity({
                    id: generatedIDs.math.toString(),
                    entityType: 'math',
                    result: result.toString(),
                    calculation: variable
                });
                
                generatedIDs.math = generatedIDs.math + 1;

                return result.toString();

            },
            random(variable){
                let splitVariable = variable.split('_');
                let min = parseInt(splitVariable[0] || 1);
                let max = parseInt(splitVariable[1] || 50);

                if (isNaN(max) || isNaN(min)) throw new Error(`Cannot parse min/max numbers for ${variable}`);

                let result = Math.floor(Math.random()*(max-min))+min;

                _self._infra.data.updateDataWithNewEntity({
                    id: generatedIDs.random.toString(),
                    entityType: 'random',
                    result: result.toString(),
                    min,
                    max
                });

                generatedIDs.random = generatedIDs.random + 1;

                return result.toString();

            },
            createdentities(variable){
                let splitVariable = variable.split('_');
                let entityType = splitVariable.splice(0,1)[0];
                let canonizedEntityType = infra.logic.entities.getCanonizedEntityType(entityType);

                if (canonizedEntityType === undefined) throw new Error(`Cannot recognize entity type "${entityType}"`);

                let variableDescriptor = splitVariable.join('_').split('.');
                let entityIdentifier = variableDescriptor.splice(0,1)[0];

                let storedEntity = infra.logic.entities.entityFromStoreDescription(canonizedEntityType, entityIdentifier);

                if (storedEntity === undefined) throw new Error(`Cannot find ${entityIdentifier} ${entityType} in internal storage`);

                return infra.utils.getPropertyRecursive(storedEntity, variableDescriptor.join('.'));
            },
            date(variable){
                let outFormat = 'DD/MM/YYYY';

                let splitVariable = variable.split('_');
                let baseDate = splitVariable.splice(0,1)[0].toLowerCase();

                let parsedBaseDate;

                switch (baseDate){
                    case 'today':
                    case 'now':
                        parsedBaseDate = new moment();
                        break;
                    default:
                        parsedBaseDate = new moment(baseDate, 'DD/MM/YYYY');
                        break;
                }

                for (let i = 0; i < splitVariable.length; i+=2){
                    let modifierValue = splitVariable[i];
                    let modifierType = splitVariable[i+1] || 'day';

                    if (modifierValue === 'format') {
                        outFormat = modifierType;
                    } else {
                        parsedBaseDate = parsedBaseDate.add(parseInt(modifierValue), modifierType);
                    }
                }

                return parsedBaseDate.format(outFormat);

            }
        };
    }


    /**
     * Expands variables in string values
     * @param {string} value The original value
     * @returns {string} The expanded result
     */
    parseVariables(value){

        let result = value;
        let variableStart = [];
        let i=0;
        while (i<result.length){
            if (result[i] === '$' && i<result.length-1 && result[i+1] === '{' && (i===0 || result[i-1] !== '\\')) {
                variableStart.push(i);
            }

            if (result[i] === '}' && (i===0 || result[i-1] !== '\\')){
                let start = variableStart.pop();
                if (start !== undefined){
                    let variableToProcess = result.substr(start, i-start+1);
                    let modifiedOptions = this.extractValueOptions(variableToProcess);
                    let processResult = (modifiedOptions) ? variableToProcess : this._processVariableValue(variableToProcess).toString();

                    result = result.substring(0, start) + processResult + result.substring(i+1);
                    i += processResult.length - variableToProcess.length;

                }
            }

            i = i+1;
        }

        return result;
    }

    /**
     * Transforms special variables into objects
     * @param {string} value The variable value enclosure
     * @returns {object|array|string[]}
     */
    parseObjectVariables(value){
        let innerValue = value.replace(/\$\{(.+)}/g, '$1');

        if (innerValue.match(/^\[.*]$/)){ //array
            return this._infra.utils.parser.safeSplit(innerValue.replace(/^\[(.*)]$/, '$1'), ',').map(item => item.trim())
                .filter(item => item.trim() !== '');
        }
        if (innerValue.match(/^\/.+?\/[igm]*$/)){ //regexp
            let regexpParts = innerValue.match(/^\/(.+?)\/([igm]*)$/);
            return new RegExp(regexpParts[1], regexpParts[2] || '');
        }

        return undefined;
    }

    /**
     * Actually processes a given variable
     * @param {string} variableEnclosure The variable wrapped in ${}
     * @returns {string} The processed result
     * @private
     */
    _processVariableValue(variableEnclosure){
        let variableContent = variableEnclosure.replace(/^\$\{(.*)}$/, '$1');
        let splitVariable = variableContent.split('_');
        let type = splitVariable.splice(0,1)[0].toLowerCase();

        if (this.parseObjectVariables(variableContent)) return variableEnclosure;

        if (!this._variableProcessors[type]) {
            throw new Error('Cannot find variable processor for ' + type);
        }

        return this._variableProcessors[type].call(this, splitVariable.join('_'));
    }

    /**
     * Parses a value modifier options (ignoreCase, trim, partial, etc.)
     * @param {string} value The value to parse
     * @returns {{innerValue: string, options: TestableOptions}|undefined}
     */
    extractValueOptions(value){
        let options = value.match(/\$\{(!)?(ignoreCase|trim|partial|contains?):(.+)}/i);
        if (options) {
            let optionToggle = (options[1] === undefined);
            let optionName = options[2];
            let innerValue = options[3];
            switch (optionName.toLowerCase()){
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

            let result = {innerValue, options : {}};
            result.options[optionName] = optionToggle;

            return result;
        }
    }

    /**
     * Returns a comparison variable object for the given value
     * @param {string} value
     * @param {TestableOptions} [options]
     * @returns {Testable} An object with .test and .toString
     */
    getTestable(value, options){
        let _self = this;
        if (!options) options = {ignoreCase : false, trim : true, partial : false};

        let modifiedOptions = this.extractValueOptions(value);
        if (modifiedOptions) return this.getTestable(modifiedOptions.innerValue, Object.assign(options, modifiedOptions.options));

        let parsedValue = this.parseVariables(value);
        let objectValue = this.parseObjectVariables(parsedValue) || parsedValue;

        return {
            test(target){
                if (target === null || target === undefined) return (parsedValue === null || parsedValue === undefined || parsedValue === '');

                //TODO: add support for regexp and other variables

                let compareSource = (target instanceof Object || objectValue instanceof RegExp) ? objectValue : parsedValue;

                //String comparison as default last result
                return _self._compareTestableWithOptions(compareSource, target, options);
            },
            toString(){
                if (objectValue) return JSON.stringify(objectValue);
                return parsedValue.toString();
            }
        };
    }

    /**
     * Compares a source value to a target given the relevant options
     * @param {object|string|Array} source
     * @param {object|string|Array} target
     * @param {TestableOptions} options
     * @returns {boolean} The comparison result
     * @private
     */
    _compareTestableWithOptions(source, target, options){
        let _self = this;
        let compareSource = source;
        let compareTarget = target;

        if (typeof compareTarget === 'string' || typeof compareTarget === 'number') {
            compareTarget = compareTarget.toString();

            if (compareSource instanceof RegExp ) return compareSource.test(compareTarget);

            compareSource = compareSource.toString();
            if (options.ignoreCase) {compareSource = compareSource.toLowerCase(); compareTarget = compareTarget.toLowerCase();}
            if (options.trim) {compareSource = compareSource.trim(); compareTarget = compareTarget.trim();}

            return (options.partial) ? (compareTarget.indexOf(compareSource) >= 0) : (compareSource == compareTarget);
        }

        if (Array.isArray(target)){
            if (!Array.isArray(compareSource)) compareSource = [compareSource];
            let result = compareSource.every(item => compareTarget.some(compareValue => _self._compareTestableWithOptions(item, compareValue, {})));
            if (!options.partial) result = (result && (compareTarget.length === compareSource.length));
            return result;
        }

        //TODO: add regexp, and others
    }

}

module.exports = VariableProcessor;