/**
 * Demo steps for variable examples
 * @type {{Given : function(RegExp, function)}}
 */
let demoVariablesSteps = function () {


    this.Given(/^I print (.+)$/,
        /**
         * Prints a value to the log
         * @param {string} value The simple value / variable to print
         * @this {CucumberWorld}
         */
        function printValue(value) {
            return this.facades.demo.variables.printValue(value);
        });

    this.Given(/^I compare (.+?) with (.+)$/,
        /**
         * Compare two values
         * @param {string} varA Source value
         * @param {string} varB Comparison target
         * @this {CucumberWorld}
         */
        function compareValues(varA, varB) {
            return this.facades.demo.variables.compareValues(varA, varB);
        });
};

module.exports = demoVariablesSteps;