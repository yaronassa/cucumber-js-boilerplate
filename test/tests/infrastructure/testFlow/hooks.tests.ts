import {it, describe} from 'mocha';
import * as Chai from 'chai';
const expect = require('chai').expect as Chai.ExpectStatic;
const sinon = require('sinon');
const path = require('path');

import {TestUtils} from "../../../testInfra/utils";
import {TestAutomationInfrastructure} from "../../../testInfra/testClasses/TestAutomationInfrastructure";
import {getConfig} from "../../../../src/configurationManager/configurationManager";
import {SinonSpy} from "sinon";
import {CucumberResultParser} from "../../../testInfra/cucumberResultParser";

const testUtils = new TestUtils();

describe('Cucumber Hooks', async () => {

    const hooks = ['beforeRun', 'beforeAllScenarios', 'beforeScenario', 'beforeStep', 'afterStep', 'afterScenario', 'afterAllScenarios', 'afterRun'];

    const spies: {[hookName: string]: SinonSpy} = {};
    let runResults: CucumberResultParser;

    before(async () => {
        const workPath = testUtils.prepareAutomationRunWorkPath();
        TestAutomationInfrastructure.destroyInstance();
        const infra = new TestAutomationInfrastructure(workPath, getConfig([`${workPath}/config/master.ts`]));

        hooks.forEach(hookName => spies[hookName] = sinon.spy(TestAutomationInfrastructure.getInstance().testFlowManager.hooksManager, hookName));
        await testUtils.runAutomation(infra, {workPath, tags: '@hooks'});
        runResults = testUtils.parseResults(workPath);

        testUtils.deleteTestDataPath(workPath);
    });

    it('Calls beforeRun, beforeAllScenarios, afterAllScenarios, afterRun only once', () => {
        expect(spies.beforeRun).to.be.calledOnce;
        expect(spies.beforeAllScenarios).to.be.calledOnce;
        expect(spies.afterAllScenarios).to.be.calledOnce;
        expect(spies.afterRun).to.be.calledOnce;
    });

    it('Calls BeforeScenario, afterScenario once for each scenario', () => {
        expect(spies.beforeScenario.callCount).to.equal(runResults.scenarios.length);
        expect(spies.afterScenario.callCount).to.equal(runResults.scenarios.length);
    });

    it('Calls beforeStep, afterStep once for each step, failed or passed', () => {

        expect(spies.beforeStep.callCount).to.equal(runResults.stepCounts.total);
        expect(spies.afterStep.callCount).to.equal(runResults.stepCounts.total);
        expect(runResults.stepCounts.failed).to.be.greaterThan(0);
    });

    it('Runs hooks in correct order', async () => {
        hooks.forEach((hookName, index, arr) => {
           if (arr[index + 1] === undefined) return;
           expect(spies[arr[index]]).to.calledBefore(spies[arr[index + 1]]);
        });
    });
});

