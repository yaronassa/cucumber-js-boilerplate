/**
 * Houses facades for the demo scenarios
 */
class DemoFacades {
    /**
     * @param {AutomationInfrastructure} infra The infrastructure instance
     * @returns {DemoFacades}
     */
    constructor(infra) {
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
        /** @type {DemoFacadesEntities} */
        this.entities = new (require('./demoFacades_entities'))(infra);
        /** @type {DemoFacadesVariables} */
        this.variables = new (require('./demoFacades_variables'))(infra);
        /** @type {DemoFacadesGeneral} */
        this.general = new (require('./demoFacades_general'))(infra);
        
    }
}

module.exports = DemoFacades;