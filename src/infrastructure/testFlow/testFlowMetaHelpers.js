let Promise = require('bluebird');

/**
 * Helpers for manipulating the test flow and meta-functions
 */
class TestFlowMetaHelpers {

    /**
     * @param {AutomationInfrastructure} infra The automation infrastructure
     * @returns {TestFlowMetaHelpers}
     */
    constructor(infra){
        this._infra = infra;
    }

    /**
     * Returns all infrastructure automation facade objects
     * @param {object} [root] Current search root
     * @returns {object[]} All the harvested facade objects
     * @private
     */
    _harvestFacades(root){
        let _self = this;
        
        if (root === undefined) root = this._infra.cucumberFacades;
        
        let properties = Object.getOwnPropertyNames(root).map(propName => root[propName]).filter(prop => prop !== undefined && prop._infra !== undefined);
        
        return [root].concat(properties.reduce((acc, prop) => acc.concat(_self._harvestFacades(prop)), []));
        
    }

    /**
     * Wraps all automation facades in the given apply function
     * @param {function(target: function, thisArg: object, args: object[]):Promise} applyFunction Function for the proxy apply
     * @private
     * @returns {function} Revoke function
     */
    _wrapFacades(applyFunction){
        let revokeProxies = [];

        let facades = this._harvestFacades();

        facades.forEach(facadeObject => {

            let facadeObjectMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(facadeObject)).filter(propName => typeof facadeObject[propName] === 'function');

            facadeObjectMethods.forEach(methodName => {
                if (methodName === 'constructor') return;

                let original = facadeObject[methodName];

                let facadeRevocable = Proxy.revocable(original, {apply: applyFunction});

                let revokeFunction = function(){
                    facadeRevocable.revoke();
                    facadeObject[methodName] = original;
                };

                revokeProxies.push(revokeFunction);
                facadeObject[methodName] = facadeRevocable.proxy;
            });

        });

        return function(){revokeProxies.forEach(func => func.apply());};
    }

    /**
     * Marks the n coming steps for failure - which means that if they fail, they succeed
     * @param {number} stepCount How many steps should be marked for failure
     * @param {boolean} [mustFail=true] Fail the next steps if the succeed (false = always pass)
     * @param {string} [expectedErrorMessage] Text that must appear in the error message
     */
    markNextStepsForFailure(stepCount, mustFail=true, expectedErrorMessage){
        let _self = this;
        let remainingSteps = stepCount;

        let errorMessage = 'Original step passed (marked as expected to fail)';

        let expectedErrorMessageTest = (expectedErrorMessage === undefined) ? {test(){return true;}} : _self._infra.utils.variableProcessor.getTestable(expectedErrorMessage.trim(), {ignoreCase : true, partial : true});

        let revokeFunction;

        let applyFunction = function proxyApply(target, thisArg, argumentsList) {
            _self._infra.log('Expecting step to fail:', 'log', 'open');

            return target.apply(thisArg, argumentsList)
                .then(() => Promise.reject(new Error(errorMessage)))
                .catch(e => {
                    if (!mustFail) return Promise.resolve();

                    if (e.message === errorMessage) throw e;

                    if (!expectedErrorMessageTest.test(e.message)) throw new Error(`Expected error message to be ${expectedErrorMessageTest.toString()}, but actual was ${e.message}`);

                    _self._infra.log(`Step failed as expected (${stepCount - remainingSteps + 1}/${stepCount})`);
                }).finally(() => {
                    _self._infra.utils.logHelper.removeIndent();
                    remainingSteps = remainingSteps - 1;
                    if (remainingSteps === 0) {
                        _self._infra.log('Finished ' + stepCount + ' steps marked for failure');
                        revokeFunction();
                    }
                });
        };

        revokeFunction = this._wrapFacades(applyFunction);

    }

}

module.exports = TestFlowMetaHelpers;