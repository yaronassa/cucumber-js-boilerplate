let infrastructure = new (require('../../../src/infrastructure/automationInfrastructure'))();
let testInfrastructure = new (require('../../testInfrastructure/testInfrastructure'))(infrastructure);

/**
 * Custom test cucumber world to be available in the step definitions
 * @constructor
 */
function TestCucumberWorld() {
    /** @type {TestCucumberFacades} */
    this.testFacades = testInfrastructure.testCucumberFacades;
}

module.exports = function() {
    //noinspection JSUnresolvedVariable
    this.World = TestCucumberWorld;
};