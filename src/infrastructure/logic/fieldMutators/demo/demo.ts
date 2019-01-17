import {AbstractFieldMutator, IMutationObject} from "../abstractFieldMutator";
import {IDataEntity, IEntityType} from "../../entities";
import {PropertyFields} from "../../propertyFields";

const bluebird = require('bluebird');

class DemoFieldMutator extends AbstractFieldMutator {
    protected sharedMutations: IMutationObject = {};

    protected async preMutation(entityType: IEntityType, fromEntity: IDataEntity, matchFields: PropertyFields, operation: string): Promise<PropertyFields> {

        await bluebird.each(matchFields, async field => {
            if (operation === 'assert' || operation === 'get') {
                if (!field.fieldName.startsWith('properties.')) field.fieldName = 'properties.' + field.fieldName;
            }
            field.fieldValue = await this.infra.utils.variableProcessor.parseObjectVariables(field.fieldValue) || field.fieldValue;
        });

        return matchFields;
    }
}

export default DemoFieldMutator;
