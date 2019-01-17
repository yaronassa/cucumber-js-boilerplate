import {InfrastructureObject} from "../../infrastructureObject";
import {PropertyFields} from "../../logic/propertyFields";

interface IDemoEntity {
    id: number,
    wasCreated: boolean,
    requestFields: PropertyFields,
    properties: {[key: string]: any}
}

class DemoCRUD extends InfrastructureObject {
    private demoEntities: IDemoEntity[] = [];
    private generatedEntitiesCount: number = 0;

    public async createEntity(creationFields: PropertyFields): Promise<number> {
        const entity = this.generateAndStoreDemoEntity(creationFields, true);
        return entity.id;
    }

    public async getDemoEntity(matchFields: PropertyFields): Promise<IDemoEntity> {
        const matchingEntities: IDemoEntity[] = await this.infra.utils.filterArrayByProps(this.demoEntities, matchFields);
        const result = matchingEntities.pop();

        return result;
    }

    public async deleteDemoEntity(id: number) {
        if (this.demoEntities.find(entity => entity.id === id) === undefined) throw new Error(`Cannot find entity with ID = ${id}`);
        this.demoEntities = this.demoEntities.filter(entity => entity.id !== id);
    }

    public async updateDemoEntity(id: number, updateFields: PropertyFields) {
        const entityToUpdate = this.demoEntities.find(entity => entity.id === id);
        if (entityToUpdate === undefined) throw new Error(`Cannot find entity with ID = ${id}`);
        updateFields.forEach(field => entityToUpdate.properties[field.fieldName] = field.fieldValue.toString());
    }

    private generateAndStoreDemoEntity(generationFields: PropertyFields, wasCreated: boolean): IDemoEntity {
        const properties: {[key: string]: any} = {};
        generationFields.forEach(field => properties[field.fieldName] = field.fieldValue);
        properties.id = this.generatedEntitiesCount;

        this.generatedEntitiesCount = this.generatedEntitiesCount + 1;

        const result: IDemoEntity = {
            wasCreated,
            properties,
            requestFields: generationFields,
            id: properties.id
        };

        this.demoEntities.push(result);

        return result;
    }

}

export {DemoCRUD};
