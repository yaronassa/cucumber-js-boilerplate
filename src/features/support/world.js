//Exposes infrastructure facades in cucumber world object

let {defineSupportCode} = require('cucumber');
let infrastructure = new (require('../../infrastructure/automationInfrastructure'))();

/**
 * Custom cucumber world to be available in the step definitions
 * @param {function(string, string)} attach
 * @constructor
 */
function CucumberWorld({attach}) {
    /** @type {CucumberFacades} */
    this.facades = infrastructure.cucumberFacades;
    this.attach = attach;
}

defineSupportCode(function({setWorldConstructor}) {
    setWorldConstructor(CucumberWorld);
});
