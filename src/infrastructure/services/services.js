/**
 * Main access point for operations and flows
 */
class Services {
    /**
     * @param {AutomationInfrastructure} infra The automation infrastructure
     * @returns {Services}
     */
    constructor(infra){
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
        /** @type {EntitiesServices} */
        this.entities = new (require('./entitiesServices'))(infra);
    }

}

module.exports = Services;