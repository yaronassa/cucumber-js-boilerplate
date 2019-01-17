import {InfrastructureObject} from "../infrastructureObject";
import {IDataEntity} from "../logic/entities";
import {PropertyFields} from "../logic/propertyFields";

class ParameterTypes extends InfrastructureObject {

    public dataEntity(value: string): IDataEntity {
        if (value === undefined) return undefined;

        const referenceBreakdown = value.toString().trim().match(/^(this|the latest|the last)? *(.+?) *(#\d+)?$/i);
        if (!referenceBreakdown) throw new Error('Cannot breakdown entity reference');

        const latestEntity = referenceBreakdown[1];
        const userEntityType = referenceBreakdown[2];
        const entityIndex = referenceBreakdown[3];

        if (latestEntity === undefined && entityIndex === undefined) throw new Error('Must reference one of the options: "This" entity or a specific entity index');
        if (latestEntity !== undefined && entityIndex !== undefined) throw new Error('Must reference ONLY one of the options: "This" entity or a specific entity index');

        const entityIndexOrDescription = (latestEntity === undefined) ? Number((entityIndex || '').replace('#', '')) : 'latest';

        // Actually get entity
        return this.infra.testFlowManager.currentStatus.currentScenario.scenarioData.getEntity(userEntityType, entityIndexOrDescription);
    }

    public async matchFields(value: string): Promise<PropertyFields> {
        return this.infra.utils.parser.parseFieldPairs(value);
    }
}

export {ParameterTypes};
