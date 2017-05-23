let {defineSupportCode} = require('cucumber');

/**
 * General purpose demo steps
 * @type {{Given : function(RegExp, function), call: function}}
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


    /**
     * @cucumber-id prerequisite-demo
     * @cucumber-rule {step-prerequisite} postrequisite-demo
     */
    this.Given(/^This step has a prerequisite$/,
        /**
         * Demonstrates a step with a prerequisite
         */
        function () {
            return this.facades.demo.general.emptyStep();
        });

    /**
     * @cucumber-id postrequisite-demo
     * @cucumber-rule {step-postrequisite} prerequisite-demo
     */
    this.Given(/^This step has a postrequisite$/,
        /**
         * Demonstrates a step with a postrequisite
         */
        function () {
            return this.facades.demo.general.emptyStep();
        });
};


defineSupportCode(function(cucumberCore){
    //For intellij cucumber auto-complete
    return demoGeneralSteps.call(cucumberCore);
});
