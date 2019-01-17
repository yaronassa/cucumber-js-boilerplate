import {InfrastructureObject} from "../../../infrastructureObject";
import {IDataEntity} from "../../../logic/entities";
import {PropertyFields} from "../../../logic/propertyFields";

abstract class AbstractEntityUpdater extends InfrastructureObject {
    public abstract async updateEntity(entity: IDataEntity, updateFields: PropertyFields, saveUndoFields: boolean): Promise<void>;

    protected updateEntityWithUndoFields(entity: IDataEntity, undoFields: PropertyFields, saveUndoFields: boolean) {
        if (entity.undoActions === undefined) entity.undoActions = [];
        entity.undoActions.push({action: 'update', undoFields});
    }

    protected prepareMinimalPayloadCurrentValues(entity: IDataEntity, minimalFields: any[]): {[fieldName: string]: string} {

        const fields: Array<{fieldPath: string, fieldName: string}> = minimalFields.map(field => {
            if (typeof field === 'string') {
                return {fieldName: field as string, fieldPath: field as string};
            } else {
                return field as {fieldName: string, fieldPath: string};
            }
        });

        const result: {[fieldName: string]: string} = fields.reduce((acc, field) => {
            if (!field.fieldPath.startsWith('entity.')) field.fieldPath = 'entity.' + field.fieldPath;

            let fieldPayloadValue = this.infra.utils.getPropertyRecursive(entity, field.fieldPath);

            if (fieldPayloadValue === undefined && entity.undoActions !== undefined) {
                fieldPayloadValue = entity.undoActions
                    .filter(item => item.undoFields.getField(field.fieldName, undefined).fieldValue !== undefined)
                    .pop().undoFields.getField(field.fieldName).fieldValue;
            }

            acc[field.fieldName] = fieldPayloadValue;

            return acc;
        }, {});

        return result;
    }

}

export {AbstractEntityUpdater};
