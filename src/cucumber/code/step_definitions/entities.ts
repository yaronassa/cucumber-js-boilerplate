import {Given, When, Then} from 'cucumber';
import {ICucumberWorld} from "../support/world";

Given(/^I refresh ((?:this|the latest|the last)? *.+? *(?:#\d+)?) *from the test environment$/i,
    async function(this: ICucumberWorld, entityReference) {
        return this.facades.entities.refreshEntityReference(entityReference);
    });

Given(/^I work with (?:a|an|the|my) (.+?) (?:matching|with)(?: fields)?: ((?:.+=.*, ?)*(?:.+=.*))$/i,
    async function(entityType, matchFields) {
        return this.facades.entities.storeEntityToMemory(undefined, entityType, matchFields);
    });

Given(/^(?:From|For) ((?:this|the latest|the last)? *.+? *(?:#\d+)?),? I work with (?:a|an|the|my) (.+?) (?:matching|with)(?: fields)?: ((?:.+=.*, ?)*(?:.+=.*))$/i,
    async function(this: ICucumberWorld, fromEntity, entityType, matchFields) {
        return this.facades.entities.storeEntityToMemory(fromEntity, entityType, matchFields);
    });

Given(/^(?:From|For) ((?:this|the latest|the last)? *.+? *(?:#\d+)?),? I work with (?:a|an|the|my) ([^=]+?)$/i,
    async function(this: ICucumberWorld, fromEntity, entityType) {
        return this.facades.entities.storeEntityToMemory(fromEntity, entityType);
    });

Given(/^I work with the entire ([^=]+?)$/i,
    async function(this: ICucumberWorld, entityType) {
        return this.facades.entities.storeEntityToMemory(undefined, entityType);
    });

Given(/^I work with the \.(.+?) property (?:from|of) ((?:this|the latest|the last)? *.+? *(?:#\d+)?)$/i,
    async function(this: ICucumberWorld, property, entity) {
        return this.facades.entities.storeEntityPropertyToMemory(property, entity);
    });


Given(/^I delete ((?:this|the latest|the last)? *.+? *(?:#\d+)?)$/i,
    async function(this: ICucumberWorld, entityToDelete) {
        return this.facades.entities.deleteEntity(entityToDelete);
    });


Then(/^((?:this|the latest|the last)? *.+? *(?:#\d+)?) (does(?:n't| not))? *(?:has|have) fields: ((?:.+=.*, ?)*(?:.+=.*))$/i,
    async function(this: ICucumberWorld, entity, flipResult, matchFields) {
        return this.facades.entities.assertEntityProperties(entity, matchFields, flipResult === undefined);
    });

Then(/^((?:this|the latest|the last)? *.+? *(?:#\d+)?) (does(?:n't| not))? *exists?$/i,
    async function(this: ICucumberWorld, entity, flipResult) {
        return this.facades.entities.assertEntityExists(entity, flipResult === undefined);
    });

Then(/^((?:this|the latest|the last)? *.+? *(?:#\d+)?) *(does(?:n't|not))? *contains? (?:an)? *(\d+)? *items? with fields: ((?:.+=.*, ?)*(?:.+=.*))$/i,

    async function(this: ICucumberWorld, entity, flipResult, itemsCount, matchFields) {
        if (isNaN(itemsCount) || itemsCount === undefined) itemsCount = -1;
        return this.facades.entities.assertEntityHasItems(entity, matchFields, itemsCount, flipResult === undefined);
    });

When(/^I (?:edit|update) ((?:this|the latest|the last)? *.+? *(?:#\d+)?) with(?: fields)?: ((?:.+=.*, ?)*(?:.+=.*))$/,

    async function(this: ICucumberWorld, entityReference, editFields) {
        return this.facades.entities.updateEntity(entityReference, editFields);
    });

When(/^(?:From ((?:this|the latest|the last)? *.+? *(?:#\d+)?)?, )?I create a demo entity with(?: fields)?: ((?:.+=.*, ?)*(?:.+=.*))$/,

    async function(this: ICucumberWorld, entityReference, creationFields) {
        return this.facades.entities.createDemoEntity(entityReference, creationFields);
    });
