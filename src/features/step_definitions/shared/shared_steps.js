let {defineSupportCode} = require('cucumber');


/**
 * Shared, misc steps
 * @type {{Given : (function(RegExp, function)|function(RegExp, object, function)), call: function}}
 */
let sharedSteps = function () {

    this.Given(/^The next (\d+)? *steps? (should|must|may) fail(?: with (.+?))?$/i,
        /**
         * Mark the next N steps to fail
         * @param {number|NaN} [stepCount=1] How many steps are expected to fail
         * @param {string|boolean} [mustFail=true] Fail the test if the step doesn't fail
         * @param {string} [errorMessage] Expected error message
         * @this {CucumberWorld}
         */
        function (stepCount, mustFail, errorMessage) {
            if (stepCount === undefined || isNaN(stepCount)) stepCount = 1;
            mustFail = (!mustFail.match(/may/i));
            return this.facades.shared.given.markNextStepsForFailure(stepCount, mustFail, errorMessage);
        });
};

defineSupportCode(function(cucumberCore){
    //For intellij cucumber auto-complete
    return sharedSteps.call(cucumberCore);
});

module.exports = sharedSteps;