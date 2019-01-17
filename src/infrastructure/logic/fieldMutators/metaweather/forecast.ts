import {AbstractFieldMutator, IMutationObject} from "../abstractFieldMutator";
import {IPropertyField, PropertyFields} from "../../propertyFields";
import {IDataEntity, IEntityType} from "../../entities";
const moment = require('moment');

class ForecastFieldMutator extends AbstractFieldMutator {
    protected sharedMutations: IMutationObject = {
        shared:
            {
                woeid: {
                    names: ['location']
                },
                date: {
                    names: ['day']
                },
                dateFormat: {
                    names: ['format', 'date_format']
                }
            }
    };

    protected async postMutation(entityType: IEntityType, fromEntity: IDataEntity, matchFields: PropertyFields, operation: string): Promise<PropertyFields> {
        const dateFormat = matchFields.getField('dateFormat', 'DD/MM/YYYY').fieldValue;
        const dateField = matchFields.getField('date');
        if (dateFormat !== undefined && dateField !== undefined) {
            const parsedDate = new moment(dateField.fieldValue, dateFormat);
            dateField.fieldValue = parsedDate.format('YYYY/MM/DD');
        }

        return matchFields;
    }

}

export default ForecastFieldMutator;
