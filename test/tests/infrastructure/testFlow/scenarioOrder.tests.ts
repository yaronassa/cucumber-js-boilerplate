import {it, describe} from 'mocha';
import * as Chai from 'chai';
const expect = require('chai').expect as Chai.ExpectStatic;

import {TestUtils} from "../../../testInfra/utils";
import {TestAutomationInfrastructure} from "../../../testInfra/testClasses/TestAutomationInfrastructure";
import {getConfig} from "../../../../src/configurationManager/configurationManager";
import {CucumberResultParser} from "../../../testInfra/cucumberResultParser";

const testUtils = new TestUtils();

describe('Scenario reordering', async () => {

    let runResults: CucumberResultParser;

    before(async () => {
        const workPath = testUtils.prepareAutomationRunWorkPath();
        TestAutomationInfrastructure.destroyInstance();
        const infra = new TestAutomationInfrastructure(workPath, getConfig([`${workPath}/config/master.ts`]));

        await testUtils.runAutomation(infra, {workPath, tags: '@scenarioOrder'});
        runResults = testUtils.parseResults(workPath);
        testUtils.deleteTestDataPath(workPath);
    });

    it('Reorders @setup scenarios to be first', () => {
       expect(runResults.scenarios[0].name).to.equal('pushed to first');
    });

    it('Reorders @teardown scenarios to be last', () => {
        expect(runResults.scenarios[runResults.scenarios.length - 1].name).to.equal('pushed to last');
    });
});

