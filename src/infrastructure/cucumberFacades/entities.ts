import {InfrastructureObject} from "../infrastructureObject";
import {PropertyFields} from "../logic/propertyFields";
import {IDataEntity} from "../logic/entities";

class EntitiesFacades extends InfrastructureObject {
    public async storeEntityToMemory(fromEntity: IDataEntity, userEntityType: string, matchFields?: PropertyFields) {
        if (matchFields === undefined) matchFields = await this.infra.utils.parser.parseFieldPairs('');
        const entityType = this.infra.logic.entities.getEntityType(userEntityType);

        const entity = await this.infra.services.entity.getEntity(entityType, fromEntity, matchFields);

        this.infra.data.storeScenarioEntity(entity);
    }

    public async storeEntityPropertyToMemory(property: string, fromEntity: IDataEntity) {
        const entityType = this.infra.logic.entities.getEntityType('property');
        const matchFields = await this.infra.utils.parser.parseFieldPairs(`propertyPath=${property}`);

        const entity = await this.infra.services.entity.getEntity(entityType, fromEntity, matchFields);

        this.infra.data.storeScenarioEntity(entity);

    }

    public async deleteEntity(entityToDelete: IDataEntity) {
        return this.infra.services.entity.deleteEntity(entityToDelete);
    }

    public async updateEntity(entityToUpdate: IDataEntity, updateFields: PropertyFields) {
        return this.infra.services.entity.updateEntity(entityToUpdate, updateFields, true);
    }

    public async createDemoEntity(fromEntityReference: IDataEntity, creationFields: PropertyFields) {
        const entityType = this.infra.logic.entities.getEntityType('demo entity');
        return this.infra.services.entity.createEntity(entityType, {parent: [fromEntityReference]}, creationFields, true);
    }

    public async assertEntityProperties(entity: IDataEntity, matchFields: PropertyFields, expectedResult: boolean) {
        return this.infra.assert.entities.assertEntityProperties(entity, matchFields, expectedResult);
    }

    public async assertEntityExists(entity: IDataEntity, expectedResult: boolean) {
        return this.infra.assert.entities.assertEntityExists(entity, expectedResult);
    }

    public async assertEntityHasItems(entity: IDataEntity, matchFields: PropertyFields, itemsCount: number, expectedResult: boolean) {
        return this.infra.assert.entities.assertEntityHasItems(entity, matchFields, itemsCount, expectedResult);
    }

    public async refreshEntityReference(entity: IDataEntity) {
        let refreshedFrom;

        if (entity.getterInfo.fromEntity) {
            const fromEntityType = entity.getterInfo.fromEntity.type;
            const fromEntityMatchFields = entity.getterInfo.fromEntity.getterInfo.matchFields;
            const fromFromReference = entity.getterInfo.fromEntity.getterInfo.fromEntity;

            this.log(`Refreshing ${entity.type.fullTypeName} original ${fromEntityType.fullTypeName} source`);


            refreshedFrom = await this.infra.services.entity.getEntity(fromEntityType, fromFromReference, fromEntityMatchFields);
        }

        const refreshedEntity = await this.infra.services.entity.getEntity(entity.type, refreshedFrom, entity.getterInfo.matchFields);
        this.infra.data.refreshScenarioEntity(refreshedEntity, entity);
    }
}

export {EntitiesFacades};

