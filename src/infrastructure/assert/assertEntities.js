let Promise = require('bluebird');

/**
 * Entities assertions and validations
 */
class AssertEntities {
    /**
     * @param {AutomationInfrastructure} infra The automation infrastructure
     * @returns {AssertEntities}
     */
    constructor(infra){
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
    }

    /**
     * Validates the given entity actually has the expected fields
     * @param {string} entityType The canonized entity type
     * @param {number} entityID The entity's test environment ID
     * @param {{fieldName: string, fieldValue: string}[]} expectedFields expected fields to compare
     * @returns {Promise}
     */
    validateEntityFields(entityType, entityID, expectedFields){
        let _self = this;
        
        return Promise.try(function(){
            return _self._infra.services.entities.getEntityFromTestEnv(entityType, entityID)
               .then(actualEntity => {
                   let comparisonResult = _self._infra.assert.compareObjectToExpectedSpec(actualEntity, expectedFields);
                   
                   if (!comparisonResult.result) throw new Error(`${entityType} with id = ${entityID} not up to spec: ${comparisonResult.mismatches.map(info => `${info.fieldName} expected to be ${info.expectedValue} but actual = ${info.actualValue}\n`)}`);
               });
        });
    }

}

module.exports = AssertEntities;