/**
 * Entity related operations and flows
 */
class EntitiesServices {
    /**
     * @param {AutomationInfrastructure} infra The automation infrastructure
     * @returns {EntitiesServices}
     */
    constructor(infra){
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
    }

    /**
     * Creates a new entity
     * @param {string} entityType The canonized entity type / category
     * @param {{fieldName: string, fieldValue: string}[]} entityFields The entity fields spec
     * @returns {Promise}
     */
    createNewEntity(entityType, entityFields){
        let _self = this;
        return this._infra.testEnvironment.createNewEntity(entityType, entityFields)
            .tap(newEntity => _self._infra.log(`Created a new ${entityType} entity with ID = ${newEntity.id}`));
    }

    /**
     * Returns an entity from the test environment and processes the result
     * @param {string} entityType The canonized entity type
     * @param {number} id The entity ID
     * @returns {Promise<object>} The entity in consumable form
     */
    getEntityFromTestEnv(entityType, id){
        let _self = this;
        return this._infra.testEnvironment.getEntity(entityType, id)
            .tap(entity => _self._infra.log(`Get ${entityType} with ID = ${entity.id} from the test environment`));
        
        //Process result if needed
    }

    /**
     * Deletes an entity from the test environment
     * @param {string} entityType The canonized entity type
     * @param {number} id The entity ID
     * @returns {Promise}
     */
    deleteEntityFromTestEnvironment(entityType, id){
        let _self = this;
        return this._infra.testEnvironment.deleteEntity(entityType, id)
            .tap(() => _self._infra.log(`Deleted ${entityType} with ID = ${id} from the test environment`))
            .tap(() => _self._infra.data.updateEntityAsDeleted(entityType, id));
    }
}

module.exports = EntitiesServices;