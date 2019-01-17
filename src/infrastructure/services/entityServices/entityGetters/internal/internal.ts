import {AbstractEntityGetter} from "../abstractEntityGetter";
import {IDataEntity, IEntityType} from "../../../../logic/entities";
import {PropertyFields} from "../../../../logic/propertyFields";

class InternalEntityGetter extends AbstractEntityGetter {
    public async getEntity(entityType: IEntityType, fromEntity: IDataEntity, matchFields: PropertyFields): Promise<IDataEntity> {
        switch (entityType.typeName) {
            case 'property':
                const propertyData = await this.getPropertyEntityDate(fromEntity, matchFields);
                return this.constructEntity(propertyData, entityType, fromEntity, matchFields);

            default:
                throw new Error(`Unknown Internal entity type: ${entityType.typeName}`);
        }
    }

    private async getPropertyEntityDate(fromEntity: IDataEntity, matchFields: PropertyFields): Promise<any> {
        if (fromEntity === undefined) throw new Error('Cannot extract property without reference entity');

        const data = this.infra.utils.getPropertyRecursive(fromEntity.entity, matchFields.getField('propertyPath').fieldValue);

        return data;
    }

}

export default InternalEntityGetter;

