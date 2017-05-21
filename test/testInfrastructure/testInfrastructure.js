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
        /** @type {TestCucumberParser} */
        this.cucumberParser = new (require('./testCucumberParser/testCucumberParser'))(this);
        /** @type {TestRulesValidator} */
        this.rulesValidator = new (require('./testRulesValidator/testRulesValidator'))(this);
        /** @type {TestUtils} */
        this.utils = new (require('./testUtils/testUtils'))(this);
        /** @type {TestHookManager} */
        this.hookManager = new (require('./testHookManager/testHookManager'))(this);
    }
    
    

}

module.exports = TestInfrastructure;