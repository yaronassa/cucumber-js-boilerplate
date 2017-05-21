let testInfrastructure = new (require('../../testInfrastructure/testInfrastructure'))();

/**
 * Connects cucumber events to the automation infrastructure
 * @this {{registerHandler: function}}
 */
let automationInfraHook = function () {
    testInfrastructure.hookManager.mapTestCucumberHooks(this);
};

module.exports = automationInfraHook;