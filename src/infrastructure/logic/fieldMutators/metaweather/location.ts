import {AbstractFieldMutator, IMutationObject} from "../abstractFieldMutator";
import {IPropertyField} from "../../propertyFields";

class LocationFieldMutator extends AbstractFieldMutator {
    protected sharedMutations: IMutationObject = {
        shared:
            {
                query: {
                    names: ['name', 'search', 'text']
                },
                lattlong: {
                    names: ['location', 'geo', 'geolocation'],
                    mutate: async (field: IPropertyField) => {
                        const valueObject = await this.infra.utils.variableProcessor.parseObjectVariables(field.fieldValue) as string[];
                        if (valueObject) field.fieldValue = valueObject.join(',');
                    }
                }
            }
    };

}

export default LocationFieldMutator;
