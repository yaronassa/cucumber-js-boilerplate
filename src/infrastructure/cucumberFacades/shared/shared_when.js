/**
 * Houses facades for shared cucumber when steps
 */
class SharedWhenFacades {
    /**
     * @param {AutomationInfrastructure} infra The infrastructure instance
     * @returns {SharedWhenFacades}
     */
    constructor(infra) {
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
    }

}

module.exports = SharedWhenFacades;