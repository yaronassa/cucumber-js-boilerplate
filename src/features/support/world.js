//Exposes infrastructure facades in cucumber world object

let {defineSupportCode} = require('cucumber');
let infrastructure = new (require('../../infrastructure/automationInfrastructure'))();

/**
 * Custom cucumber world to be available in the step definitions
 * @constructor
 */
function CucumberWorld() {
    /** @type {CucumberFacades} */
    this.facades = infrastructure.cucumberFacades;
}

defineSupportCode(function({setWorldConstructor}) {
    setWorldConstructor(CucumberWorld);
});
