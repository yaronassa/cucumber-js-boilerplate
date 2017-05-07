let Promise = require('bluebird');

/**
 * Houses facades for the demo entity management steps
 */
class DemoFacadesEntities {
    /**
     * @param {AutomationInfrastructure} infra The infrastructure instance
     * @returns {DemoFacadesEntities}
     */
    constructor(infra) {
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
    }

    /**
     * Creates a new entity
     * @param {string} entityType The entity type / category
     * @param {string} entityProperties A comma separated string of a=b properties
     * @returns {Promise}
     */
    createNewEntity(entityType, entityProperties){
        let _self = this;
        
        return Promise.try(function(){
            /** @type {{fieldName: string, fieldValue: string}[]} */
            let parsedEntityProperties = _self._infra.utils.parser.parseFieldPairs(entityProperties);

            let canonizedEntityType = _self._infra.logic.entities.getCanonizedEntityType(entityType);

            if (canonizedEntityType === undefined) throw new Error(`Cannot recognize entity type "${entityType}"`);
            
            return _self._infra.services.entities.createNewEntity(canonizedEntityType, parsedEntityProperties);
        }).tap(newEntity => _self._infra.data.updateDataWithNewEntity(newEntity));
        
    }

    /**
     * Validates a test environment entity fields
     * @param {string} entityType The entity type / category
     * @param {string} entityIdentifier "last", or the entity index / id
     * @param {string} entityProperties A comma separated string of a=b properties
     * @returns {Promise}
     */
    validateEntityFields(entityType, entityIdentifier, entityProperties){
        let _self = this;
        
        return Promise.try(function(){
            /** @type {{fieldName: string, fieldValue: string}[]} */
            let parsedEntityProperties = _self._infra.utils.parser.parseFieldPairs(entityProperties);

            let canonizedEntityType = _self._infra.logic.entities.getCanonizedEntityType(entityType);

            if (canonizedEntityType === undefined) throw new Error(`Cannot recognize entity type "${entityType}"`);

            let storedEntity = _self._infra.logic.entities.entityFromStoreDescription(canonizedEntityType, entityIdentifier);
            
            if (storedEntity === undefined) throw new Error(`Cannot find ${entityIdentifier} ${entityType} in internal storage`);
            
            _self._infra.log(`Found matching ${entityType} in internal storage. ID = ${storedEntity.id}`);
            
            return _self._infra.assert.entities.validateEntityFields(canonizedEntityType, storedEntity.id, parsedEntityProperties);
            
        });
    }
    
}

module.exports = DemoFacadesEntities;