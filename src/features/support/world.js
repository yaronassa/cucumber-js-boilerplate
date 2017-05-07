let infrastructure = new (require('../../infrastructure/automationInfrastructure'))();

/**
 * Custom cucumber world to be available in the step definitions
 * @constructor
 */
function CucumberWorld() {
    /** @type {CucumberFacades} */
    this.facades = infrastructure.cucumberFacades;
}

module.exports = function() {
    //noinspection JSUnresolvedVariable
    this.World = CucumberWorld;
};