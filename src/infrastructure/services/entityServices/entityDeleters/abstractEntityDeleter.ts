import {IDataEntity} from "../../../logic/entities";
import {PropertyFields} from "../../../logic/propertyFields";
import {InfrastructureObject} from "../../../infrastructureObject";

abstract class AbstractEntityDeleter extends InfrastructureObject {
    public abstract async deleteEntity(entity: IDataEntity, deletionFields?: PropertyFields): Promise<void>;

    protected abstract async markEntitiesAsDeleted(mainDeletedEntity: IDataEntity): Promise<void>;
}

export {AbstractEntityDeleter};
