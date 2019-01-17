import {it, describe} from 'mocha';
import * as Chai from 'chai';
const expect = require('chai').expect as Chai.ExpectStatic;

import {TestAutomationInfrastructure} from "../../testInfra/testClasses/TestAutomationInfrastructure";

describe('Automation Infrastructure Lifecycle', () => {
    beforeEach(() => TestAutomationInfrastructure.destroyInstance());

    it('Must be created via the new keyword', () => {
        let reportedMessage = '';
        const oldConsoleError = console.error;
        console.error = message => reportedMessage = reportedMessage + '\n' + message;

        try {
            const infra = TestAutomationInfrastructure.getInstance();
            expect(infra).to.be.undefined;
            expect(reportedMessage).to.match(/No infrastructure instance\. Have you initiated it before calling cucumber?/);
        } finally {
            console.error = oldConsoleError;
        }
    });

    it('Cannot be created more than once', () => {
        const infra = new TestAutomationInfrastructure('', {});
        expect(() =>  new TestAutomationInfrastructure('', {})).to.throw('Attempted to create Automation infrastructure more than once');
    });

    it('Returns the infrastructure singleton instance correctly', () => {
        const infra = new TestAutomationInfrastructure('', {});
        const infra2 = TestAutomationInfrastructure.getInstance();
        const infra3 = TestAutomationInfrastructure.getInstance();

        expect(infra).to.equal(infra2);
        expect(infra).to.equal(infra3);
    });
});