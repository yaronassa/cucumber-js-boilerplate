let testInfrastructure = new (require('../../testInfrastructure/testInfrastructure'))();

let {defineSupportCode} = require('cucumber');

defineSupportCode(function(cucumberHookHandler) {
    testInfrastructure.hookManager.mapTestCucumberHooks(cucumberHookHandler);
});

