let Promise = require('bluebird');

/**
 * Houses facades for general demonstrations
 */
class DemoFacadesGeneral {
    /**
     * @param {AutomationInfrastructure} infra The infrastructure instance
     * @returns {DemoFacadesEntities}
     */
    constructor(infra) {
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
    }

    /**
     * Fail the current step
     * @param {string} [errorMessage='Step failed'] Error message to fail with
     * @returns {Promise}
     */
    failStep(errorMessage='Step failed (by request)'){
        return Promise.reject(new Error(errorMessage));
    }

}

module.exports = DemoFacadesGeneral;