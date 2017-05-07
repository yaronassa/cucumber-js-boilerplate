let Promise = require('bluebird');

/**
 * Houses facades for shared cucumber given steps
 */
class SharedGivenFacades {
    /**
     * @param {AutomationInfrastructure} infra The infrastructure instance
     * @returns {SharedGivenFacades}
     */
    constructor(infra) {
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
    }
    
    /**
     * Marks the n coming steps for failure - which means that if they fail, they succeed
     * @param {number} stepCount How many steps should be marked for failure
     * @param {boolean} [mustFail=true] Fail the next steps if the succeed (false = always pass)
     * @param {string} [errorMessage] Text that must appear in the error message
     * @returns {Promise}
     */
    markNextStepsForFailure(stepCount, mustFail=true, errorMessage){
        let _self = this;
        return Promise.try(function(){
            _self._infra.testFlow.metaHelpers.markNextStepsForFailure(stepCount, mustFail, errorMessage);
        });
    }
}

module.exports = SharedGivenFacades;