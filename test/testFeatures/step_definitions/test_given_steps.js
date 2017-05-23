let {defineSupportCode} = require('cucumber');

/**
 * Shared given steps
 * @type {{Given : function(RegExp, function), call: funciton}} cucumberCore
 */
let testGivenStepDefinitions = function () {

    this.Given(/^I run a test step$/,
        /** @this {TestCucumberWorld} */
        function demoGivenStep() {
            return this.testFacades.testDemoGivenStep();
        });

    this.Given(/^All (.+?)? *files in (.+?) (do(?:n't| not))? *contains? the string: (.+?)$/,
        /** @this {TestCucumberWorld} */
        function (fileMatcher, path, expectedResult, stringMatcher) {
            expectedResult = (expectedResult === undefined);
            if (fileMatcher === undefined) fileMatcher = '${/.+/i}';
            return this.testFacades.evalInfrastructureFiles(fileMatcher, path, stringMatcher, expectedResult);
        });


    this.Given(/^All (?:scenarios|features) in (.+?) adhere to (.+?) rule$/,
        /** @this {TestCucumberWorld} */
        function (path, rule) {
            return this.testFacades.validateRule(path, rule);
        });
};


defineSupportCode(function(cucumberCore){
    //For intellij cucumber auto-complete
    return testGivenStepDefinitions.call(cucumberCore);
});
