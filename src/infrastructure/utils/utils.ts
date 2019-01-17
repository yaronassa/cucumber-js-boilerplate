import {InfrastructureObject} from "../infrastructureObject";
import {Logger} from "./logger";
import {Parser} from "./parser";
import {VariableProcessor} from "./variableProcessor";
import {PropertyFields} from "../logic/propertyFields";

const bluebird = require('bluebird');

class Utils extends InfrastructureObject {
    public readonly logger: Logger;
    public readonly parser: Parser = new Parser();
    public readonly variableProcessor: VariableProcessor = new VariableProcessor();

    constructor() {
        super();
        this.logger = new Logger();
    }

    // TODO:IMPLEMENT_ME - add your own util classes

    public async filterArrayByProps(source: any[], filters: PropertyFields): Promise<any[]> {
        if (source === undefined) throw new Error('Cannot filter undefined source');
        if (!Array.isArray(source)) throw new Error('Cannot filter non-array source');

        if (filters === undefined) return source;

        const positionFilter = filters.removeField('#');

        const tests = await bluebird.map(filters,  filter => this.infra.utils.variableProcessor.getTestable(filter));

        if (positionFilter) {
            const position = Number(positionFilter.fieldValue.replace('-', ''));
            const startSlice = (positionFilter.fieldValue.startsWith('-') ? source.length - position : position - 1);
            source = source.slice(startSlice, startSlice + 1);
        }

        return source.filter(item => tests.every(test => {
            const target = this.infra.utils.getPropertyRecursive(item, test.field.fieldName);
            return test.test(target);
        }));
    }

    public getPropertyRecursive(obj: any, path: string | string[]): any {
        if (path === undefined) return undefined;
        if (obj === undefined) return undefined;

        if (Array.isArray(path)) {
            path = [].concat(path);
        } else {
            path = path.split(/[.[]/);
        }

        if (path.length === 0 || path.length === 1 && path[0] === '') return obj;

        let currentPath = path.splice(0, 1)[0].trim();
        if (/^.*]$/.test(currentPath)) currentPath = currentPath.substr(0, currentPath.length - 1);

        let isFunc = false;
        if (/^.*\(\)$/.test(currentPath)) {
            currentPath = currentPath.substr(0, currentPath.length - 2);
            isFunc = true;
        }

        let result = obj[currentPath];
        if (isFunc) result = result.call(obj);

        return this.getPropertyRecursive(result, path);
    }

    public async waitAndRetryAction(actionFunction: () => Promise<any>, timeout: number, interval: number = 1000, start: number = Date.now()) {

        try {
            const result = await actionFunction();
            return result;
        } catch (e) {
            if (Date.now() - start > timeout) throw new Error(`Action didn't complete, even after ${Math.floor(timeout / 1000)}s:\n${e.message}`);
            await bluebird.delay(interval);
            return this.waitAndRetryAction(actionFunction, timeout, interval, start);

        }
    }
}

export {Utils};
