import {InfrastructureObject} from "../../infrastructureObject";
import {IEntityType, IDataEntity, System} from "../../logic/entities";
import {AbstractEntityGetter} from "./entityGetters/abstractEntityGetter";
import {PropertyFields} from "../../logic/propertyFields";
import {AbstractEntityCreator} from "./entityCreators/abstractEntityCreator";
import {AbstractEntityDeleter} from "./entityDeleters/abstractEntityDeleter";
import {AbstractEntityUpdater} from "./entityUpdaters/abstractEntityUpdater";
import {AdditionalEntityServices} from "./additionalEntityServices";

class EntityServices extends InfrastructureObject {
    public additionalServices = new AdditionalEntityServices();

    // TODO:IMPLEMENT_ME - Add you own getters, creators, deleters and updates in the sub folders

    public async getEntity(entityType: IEntityType, fromEntity?: IDataEntity, matchFields?: PropertyFields): Promise<IDataEntity> {
        if (matchFields === undefined) matchFields = new PropertyFields([]);
        const importRoute = `./entityGetters/${System[entityType.system]}/${entityType.rootTypeName}`;
        // tslint:disable-next-line:variable-name
        let EntityGetter;
        try {
            EntityGetter = await import(importRoute);
        } catch (e) {
            throw new Error(`Cannot locate getter for type ${entityType.rootTypeName}`);
        }

        const entityGetter = new EntityGetter.default() as AbstractEntityGetter;

        const mutatedFields = await this.infra.logic.entities.mutateFields(entityType, fromEntity, matchFields, 'get');

        const entity = await entityGetter.getEntity(entityType, fromEntity, mutatedFields);

        if (Array.isArray(entity.entity)) entity.entity.forEach((item, index) => item['#'] = index + 1);

        return entity;
    }

    public async updateEntity(entity: IDataEntity, updateFields?: PropertyFields, saveUndoFields: boolean = true) {
        const importRoute = `./entityUpdaters/${System[entity.type.system]}/${entity.type.rootTypeName}`;
        // tslint:disable-next-line:variable-name
        let EntityUpdater;
        try {
            EntityUpdater = await import(importRoute);
        } catch (e) {
            throw new Error(`Cannot locate updater for type ${entity.type.rootTypeName}`);
        }

        const entityUpdater = new EntityUpdater.default() as AbstractEntityUpdater;

        const mutatedFields = await this.infra.logic.entities.mutateFields(entity.type, entity, updateFields, 'update');

        await entityUpdater.updateEntity(entity, mutatedFields, saveUndoFields);
    }

    // tslint:disable-next-line:max-line-length
    public async createEntity(entityType: IEntityType, fromEntities: {[role: string]: IDataEntity[]}, creationFields: PropertyFields, saveUndoFields: boolean = true): Promise<any> {
        const importRoute = `./entityCreators/${System[entityType.system]}/${entityType.rootTypeName}`;
        // tslint:disable-next-line:variable-name
        let EntityCreator;
        try {
            EntityCreator = await import(importRoute);
        } catch (e) {
            throw new Error(`Cannot locate creator for type ${entityType.rootTypeName}`);
        }

        const entityCreator = new EntityCreator.default() as AbstractEntityCreator;

        const mutatedFields = await this.infra.logic.entities.mutateFields(entityType, undefined, creationFields, 'create');

        const createdEntities = await entityCreator.createEntity(entityType, fromEntities, mutatedFields, saveUndoFields);

        createdEntities.forEach(creationResult => this.infra.data.storeScenarioEntity(creationResult));

        return createdEntities;
    }

    public async deleteEntity(entity: IDataEntity, deletionFields?: PropertyFields) {
        const importRoute = `./entityDeleters/${System[entity.type.system]}/${entity.type.rootTypeName}`;
        // tslint:disable-next-line:variable-name
        let EntityDeleter;
        try {
            EntityDeleter = await import(importRoute);
        } catch (e) {
            throw new Error(`Cannot locate deleter for type ${entity.type.rootTypeName}`);
        }

        const entityDeleter = new EntityDeleter.default() as AbstractEntityDeleter;

        await entityDeleter.deleteEntity(entity, deletionFields);
    }
}

export {EntityServices};
