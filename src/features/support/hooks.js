let {defineSupportCode} = require('cucumber');
let infrastructure = new (require('../../infrastructure/automationInfrastructure'))();

defineSupportCode(function(cucumberHookHandler) {
    infrastructure.testFlow.mapCucumberHooks(cucumberHookHandler);
});
