import {InfrastructureObject} from "../../infrastructureObject";
import {IPropertyField, PropertyFields} from "../propertyFields";
import {IDataEntity, IEntityType} from "../entities";

const bluebird = require('bluebird');

interface IMutationObject {
    shared?: IEntityMutationObject,
    global?: IEntityMutationObject,
    [typeName: string]: IEntityMutationObject
}

type MutationFunction = (field: IPropertyField) => Promise<void>;

interface IEntityMutationObject {
    [fieldName: string]: {
        names?: string[],
        mutate?: MutationFunction
    }
}

abstract class AbstractFieldMutator extends InfrastructureObject {
    protected abstract sharedMutations: IMutationObject;
    protected getMutations: IMutationObject = {};
    protected createMutations: IMutationObject = {};
    protected updateMutations: IMutationObject = {};
    protected assertMutations: IMutationObject = {};

    private globalSharedMutations: IMutationObject = {
        shared: {
            length: {names: ['count']},
            ordering: {names: ['sort', 'order']}
        }
    };

    public async mutateFields(entityType: IEntityType, fromEntity: IDataEntity, matchFields: PropertyFields, operation: string): Promise<PropertyFields> {
        const _self = this;

        const mutationObject = this.getMutationObject(operation);

        let mutatedFields = matchFields.clone();

        mutatedFields = await this.preMutation(entityType, fromEntity, mutatedFields, operation);

        await bluebird.each(mutatedFields, async (field: IPropertyField) => {
            const canonizedFieldName = field.fieldName.toLowerCase().replace(/ /g, '_');
            const mutationInfo =
                _self.findMutation(mutationObject[entityType.typeName], canonizedFieldName)
                || _self.findMutation(mutationObject.shared, canonizedFieldName)
                || _self.findMutation(mutationObject.global, canonizedFieldName);
            if (mutationInfo) {
                field.fieldName = mutationInfo.realFieldName;
                if (mutationInfo.mutation) await mutationInfo.mutation(field);
            }
        });

        mutatedFields.removeByValue('${toDelete}');

        mutatedFields = await this.postMutation(entityType, fromEntity, mutatedFields, operation);

        return mutatedFields;
    }

    protected async preMutation(entityType: IEntityType, fromEntity: IDataEntity, matchFields: PropertyFields, operation: string): Promise<PropertyFields> {
        return matchFields; // override if needed
    }

    protected async postMutation(entityType: IEntityType, fromEntity: IDataEntity, matchFields: PropertyFields, operation: string): Promise<PropertyFields> {
        return matchFields; // override if needed
    }

    private getMutationObject(operation: string): IMutationObject {
        const operationMutations = this[`${operation}Mutations`] as IMutationObject;
        const sharedMutations = this.sharedMutations;
        const globalMutations = this.globalSharedMutations;

        const entityKeys = Object.keys(sharedMutations).concat(Object.keys(operationMutations));

        const result: IMutationObject = entityKeys.reduce((resultAcc, entityKey) => {
            if (resultAcc[entityKey] !== undefined) return resultAcc;

            const fieldKeys = Object.keys(sharedMutations[entityKey] || {})
                                .concat(Object.keys(globalMutations[entityKey] || {}))
                                .concat(Object.keys(operationMutations[entityKey] || {}));

            resultAcc[entityKey] = fieldKeys.reduce((fieldAcc, fieldKey) => {
                fieldAcc[fieldKey] = (operationMutations[entityKey] || {})[fieldKey]
                        || (sharedMutations[entityKey] || {})[fieldKey]
                        || (globalMutations[entityKey] || {})[fieldKey];

                return fieldAcc;
            }, {});

            return resultAcc;
        }, {} as IMutationObject);

        return result;
    }

    private findMutation(entityMutationObject: IEntityMutationObject, fieldName: string): {mutation: MutationFunction, realFieldName: string} {
        if (entityMutationObject === undefined) return undefined;
        if (entityMutationObject[fieldName]) return {mutation: entityMutationObject[fieldName].mutate, realFieldName: fieldName};

        const realFieldName = Object.keys(entityMutationObject).find(key => {
            if (!Array.isArray(entityMutationObject[key].names)) return false;
            return (entityMutationObject[key].names.indexOf(fieldName) > -1);
        });

        return (realFieldName) ? {mutation: entityMutationObject[realFieldName].mutate, realFieldName} : undefined;
    }
}

export {AbstractFieldMutator, IMutationObject};
