/**
 * General purpose demo steps
 * @type {{Given : function(RegExp, function)}}
 */
let demoGeneralSteps = function () {

    this.Given(/^I fail this step(?: with error: (.+))?$/i,
        /**
         * Demonstrate failing a step
         * @param {string} error Error message to fail with
         * @this {CucumberWorld}
         */
        function failStep(error) {
            return this.facades.demo.general.failStep(error);
        });

};

module.exports = demoGeneralSteps;