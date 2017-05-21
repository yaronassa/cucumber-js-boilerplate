// eslint-disable-next-line no-unused-vars
let Promise = require('bluebird');

/**
 * Engine for validating step and scenario rules
 */
class TestHookManager {
    /**
     * @param {TestInfrastructure} testInfra
     * @returns {TestHookManager}
     */
    constructor(testInfra){
        this._testInfra = testInfra;
        
        this._testHooksHandlers = {
            BeforeFeatures(){
                return testInfra.cucumberParser.beforeFeaturesActions();
            }

        };
    }


    /**
     * Maps the cucumber hooks to the test infrastructure
     * @param {{registerHandler: function(string, object, function)}} hooksManager cucumber's registerHandler function
     */
    mapTestCucumberHooks(hooksManager){
        let standardHookOptions = {timeout : 30 * 60 * 1000};
        let specificHookOptions = {After : {timeout: 30 * 60 * 1000}};

        let _self = this;

        Object.keys(this._testHooksHandlers).forEach(hookName => {
            let options = specificHookOptions[hookName] || standardHookOptions;
            hooksManager.registerHandler(hookName, options, _self._testHooksHandlers[hookName]);
        });
    }
    
}

module.exports = TestHookManager;