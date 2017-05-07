/**
 * Steps for debugging
 * @type {{Given : function(RegExp, function), Then : function(RegExp, function), When : function(RegExp, function), And : function(RegExp, function)}}
 */
let sharedGivenStepDefinitions = function () {

    this.Given(/^Eval code (.+)$/,
        /**
         * Evaluates raw user code
         * @param {string} userCode The raw user code
         * @this {CucumberWorld}
         */
        function evalUserCode(userCode) {
            return this.facades.debug.evalUserCode(userCode);
        });
};

module.exports = sharedGivenStepDefinitions;