let {defineSupportCode} = require('cucumber');

/**
 * Steps for debugging
 * @type  {{Given : function(RegExp, function), call: function}} cucumberCore
 */
let sharedGivenStepDefinitions = function () {


    this.defineParameterType({
        regexp: /baby/,
        typeName: 'baby',
        transformer(value){
            return value + value + value;
        }
    });


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


defineSupportCode(function(cucumberCore){
    //For intellij cucumber auto-complete
    return sharedGivenStepDefinitions.call(cucumberCore);
});

