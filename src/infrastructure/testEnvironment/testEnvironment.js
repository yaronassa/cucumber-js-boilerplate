let Promise = require('bluebird');

/**
 * Main access point for any operation that touches the outside test environment
 */
class TestEnvironment {
    /**
     * @param {AutomationInfrastructure} infra The automation infrastructure
     * @returns {TestEnvironment}
     */
    constructor(infra){
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
        
        this._runningID = 0;
    }

    /**
     * Mocks a unique test environment ID
     * @returns {number}
     */
    getNewID(){
        let newID = this._runningID;
        this._runningID = this._runningID + 1;
        return newID;
    }

    /**
     * Mock for creating a new entity
     * @param {string} entityType The canonized entity type / category
     * @param {{fieldName: string, fieldValue: string}[]} entityFields The entity fields spec
     * @returns {Promise}
     */
    createNewEntity(entityType, entityFields){
        // This represents a test environment creation operation
        
        let result = {entityType, isMock : true, id: this.getNewID()};
        entityFields.forEach(field => {
            result[field.fieldName] = field.fieldValue;
        });
        
        return Promise.resolve(result);
    }

    /**
     * Returns an entity from the test environment
     * @param {string} entityType The canonized entity type
     * @param {number} id The entity ID
     * @returns {Promise<object>} The entity
     */
    getEntity(entityType, id){
        //Mocks the test environment - actually return the entity from the internal storage
        
        return Promise.resolve(this._infra.data.scenarioData.createdEntities.get({entityType, id}).first());
    }

    /**
     * Deletes an entity from the test environment
     * @param {string} entityType The canonized entity type
     * @param {number} id The entity ID
     * @returns {Promise}
     */
    deleteEntity(entityType, id){
        //Mocks the test environment

        return Promise.resolve(id);
    }

    /**
     * Performs before scenario reset operations
     * Called by {@link TestFlow._hooksHandlers.BeforeScenario}
     * @returns {Promise}
     */
    beforeScenarioActions(){
        this._runningID = 0;
        return Promise.resolve();
    }

    /**
     * Performs after scenario reset operations
     * Called by {@link TestFlow._hooksHandlers.AfterScenario}
     * @returns {Promise}
     */
    afterScenarioActions(){
        return this._deleteScenarioEntities();
    }

    /**
     * Deletes all test environment entities created in the scenario
     * @returns {Promise}
     * @private
     */
    _deleteScenarioEntities(){
        let _self = this;
        
        if (!this._infra.config.testEnvironment.cleanCreatedEntities) {
            this._infra.log('Skipping entity cleanup due to config setting');
            return Promise.resolve();
        }
        
        let deletedCount = 0;
        let pendingDeletions = this._infra.data.scenarioData.createdEntities.get({deleted: {'!is': true}});
        
        if (pendingDeletions.count() === 0) {
            this._infra.log('Skipping entity cleanup - non were created');
            return Promise.resolve();
        }

        _self._infra.log(`Deleting ${pendingDeletions.count()} scenario created entities`, 'log', 'open');
        
        return Promise.try(function(){
            return Promise.each(pendingDeletions.get(), entity => {
                return _self._infra.services.entities.deleteEntityFromTestEnvironment(entity.entityType, entity.id)
                    .tap(() => deletedCount = deletedCount + 1);
            });
           
        }).finally(() => _self._infra.log(`Deleted a total of ${deletedCount} entities`, 'log', 'close'));
    }
}

module.exports = TestEnvironment;