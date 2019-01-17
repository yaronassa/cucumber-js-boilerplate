import {it, describe} from 'mocha';
import * as Chai from 'chai';
const expect = require('chai').expect as Chai.ExpectStatic;
const sinon = require('sinon');
const path = require('path');

import {TestUtils} from "../../../testInfra/utils";
import {TestAutomationInfrastructure} from "../../../testInfra/testClasses/TestAutomationInfrastructure";
import {getConfig} from "../../../../src/configurationManager/configurationManager";
import {CucumberResultParser} from "../../../testInfra/cucumberResultParser";

const testUtils = new TestUtils();

describe('MarkNextStepForFailure', async () => {

    let runResults: CucumberResultParser;

    before(async () => {
        const workPath = testUtils.prepareAutomationRunWorkPath();
        TestAutomationInfrastructure.destroyInstance();
        const infra = new TestAutomationInfrastructure(workPath, getConfig([`${workPath}/config/master.ts`]));


        await testUtils.runAutomation(infra, {workPath, tags: '@markNextStepForFailure'});
        runResults = testUtils.parseResults(workPath);
        testUtils.deleteTestDataPath(workPath);
    });

    it('Accepts passed/failed step when using the "may" syntax', () => {
        const mayScenario = runResults.scenarios.find(scenario => scenario.name === 'Test may fail functionality');
        expect(mayScenario.steps.every(step => step.result.status === 'passed'));
    });

    it('Doesnt accept passed step when using the "must" syntax', () => {
        const mayScenario = runResults.getScenario('Test must fail functionality - fail');
        expect(mayScenario.steps.every(step => step.result.status === 'failed'));
    });

    it('Does not accept passed step when using the "must" syntax', () => {
        const failedMustScenario = runResults.getScenario('Test must fail functionality - fail');
        expect(runResults.getScenarioStatus(failedMustScenario)).to.equal('failed');

        const passedMustScenario = runResults.getScenario('Test must fail functionality - pass');
        expect(runResults.getScenarioStatus(passedMustScenario)).to.equal('passed');
    });

    it('Can validate the error message', () => {
        const failedMustScenario = runResults.getScenario('Test fail message functionality - fail');
        expect(runResults.getScenarioStatus(failedMustScenario)).to.equal('failed');

        const passedMustScenario = runResults.getScenario('Test fail message functionality - pass');
        expect(runResults.getScenarioStatus(passedMustScenario)).to.equal('passed');
    });

    it('Can mark multiple steps correctly', () => {
        const failedMustScenario = runResults.getScenario('Test multiple fail functionality - fail');
        expect(runResults.getScenarioStatus(failedMustScenario)).to.equal('failed');

        const passedMustScenario = runResults.getScenario('Test multiple fail functionality - pass');
        expect(runResults.getScenarioStatus(passedMustScenario)).to.equal('passed');
    });

});

