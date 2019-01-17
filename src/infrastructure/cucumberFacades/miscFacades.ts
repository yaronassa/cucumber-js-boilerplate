import {InfrastructureObject} from "../infrastructureObject";
import {ParameterTypes} from "./parameterTypes";
import {PropertyFields} from "../logic/propertyFields";

const bluebird = require('bluebird');
const path = require('path');
const fsExtra = require('fs-extra');

/**
 * Debug and internal facades
 */
class MiscFacades extends InfrastructureObject {

    // TODO:IMPLEMENT_ME - Add other misc operations

    public async writeToFile(filePath: string, content: string) {
        const resolvedFullPath = path.resolve(this.infra.workPath, 'additionalFiles', filePath);
        const realContent = await this.infra.utils.variableProcessor.processVariables(content);
        fsExtra.ensureFileSync(resolvedFullPath);
        fsExtra.appendFileSync(resolvedFullPath, realContent + '\n');
    }

    public async setGlobalVariable(variableName: string, content: string) {
        const simpleContent = await this.infra.utils.variableProcessor.processVariables(content);
        const objectContent = await this.infra.utils.variableProcessor.parseObjectVariables(content);

        const realContent = objectContent || simpleContent;

        this.infra.data.globalData.globalVariables[variableName] = realContent;
    }

    public async compareVariables(actual: string, expected: string, expectedResult: boolean) {
        return this.infra.assert.compareVariableToExpected(actual, expected, expectedResult);

    }

    public async waitForNextStepToFinish(minutes: number) {
        return this.infra.testFlowManager.waitForNextStepToFinish(minutes);
    }

    public async markNextStepsForFailure(stepCount: number, mustFail: boolean = true, errorMessage?: string) {
        if (errorMessage) errorMessage = errorMessage.match(/^ *"?(.+?)"? *$/)[1];
        return this.infra.testFlowManager.markStepsForFailure(stepCount, mustFail, errorMessage);
    }

}

export {MiscFacades};
