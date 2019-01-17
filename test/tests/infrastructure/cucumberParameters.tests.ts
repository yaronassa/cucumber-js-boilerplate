import {it, describe} from 'mocha';
import * as Chai from 'chai';
const expect = require('chai').expect as Chai.ExpectStatic;

import {TestUtils} from "../../testInfra/utils";
import {TestAutomationInfrastructure} from "../../testInfra/testClasses/TestAutomationInfrastructure";
import {getConfig} from "../../../src/configurationManager/configurationManager";
import {CucumberResultParser} from "../../testInfra/cucumberResultParser";

const testUtils = new TestUtils();

describe('Cucumber Parameters', async () => {
    const workPath = testUtils.prepareAutomationRunWorkPath();
    TestAutomationInfrastructure.destroyInstance();
    const infra = new TestAutomationInfrastructure(workPath, getConfig([`${workPath}/config/master.ts`]));

    let runResults: CucumberResultParser;

    before(async () => {
        await testUtils.runAutomation(infra, {workPath, tags: '@cucumberParameters'});
        runResults = testUtils.parseResults(workPath);
        testUtils.deleteTestDataPath(workPath);
    });

    it('Correctly uses property fields parameters', () => {
        const propertyFieldsScenario = runResults.getScenario('Property fields parameter');
        expect(runResults.getScenarioStatus(propertyFieldsScenario)).to.equal('passed');
    });

    it('Correctly uses entity parameters', () => {
        const propertyFieldsScenario = runResults.getScenario('Entity parameter');
        expect(runResults.getScenarioStatus(propertyFieldsScenario)).to.equal('passed');
    });

});

