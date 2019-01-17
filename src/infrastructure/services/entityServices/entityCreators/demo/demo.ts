import {AbstractEntityCreator} from "../abstractEntityCreator";
import {IDataEntity, IEntityType} from "../../../../logic/entities";
import {PropertyFields} from "../../../../logic/propertyFields";

class DemoEntityCreator extends AbstractEntityCreator {
    // tslint:disable-next-line:max-line-length
    public async createEntity(entityType: IEntityType, fromEntities: { [p: string]: IDataEntity[] }, creationFields: PropertyFields, saveUndoFields: boolean): Promise<IDataEntity[]> {
        switch (entityType.typeName) {
            case 'entity':
                const parent = (fromEntities && fromEntities.parent) ? fromEntities.parent.pop() : undefined;
                return this.createDemoEntity(entityType, {parent}, creationFields, saveUndoFields);
            default:
                throw new Error(`Implement creator for demo entity ${entityType.typeName}`);
        }
    }

    private async createDemoEntity(entityType: IEntityType, fromEntity: {parent: IDataEntity}, creationFields: PropertyFields, saveUndoFields: boolean): Promise<IDataEntity[]> {
        const parentID = (fromEntity.parent) ? fromEntity.parent.entity.id : undefined;
        if (parentID) creationFields.push({fieldValue: parentID, fieldName: 'parentID'});
        const entityID = await this.infra.testEnvironment.demoCRUD.createEntity(creationFields);
        const undoFields = await this.infra.utils.parser.parseFieldPairs(`id=${entityID.toString()}`);
        const entityData = {id: entityID};
        const entity = this.constructEntity(entityData, entityType, undoFields, saveUndoFields );

        return [entity];
    }

}

export default DemoEntityCreator;
