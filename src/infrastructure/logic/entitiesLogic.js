/*
 let lowerEntityType = entityType.toLowerCase();

 switch(lowerEntityType){
 case 'user':
 case 'record':
 case ''
 }
 */

/**
 * Entity related logical data manipulations
 */
class EntitiesLogic {
    /**
     * @param {AutomationInfrastructure} infra The automation infrastructure
     * @returns {EntitiesLogic}
     */
    constructor(infra){
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
    }

    /**
     * Returns the system identified entity type
     * @param {string} sourceType User friendly type
     * @returns {string} The canonized type (or undefined)
     */
    getCanonizedEntityType(sourceType){
        let lowerEntityType = sourceType.toLowerCase();

        switch(lowerEntityType){
            case 'user':
            case 'record':
            case '':
                return lowerEntityType;
            default:
                return undefined;
        }
    }

    /**
     * Returns the entity matching the given description
     * @param {string} entityType The entity canonized type
     * @param {string} storeDescription "last", or the entity index / id
     * @returns {{id: number, entityType: string}} The stored entity
     */
    entityFromStoreDescription(entityType, storeDescription){
        let storedEntities = this._infra.data.scenarioData.createdEntities.get({entityType});
        if (/(last|this)/i.test(storeDescription)) return storedEntities.last();
        
        if (storeDescription.startsWith('#')) {
            let index = parseInt(storeDescription.replace('#', ''));
            if (index === 0) throw new Error('Entity reference index is 1-based (cannot use 0 as #N index)');
            return storedEntities.start(index).first();
        }
        
        return storedEntities.filter({id : storeDescription}).first();
    }
}

module.exports = EntitiesLogic;