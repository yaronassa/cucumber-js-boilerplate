import {InfrastructureObject} from "../infrastructureObject";
import {AssertEntities} from "./entities";
import {IPropertyField, PropertyFields} from "../logic/propertyFields";
const bluebird = require('bluebird');

interface IMismatchResult {
    result: boolean,
    mismatches: Array<{fieldName: string, expected: string, actual: string}>
}

class Assert extends InfrastructureObject {
    public readonly entities = new AssertEntities();

    public async compareObjectToExpectedSpec(actual: any, expectedSpec: PropertyFields): Promise<IMismatchResult> {
        const _self = this;
        const result = {result : true, mismatches: []};

        await bluebird.each(expectedSpec, async (expectedField: IPropertyField) => {
            const fieldName = expectedField.fieldName;
            const actualValue = _self.infra.utils.getPropertyRecursive(actual, expectedField.fieldName);
            const test = await _self.infra.utils.variableProcessor.getTestable(expectedField);

            // TODO:IMPLEMENT_ME - Add more advanced comparisons
            if (!test.test(actualValue)) {
                result.result = false;
                result.mismatches.push({fieldName, expected: test.toString(), actual: JSON.stringify(actualValue)});
            }
        });

        return result;
    }

    public async compareVariableToExpected(expected: string, actual: string, expectedResult: boolean) {
        const processedActual = await this.infra.utils.variableProcessor.processVariables(actual);
        const processedExpected = await this.infra.utils.variableProcessor.processVariables(expected);

        if (expectedResult) {
            if (processedActual !== processedExpected) {
                throw new Error(`Expected ${expected} (${processedExpected}) to equal ${processedActual}, but it didn't`);
            }
        } else {
            if (processedActual === processedExpected) {
                throw new Error(`Expected ${expected} (${processedExpected}) NOT to equal ${processedActual}, but it`);
            }
        }

    }
}

export {Assert};
