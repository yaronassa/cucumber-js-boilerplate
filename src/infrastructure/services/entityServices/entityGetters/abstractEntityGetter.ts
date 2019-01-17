import {InfrastructureObject} from "../../../infrastructureObject";
import {IDataEntity, IEntityType} from "../../../logic/entities";
import {PropertyFields} from "../../../logic/propertyFields";

abstract class AbstractEntityGetter extends InfrastructureObject {
    public abstract async getEntity(entityType: IEntityType, fromEntity: IDataEntity, matchFields: PropertyFields): Promise<IDataEntity>;

    protected constructEntity(entityData: any, entityType: IEntityType, fromEntity: IDataEntity, matchFields: PropertyFields): IDataEntity {
        return {
            type: entityType,
            entity: entityData,
            getterInfo: {
                fromEntity,
                matchFields
            },
            history: [],
            created: false
        };
    }
    

}

export {AbstractEntityGetter};
