/**
 * Houses facades for shared cucumber then steps
 */
class SharedThenFacades {
    /**
     * @param {AutomationInfrastructure} infra The infrastructure instance
     * @returns {SharedThenFacades}
     */
    constructor(infra) {
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
    }


}

module.exports = SharedThenFacades;