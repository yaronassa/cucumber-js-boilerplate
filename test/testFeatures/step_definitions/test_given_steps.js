/**
 * Shared given steps
 * @type {{Given : function(RegExp, function)}}
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

};

module.exports = testGivenStepDefinitions;