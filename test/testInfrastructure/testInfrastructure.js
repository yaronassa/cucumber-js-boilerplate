/** @type {TestInfrastructure} */
let singletonTestInfrastructure;

/**
 * Infrastructure for framework meta tests
 */
class TestInfrastructure {

    /**
     * Builds the test infrastructure object tree
     * @param {AutomationInfrastructure} automationInfrastructure The real automation infrastructure tree
     */
    constructor(automationInfrastructure){
        if (singletonTestInfrastructure) {
            if (automationInfrastructure && !singletonTestInfrastructure.automationInfrastructure) singletonTestInfrastructure.automationInfrastructure = automationInfrastructure;
            return singletonTestInfrastructure;
        }
        // eslint-disable-next-line consistent-this
        if (!singletonTestInfrastructure) singletonTestInfrastructure = this;

        /** @type {AutomationInfrastructure} */
        this.automationInfrastructure = automationInfrastructure;

        /** @type {TestCucumberFacades} */
        this.testCucumberFacades = new (require('./testCucumberFacades/testCucumberFacades'))(this);
    }

}

module.exports = TestInfrastructure;