//Wraps all step definition functions in infrastructure pipeline processing

let infrastructure = new (require('../../infrastructure/automationInfrastructure'))();
let {defineSupportCode} = require('cucumber');

defineSupportCode(function({setDefinitionFunctionWrapper}) {
    setDefinitionFunctionWrapper(fn => infrastructure.testFlow.metaHelpers.wrapCucumberStep(fn));
});