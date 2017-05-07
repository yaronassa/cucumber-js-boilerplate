let Promise = require('bluebird');

/**
 * Houses facades for debugging cucumber steps
 */
class DebugFacades {
    /**
     * @param {AutomationInfrastructure} infra The infrastructure instance
     * @returns {DebugFacades}
     */
    constructor(infra) {
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
    }

    /**
     * Runs user code within the infrastructure
     * @param {string} codeString The user JS code to eval
     * @returns {Promise}
     */
    evalUserCode(codeString){
        this._infra.log('ERROR: DEBUG STEP - SHOULD NEVER BE USED IN PRODUCTION', 'error');

        //noinspection JSUnusedLocalSymbols - Used in dynamic user code
        // eslint-disable-next-line no-unused-vars
        let $ = this._infra;
        return Promise.try(function(){
            let userCodeResult;
            // eslint-disable-next-line no-eval
            let result = eval(codeString);
            if (userCodeResult) result = userCodeResult;
            return result;
        }).catch(e => {
            throw new Error('Error running user code ' + e.toString());
        });
    }
}

module.exports = DebugFacades;