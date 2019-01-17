import {InfrastructureObject} from "../../../infrastructureObject";
import {IDataEntity, IEntityType} from "../../../logic/entities";
import {PropertyFields} from "../../../logic/propertyFields";

abstract class AbstractEntityCreator extends InfrastructureObject {
    // tslint:disable-next-line:max-line-length
    public abstract async createEntity(entityType: IEntityType, fromEntities: {[role: string]: IDataEntity[]}, creationFields: PropertyFields, saveUndoFields: boolean): Promise<IDataEntity[]>;

    protected constructEntity(entity: any, entityType: IEntityType, undoFields: PropertyFields, saveUndoFields: boolean): IDataEntity {
        const creationReference: IDataEntity = {
            type: entityType,
            entity,
            history: [],
            created: true,
            undoActions: (saveUndoFields) ? [{action: 'create', undoFields}] : undefined
        };

        return creationReference;
    }
}

export {AbstractEntityCreator};
