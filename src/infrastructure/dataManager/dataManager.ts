import {InfrastructureObject} from "../infrastructureObject";
import {IPasswordItem} from "../../runHelpers/passwordManager";
import {IDataEntity} from "../logic/entities";
import {PropertyFields} from "../logic/propertyFields";

class DataManager extends InfrastructureObject {
    public globalData: {
        globalVariables: {[name: string]: string}
    } = {globalVariables: {} };

    private readonly passwords: IPasswordItem[];

    constructor(passwords: IPasswordItem[]) {
        super();
        this.passwords = passwords;
    }

    public getUserPassword(system: string, domain: string, user: string): string {
        const lowerUser = user.toLowerCase();
        const lowerDomain = domain.toLowerCase();
        const lowerSystem = system.toLowerCase();

        // TODO:IMPLEMENT_ME - If you changed the IPasswordItem structure, these will probably also need changing


        const entry = this.passwords.find(
            item => (item.system || '').toLowerCase() === lowerSystem
                && (item.domain || '').toLowerCase() === lowerDomain
                && (item.user || '').toLowerCase() === lowerUser
        );

        if (entry === undefined) throw new Error(`Could not find password for ${system} / ${domain} / ${user}`);

        return entry.password;
    }

    public getScenarioEntitiesToUndo(): IDataEntity[] {
        const currentScenario = this.infra.testFlowManager.currentStatus.currentScenario;
        if (currentScenario === undefined) return [];
        return currentScenario.scenarioData.getEntitiesToUndo();
    }

    public getScenarioEntity(rawUserEntityType: string, index: number | 'latest'): IDataEntity {
        const currentScenario = this.infra.testFlowManager.currentStatus.currentScenario;
        if (currentScenario === undefined) return undefined;
        return currentScenario.scenarioData.getEntity(rawUserEntityType, index);
    }

    public storeScenarioEntity(entity: IDataEntity) {
        const currentScenario = this.infra.testFlowManager.currentStatus.currentScenario;
        if (currentScenario === undefined) throw new Error(`Cannot store scenario entity - currentScenario is null`);

        currentScenario.scenarioData.storeEntity(entity);
    }

    public refreshScenarioEntity(refreshedEntity: IDataEntity, existingEntity: IDataEntity) {
        existingEntity.history.push(existingEntity.entity);
        existingEntity.entity = refreshedEntity.entity;
    }

    public storeRawEntityData(rawValue: any, typeName: string, matchFields?: PropertyFields, fromEntity?: IDataEntity) {

        const entity: IDataEntity = {
            type: this.infra.logic.entities.getEntityType(typeName),
            entity: rawValue,
            getterInfo: {
                matchFields,
                fromEntity
            },
            history: []
        };

        this.storeScenarioEntity(entity);
    }


}

export {DataManager};
