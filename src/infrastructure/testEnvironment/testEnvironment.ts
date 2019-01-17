import {InfrastructureObject} from "../infrastructureObject";
import {MetaWeatherAPI} from "./metaWeather/metaWeatherAPI";
import {JsonPlaceholderAPI} from "./json/jsonPlaceholderAPI";
import {DemoCRUD} from "./demoCRUD/demoCRUD";
import {IDataEntity} from "../logic/entities";
import {PropertyFields} from "../logic/propertyFields";

const bluebird = require('bluebird');

class TestEnvironment extends InfrastructureObject {
    public readonly metaWeather = new MetaWeatherAPI();
    public readonly jsonPlaceholder = new JsonPlaceholderAPI();
    public readonly demoCRUD = new DemoCRUD();

    // TODO:IMPLEMENT_ME - Add your own test environment accessors - APIs, DBs, File systems etc.

    public async afterScenario() {
        await this.undoScenarioChanges();

    }

    private async undoScenarioChanges() {
        if (this.infra.config.testEnvironment.behaviour.revertEntityChanges === false) {
            this.log('Skipping scenario entity reversions (due to config value)');
            return;
        }

        const currentScenarioTags = (this.infra.testFlowManager.currentStatus.currentScenario && this.infra.testFlowManager.currentStatus.currentScenario.pickle)
            ? this.infra.testFlowManager.currentStatus.currentScenario.pickle.tags
            : [];

        if (currentScenarioTags.some(tag => tag.name === '@skipRevert')) {
            this.log('Skipping scenario entity reversions (due to scenario @skipRevert tag)');
            return;
        }

        const entitiesToUndo = this.infra.data.getScenarioEntitiesToUndo();

        if (entitiesToUndo.length === 0) return;

        this.log(`Undoing actions on ${entitiesToUndo.length} entities`);

        const errors: Error[] = [];

        await bluebird.each(entitiesToUndo.reverse(), async (entity: IDataEntity) => {
            try {
                await bluebird.each(entity.undoActions.reverse(), async (operation: {action: 'create' | 'update', undoFields: PropertyFields}) => {
                    switch (operation.action) {
                        case 'create':
                            if (this.infra.config.testEnvironment.behaviour.revertEntityChanges[entity.type.typeName] === false) {
                                this.log(`Skipping deletion of ${entity.type.typeName} due to revertEntityChanges config`);
                                return;
                            }
                            return this.infra.services.entity.deleteEntity(entity);
                        case 'update':
                            return this.infra.services.entity.updateEntity(entity, operation.undoFields, false);
                        default:
                            throw new Error(`No undo handler for ${operation.action} action`);
                    }
                });
            } catch (e) {
                errors.push(e);
            }
        });

        this.log(`Finished undoing actions on ${entitiesToUndo.length} entities ${(errors.length > 0) ? '(' + errors.length + ' errors)' : 'successfully'}`);

        if (errors.length > 0) throw new Error(`Some undo actions failed: ${errors.map(e => e.message).join('\n')}`);
    }
}

export {TestEnvironment};
