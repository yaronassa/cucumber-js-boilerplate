// eslint-disable-next-line no-unused-vars
let testInfrastructure = new (require('../../testInfrastructure/testInfrastructure'))();

/**
 * Connects cucumber events to the automation infrastructure
 * @this {{registerHandler: function}}
 */
let automationInfraHook = function () {
    //TODO: manage hooks if needed
};

module.exports = automationInfraHook;