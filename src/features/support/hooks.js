let infrastructure = new (require('../../infrastructure/automationInfrastructure'))();

/**
 * Connects cucumber events to the automation infrastructure
 * @this {{registerHandler: function}}
 */
let automationInfraHook = function () {
    infrastructure.testFlow.mapCucumberHooks(this);
};

module.exports = automationInfraHook;