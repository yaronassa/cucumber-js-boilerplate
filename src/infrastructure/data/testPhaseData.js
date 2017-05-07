let TAFFY = require( 'taffy' );

/**
 * Houses data created in a given test phase
 */
class TestPhaseData {
    /**
     * @param {AutomationInfrastructure} infra The infrastructure instance
     * @returns {TestPhaseData}
     */
    constructor(infra) {
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;

        /**
         * Entities created during this test phase
         * @type {{insert: function, remove: function, each: function, map: function, filter: function, distinct: function, get: function}}
         */
        this.createdEntities = new TAFFY();
        this.createdEntities.get = this.createdEntities;
        
    }
}

module.exports = TestPhaseData;