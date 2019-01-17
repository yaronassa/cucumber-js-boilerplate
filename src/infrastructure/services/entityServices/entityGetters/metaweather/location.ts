import {AbstractEntityGetter} from "../abstractEntityGetter";
import {IDataEntity, IEntityType} from "../../../../logic/entities";
import {PropertyFields} from "../../../../logic/propertyFields";
import {IMetaWeatherAPILocationResponse} from "../../../../testEnvironment/metaWeather/metaWeatherAPI";

class LocationEntityGetter extends AbstractEntityGetter {
    public async getEntity(entityType: IEntityType, fromEntity: IDataEntity, matchFields: PropertyFields): Promise<IDataEntity> {
        switch (entityType.typeName) {
            case 'location':
                const locationData = await this.getLocationEntityData(fromEntity, matchFields);
                return this.constructEntity(locationData, entityType, fromEntity, matchFields);
            case 'location_list':
                const locationListData = await this.getLocationListEntityData(fromEntity, matchFields);
                return this.constructEntity(locationListData, entityType, fromEntity, matchFields);
            default:
                throw new Error(`Unknown Location entity type: ${entityType.typeName}`);
        }
    }

    private async getLocationEntityData(fromEntity: IDataEntity, matchFields: PropertyFields): Promise<IMetaWeatherAPILocationResponse> {
        if (fromEntity === undefined) throw new Error('Cannot get location without a reference location list');

        const locationList: IMetaWeatherAPILocationResponse[] = fromEntity.entity || [];

        const filteredList = await this.infra.utils.filterArrayByProps(locationList, matchFields);

        return filteredList[0];
    }

    private async getLocationListEntityData(fromEntity: IDataEntity, matchFields: PropertyFields): Promise<IMetaWeatherAPILocationResponse[]> {
        const query = matchFields.getField('query', undefined).fieldValue;
        const lattlong = matchFields.getField('lattlong', undefined).fieldValue;

        if (query === undefined && lattlong === undefined) throw new Error('Must specify a text / lattlong search');
        if (query !== undefined && lattlong !== undefined) throw new Error('Must specify only a text OR (i.e. XOR) lattlong search');

        const queryField = (query !== undefined) ? 'query' : 'lattlong';
        const queryValue = query || lattlong;

        const result = await this.infra.testEnvironment.metaWeather.searchLocation(queryField, queryValue);

        return result;
    }

}

export default LocationEntityGetter;

