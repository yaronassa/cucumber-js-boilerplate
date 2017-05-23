let infrastructure = new (require('../../../src/infrastructure/automationInfrastructure'))();
let testInfrastructure = new (require('../../testInfrastructure/testInfrastructure'))(infrastructure);

let {defineSupportCode} = require('cucumber');

/**
 * Custom test cucumber world to be available in the step definitions
 * @constructor
 */
function TestCucumberWorld() {
    /** @type {TestCucumberFacades} */
    this.testFacades = testInfrastructure.testCucumberFacades;
}

defineSupportCode(function({setWorldConstructor}) {
    setWorldConstructor(TestCucumberWorld);
});

