import {AbstractEntityUpdater} from "../abstractEntityUpdater";
import {IDataEntity} from "../../../../logic/entities";
import {PropertyFields} from "../../../../logic/propertyFields";

class DemoEntityUpdater extends AbstractEntityUpdater {
    public async updateEntity(entity: IDataEntity, updateFields: PropertyFields, saveUndoFields: boolean): Promise<void> {
        switch (entity.type.typeName) {
            case 'entity':
                await this.demoUpdateEntity(entity, updateFields, saveUndoFields);
                break;
            default:
                throw new Error(`Implement updater for demo entity ${entity.type.typeName}`);
        }
    }

    private async demoUpdateEntity(entity: IDataEntity, updateFields: PropertyFields, saveUndoFields: boolean) {
        await this.infra.testEnvironment.demoCRUD.updateDemoEntity(entity.entity.id, updateFields);
        this.updateEntityWithUndoFields(entity, updateFields, saveUndoFields);
    }

}

export default DemoEntityUpdater;
