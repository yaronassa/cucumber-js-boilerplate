import {InfrastructureObject} from "../infrastructureObject";
import {IDataEntity} from "../logic/entities";

class ScenarioData extends InfrastructureObject {
    private entities: Map<string, IDataEntity[]> = new Map<string, IDataEntity[]>();

    // TODO:IMPLEMENT_ME - Store other scenario-bound useful info

    public getEntity(rawUserEntityType: string, index: number | 'latest'): IDataEntity {
        const entityType = this.infra.logic.entities.getEntityType(rawUserEntityType);

        if (index === 0) throw new Error(`Entity index is 1-based. You requested ${rawUserEntityType} entity #0`);

        const typeEntities = this.entities.get(entityType.fullTypeName) || [];

        if (index === 'latest') {
            return typeEntities[typeEntities.length - 1];
        } else {
            return typeEntities[index - 1];
        }
    }

    public getEntitiesToUndo(): IDataEntity[] {
        return Array.from(this.entities.values()).reduce((acc, group) => acc.concat(group.filter(entity => (entity.undoActions && entity.deleted !== true))), []);
    }

    public storeEntity(entity: IDataEntity) {
        if (!this.entities.has(entity.type.fullTypeName)) this.entities.set(entity.type.fullTypeName, []);
        this.entities.get(entity.type.fullTypeName).push(entity);
    }

}

export {ScenarioData};
