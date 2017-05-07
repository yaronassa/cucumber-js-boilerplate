/**
 * Demo steps for entity management
 * @type {{Given : function(RegExp, function)}}
 */
let demoEntitiesSteps = function () {


    this.When(/^I create a new (.+?) entity with: (.+)$/,
        /**
         * Demonstrates entity data management
         * @param {string} entityType The entity type / category
         * @param {string} entityProperties A comma separated string of a=b properties
         * @this {CucumberWorld}
         */
        function createEntity(entityType, entityProperties) {
            return this.facades.demo.entities.createNewEntity(entityType, entityProperties);
        });


    this.Then(/^(The last)? ?(.+?) entity (#?\d+)? *has fields: (.+)$/,
        /**
         * Demonstrates entity data validation
         * @param {string} lastEntity Marker to look for the last created entity of the relevant type
         * @param {string} entityType The entity type / category
         * @param {string} entityIndexOrID Marker to look for the entity with the given creation index / id
         * @param {string} entityFields A comma separated string of a=b properties to validate
         * @this {CucumberWorld}
         */
        function validateEntityFields(lastEntity, entityType, entityIndexOrID, entityFields) {
            if (lastEntity !== undefined && entityIndexOrID !== undefined) throw new Error('Entity cannot be described both as "last" and by index/id');
            if (lastEntity === undefined && entityIndexOrID === undefined) throw new Error('Entity must be described as "last" or by index/id');
            
            let entityIdentifier = (lastEntity) ? 'last' : entityIndexOrID;
            return this.facades.demo.entities.validateEntityFields(entityType, entityIdentifier, entityFields);
        });
};

module.exports = demoEntitiesSteps;