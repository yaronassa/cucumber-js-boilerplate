import {AbstractEntityDeleter} from "../abstractEntityDeleter";
import {IDataEntity} from "../../../../logic/entities";
import {PropertyFields} from "../../../../logic/propertyFields";

class DemoEntityDeleter extends AbstractEntityDeleter {
    public async deleteEntity(entity: IDataEntity, deletionFields?: PropertyFields): Promise<void> {
        switch (entity.type.typeName) {
            case 'entity':
                await this.deleteDemoEntity(entity);
                break;
            default:
                throw new Error(`Implement deleter for demo entity type ${entity.type.typeName}`);
        }
    }

    protected async markEntitiesAsDeleted(mainDeletedEntity: IDataEntity): Promise<void> {
        const entities = this.infra.data.getScenarioEntitiesToUndo().filter(entity => entity.entity.id === mainDeletedEntity.entity.id);
        entities.forEach(entity => entity.deleted = true);
    }

    private async deleteDemoEntity(entity: IDataEntity) {
        await this.infra.testEnvironment.demoCRUD.deleteDemoEntity(entity.entity.id);
        await this.markEntitiesAsDeleted(entity);
    }

}

export default DemoEntityDeleter;
