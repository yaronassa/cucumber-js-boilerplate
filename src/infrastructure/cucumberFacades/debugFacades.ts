import {InfrastructureObject} from "../infrastructureObject";
import {ParameterTypes} from "./parameterTypes";
import {PropertyFields} from "../logic/propertyFields";

const bluebird = require('bluebird');
const path = require('path');
const fsExtra = require('fs-extra');

/**
 * Debug and internal facades
 */
class DebugFacades extends InfrastructureObject {

    public async demoStep(stepProperties: {async: boolean, failed: boolean, skipped: boolean}) {
        this.log(`Executing demo step with properties = ${JSON.stringify(stepProperties)}`);
        if (stepProperties.async) await bluebird.delay(2000);
        if (stepProperties.failed) throw new Error('This is a failed step');

        // TODO: handle skipped
    }

    public async printVariable(variable) {
        const processed = await this.infra.utils.variableProcessor.processVariables(variable);
        this.log(processed);
    }

    public async evalCode(userCode: string) {
        if (this.infra.config.utils.debug.warnOnCodeEval) this.log('ERROR: DEBUG STEP - SHOULD NEVER BE USED IN PRODUCTION');

        const $ = this.infra;
        return bluebird.try(() => {
            // tslint:disable-next-line:prefer-const
            let userCodeResult;
            // tslint:disable-next-line:no-eval
            let result = eval(userCode);
            if (userCodeResult !== undefined) result = userCodeResult;
            return result;
        }).catch(e => {
            throw new Error('Error running user code ' + e.toString());
        });
    }

}

export {DebugFacades};
