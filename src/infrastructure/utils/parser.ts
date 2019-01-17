import {InfrastructureObject} from "../infrastructureObject";
import {PropertyFields} from "../logic/propertyFields";
const bluebird = require('bluebird');

class Parser extends InfrastructureObject {

    public async parseFieldPairs(fieldsData: string | PropertyFields, processVariables: boolean = true): Promise<PropertyFields> {
        const _self = this;

        let result: PropertyFields;
        if (Array.isArray(fieldsData)) {
            result = new PropertyFields(fieldsData);
        } else {
            if (fieldsData !== '') {

                let fields = this.safeSplit(fieldsData, ',').map(fieldData => {
                    const field = _self.safeSplit(fieldData, '=');
                    const fieldName = field.splice(0, 1)[0] || '';
                    const fieldValue = field.join('=');

                    return {
                        fieldName : fieldName.trim(),
                        fieldValue : fieldValue.trim()
                    };
                });

                if (processVariables) {
                    fields = await bluebird.map(fields, async field => {
                        field.fieldValue = await _self.infra.utils.variableProcessor.processVariables(field.fieldValue);
                        return field;
                    });
                }

                result = new PropertyFields(fields);
            } else {
                return new PropertyFields([]);
            }
        }

        return result;
    }

    public safeSplit(value: string, delimiter: string): string[] {

        const protectedVariables = value.replace(/\$\{[^}]+}/g, outerVariable => {
            return outerVariable.split(delimiter).join('\\' + delimiter);
        });

        return protectedVariables.split('\\' + delimiter).map(shard => shard.split(delimiter)).reduce((acc: string[], shards: string[], index: number) => {
            if (index > 0) {
                const attachValue = shards.splice(0, 1)[0] || '';
                acc[acc.length - 1] += delimiter + attachValue;
            }

            return acc.concat(shards);
        }, []);
    }

}

export {Parser};
