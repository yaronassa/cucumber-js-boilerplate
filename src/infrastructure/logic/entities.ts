import {InfrastructureObject} from "../infrastructureObject";
import {PropertyFields} from "./propertyFields";
import {AbstractFieldMutator} from "./fieldMutators/abstractFieldMutator";

interface IDataEntity {
    type: IEntityType
    entity: any,
    getterInfo?: {
        matchFields: PropertyFields,
        fromEntity: IDataEntity
    },
    created?: boolean,
    deleted?: boolean,
    undoActions?: Array<{action: 'create' | 'update', undoFields: PropertyFields}>,
    history: any[]
}

// TODO:IMPLEMENT_ME - Add your own systems

enum System {
    json,
    metaweather,
    demo,
    internal
}

type EntityOperation = 'get' | 'assert' | 'create' | 'update';

interface IEntityType {
    typeName: string
    system: System,
    isList: boolean,
    rootTypeName: string,
    fullTypeName: string
}

import * as EmptyMutator from './fieldMutators/internal/emptyMutator';

class EntitiesLogic extends InfrastructureObject {

    public getEntityType(rawUserType: string = ''): IEntityType {

        // TODO:IMPLEMENT_ME - Add your own type-decision algorithm

        const {system, processedUserType} = this.processRawTypeSystem(rawUserType);

        const isList = / list$/i.test(processedUserType);

        const typeName = processedUserType.toLowerCase().replace(/ /g, '_');
        const rootTypeName = this.getRootTypeName(system, typeName);

        return {
            system,
            isList,
            rootTypeName,
            typeName,
            fullTypeName: `${System[system]}_${typeName}`
        };
    }

    public async mutateFields(entityType: IEntityType, fromEntity: IDataEntity, matchFields: PropertyFields, operation: EntityOperation): Promise<PropertyFields> {
        const importRoute = `./fieldMutators/${System[entityType.system]}/${entityType.rootTypeName}`;

        // TODO:IMPLEMENT_ME - Add your entities mutators to ./fieldMutators sub folders

        // tslint:disable-next-line:variable-name
        let FieldMutator;
        try {
            FieldMutator = await import(importRoute);
        } catch (e) {
            if (!this.infra.config.logic.allowDefaultFieldMutator) {
                throw new Error(`Cannot locate field mutator for type ${entityType.typeName}.\nSwitch logic.allowDefaultFieldMutator config on for default empty mutator`);
            }

            FieldMutator = EmptyMutator;
        }

        const fieldMutator = new FieldMutator.default() as AbstractFieldMutator;

        return fieldMutator.mutateFields(entityType, fromEntity, matchFields, operation);
    }

    private getRootTypeName(system: System, typeName: string): string {
        // TODO:IMPLEMENT_ME - Add your own entities and root types

        let rootTypeName = typeName.replace(/_list(?:_count)?$/, '');
        if (System[system] === 'demo') rootTypeName = 'demo';

        switch (rootTypeName) {
            case 'location':
                rootTypeName = 'location';
                break;
            case 'forecast':
            case 'historical_forecast':
                rootTypeName = 'forecast';
                break;
            case 'property':
                rootTypeName = 'internal';
                break;
        }

        return rootTypeName;
    }

    private processRawTypeSystem(rawUserType: string): {system: System, processedUserType: string} {
        // TODO:IMPLEMENT_ME - Add your own system detection matchers

        rawUserType = rawUserType.trim();

        const systemMatchers = {
            json: [/^jsonplaceholder/i, /^json/i, /^user(?:[ -_]list)?/i],
            metaweather: [/^(:?meta[_ \-]?)?weather/i],
            demo: [/^demo/i],
            internal: [/^property$/]
        };

        const systemMatcher = Object.entries(systemMatchers).find(entry => {
            const [id, matchers] = entry;
            return matchers.some(matcher => matcher.test(rawUserType));
        });

        const system = (systemMatcher) ? System[systemMatcher[0]] : System.metaweather;

        let processedUserType = (systemMatchers[System[system]] as RegExp[]).reduce((acc, regexp) => acc.replace(regexp, ''), rawUserType).trim();

        if (processedUserType.startsWith('_')) processedUserType = processedUserType.substr(1);

        if (processedUserType === '') processedUserType = rawUserType.toLowerCase();

        return {system, processedUserType};
    }

}

export {EntitiesLogic, IDataEntity, System, IEntityType};
