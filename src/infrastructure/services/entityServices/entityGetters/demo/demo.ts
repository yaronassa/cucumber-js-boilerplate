import {AbstractEntityGetter} from "../abstractEntityGetter";
import {IDataEntity, IEntityType} from "../../../../logic/entities";
import {PropertyFields} from "../../../../logic/propertyFields";

class DemoEntityGetter extends AbstractEntityGetter {
    public async getEntity(entityType: IEntityType, fromEntity: IDataEntity, matchFields: PropertyFields): Promise<IDataEntity> {
        switch (entityType.typeName) {
            case 'entity':
                const demoData = await this.getDemoEntityData(fromEntity, matchFields);
                return this.constructEntity(demoData, entityType, fromEntity, matchFields);

            default:
                throw new Error(`Unknown Demo entity type: ${entityType.typeName}`);
        }
    }

    private async getDemoEntityData(fromEntity: IDataEntity, matchFields: PropertyFields) {
        const demoData = await this.infra.testEnvironment.demoCRUD.getDemoEntity(matchFields);
        return demoData;
    }

}

export default DemoEntityGetter;

