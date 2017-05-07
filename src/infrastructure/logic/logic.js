/**
 * Main access point for logical data manipulations
 */
class Logic {
    /**
     * @param {AutomationInfrastructure} infra The automation infrastructure
     * @returns {Logic}
     */
    constructor(infra){
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
        /** @type {EntitiesLogic} */
        this.entities = new (require('./entitiesLogic'))(infra);
    }

}

module.exports = Logic;