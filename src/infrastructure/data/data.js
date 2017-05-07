let Promise = require('bluebird');

/**
 * Internal data management
 */
class Data {
    /**
     * @param {AutomationInfrastructure} infra The infrastructure instance
     * @returns {Data}
     */
    constructor(infra) {
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
        /**
         * The current scenario data store
         * @type {TestPhaseData}
         */
        this.scenarioData = undefined;

        /**
         * The current feature scenarios data store
         * @type {TestPhaseData[]}
         */
        this.featureData = [];

    }

    /**
     * Performs before scenario reset operations
     * Called by {@link TestFlow._hooksHandlers.BeforeScenario}
     * @returns {Promise}
     */
    beforeScenarioActions(){
        this._resetScenarioData();
        return Promise.resolve();
    }

    /**
     * Resets the connected scenario data
     * @private
     */
    _resetScenarioData(){
        if (this.scenarioData !== undefined) {
            this.featureData.push(this.scenarioData);
        }
        this.scenarioData = new (require('./testPhaseData'))(this._infra);
    }
    
    /**
     * Updates the internal data store with a newly created entity
     * @param {{id: number, entityType: string, deleted: boolean}} entity The entity object
     */
    updateDataWithNewEntity(entity){
        this.scenarioData.createdEntities.insert(entity);
    }

    /**
     * Marks an internally stored entity as deleted
     * @param {string} entityType The canonized entity type
     * @param {number} id The entity ID
     */
    updateEntityAsDeleted(entityType, id){
        this.scenarioData.createdEntities.get({entityType, id}).update({deleted: true});
    }
}

module.exports = Data;