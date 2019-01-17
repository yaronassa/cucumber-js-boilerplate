import {Given, When, Then} from 'cucumber';
import {TestAutomationInfrastructure} from "../../../../../../testClasses/TestAutomationInfrastructure";
import {IDataEntity} from "../../../../../../../../src/infrastructure/logic/entities";

Given(/^I work with the property field parameter: ((?:.+=.*, ?)*(?:.+=.*))$/i, async function(matchFields) {
    const infra = this.facades.infra as TestAutomationInfrastructure;

    const entity: IDataEntity = {
        type: infra.logic.entities.getEntityType('propertyFieldsParameter'),
        entity: matchFields,
        history: [],
        getterInfo: {fromEntity: undefined, matchFields: undefined}
    };

    infra.data.storeScenarioEntity(entity);
});

Given(/^I work with the entity parameter: ((?:this|the latest|the last)? *.+? *(?:#\d+)?)$/i, async function(entityData) {
    const infra = this.facades.infra as TestAutomationInfrastructure;

    const entity: IDataEntity = {
        type: infra.logic.entities.getEntityType('entityParameter'),
        entity: entityData.entity,
        history: [],
        getterInfo: {fromEntity: undefined, matchFields: undefined}
    };

    infra.data.storeScenarioEntity(entity);
});
