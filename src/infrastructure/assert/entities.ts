import {InfrastructureObject} from "../infrastructureObject";
import {IDataEntity} from "../logic/entities";
import {PropertyFields} from "../logic/propertyFields";

class AssertEntities extends InfrastructureObject {
    public async assertEntityProperties(entity: IDataEntity, matchProperties: PropertyFields, expectedResult: boolean) {
        if (entity === undefined) throw new Error('Could not obtain reference entity');

        const assertProperties = await this.infra.logic.entities.mutateFields(entity.type, entity.getterInfo.fromEntity, matchProperties, 'assert');

        const compareResult = await this.infra.assert.compareObjectToExpectedSpec(entity.entity, assertProperties);

        const errorString = compareResult.mismatches.map(item => `${item.fieldName}=${item.actual} != ${item.expected}`).join(', ');

        if (compareResult.result !== expectedResult) {
            // tslint:disable-next-line:max-line-length
            throw new Error(`Expected ${entity.type.typeName} ${(expectedResult) ? '' : 'not '}to match spec (${matchProperties.toString()}), but it ${(expectedResult) ? 'did not:\n' + errorString : 'did'}`);
        }
    }

    public async assertEntityExists(entity: IDataEntity, expectedResult: boolean) {
        if ((entity.entity !== undefined) !== expectedResult) {
            throw new Error(`Expected ${entity.type.typeName} ${(expectedResult) ? '' : 'not '}to exist, but it ${(expectedResult) ? 'did not' : 'did'}`);
        }
    }

    public async assertEntityHasItems(entity: IDataEntity, matchProperties: PropertyFields, expectedCount: number, expectedResult: boolean) {
        const assertProperties = await this.infra.logic.entities.mutateFields(entity.type, entity.getterInfo.fromEntity, matchProperties, 'assert');

        const target = (Array.isArray(entity.entity)) ? entity.entity : entity.entity.data;

        const filteredItems = await this.infra.utils.filterArrayByProps(target, assertProperties);

        if (expectedCount === -1) {
            if (filteredItems.length > 0 !== expectedResult) {
                throw new Error(`Expected entity ${(expectedResult) ? 'to have' : 'not to have'} matching items, but it ${(expectedResult) ? 'did not' : 'did'}`);
            }
        } else {
            if (filteredItems.length === expectedCount !== expectedResult) {
                throw new Error(`Expected entity ${(expectedResult) ? 'to have' : 'not to have'} ${expectedCount} matching items, but it has ${filteredItems.length}`);
            }
        }
    }
}

export {AssertEntities};
