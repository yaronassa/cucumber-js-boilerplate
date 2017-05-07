/**
 * Shared, misc steps
 * @type {{Given : function(RegExp, function)}}
 */
let sharedSteps = function () {

    this.Given(/^The next (\d+)? *steps? (should|must|may) fail(?: with (.+?))?$/i,
        /**
         * Mark the next N steps to fail
         * @param {string|number} [stepCount=1] How many steps are expected to fail
         * @param {string|boolean} [mustFail=true] Fail the test if the step doesn't fail
         * @param {string} [errorMessage] Expected error message
         * @this {CucumberWorld}
         */
        function (stepCount, mustFail, errorMessage) {
            if (stepCount === undefined) stepCount = 1;
            mustFail = (!mustFail.match(/may/i));
            return this.facades.shared.given.markNextStepsForFailure(stepCount, mustFail, errorMessage);
        });
};

module.exports = sharedSteps;