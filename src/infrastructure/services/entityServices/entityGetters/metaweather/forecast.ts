import {AbstractEntityGetter} from "../abstractEntityGetter";
import {IDataEntity, IEntityType} from "../../../../logic/entities";
import {PropertyFields} from "../../../../logic/propertyFields";
import {IMetaWeatherAPIForecastResponse, IMetaWeatherAPIHistoricalForecastResponse, IMetaWeatherAPILocationResponse} from "../../../../testEnvironment/metaWeather/metaWeatherAPI";

class LocationEntityGetter extends AbstractEntityGetter {
    public async getEntity(entityType: IEntityType, fromEntity: IDataEntity, matchFields: PropertyFields): Promise<IDataEntity> {
        switch (entityType.typeName) {
            case 'forecast':
                const forecastData = await this.getForecastEntityData(fromEntity, matchFields);
                return this.constructEntity(forecastData, entityType, fromEntity, matchFields);

            case 'historical_forecast':
                const historicalForecastData = await this.getHistoricalForecastEntityData(fromEntity, matchFields);
                return this.constructEntity(historicalForecastData, entityType, fromEntity, matchFields);

            default:
                throw new Error(`Unknown Forcast entity type: ${entityType.typeName}`);
        }
    }

    private async getForecastEntityData(fromEntity: IDataEntity, matchFields: PropertyFields): Promise<IMetaWeatherAPIForecastResponse> {
        const woeid = this.getWOEID(fromEntity, matchFields);

        const data = await this.infra.testEnvironment.metaWeather.getForecast(woeid);
        return data;
    }

    private async getHistoricalForecastEntityData(fromEntity: IDataEntity, matchFields: PropertyFields): Promise<IMetaWeatherAPIHistoricalForecastResponse[]> {
        const woeid = this.getWOEID(fromEntity, matchFields);
        const date = matchFields.getField('date').fieldValue;

        const data = await this.infra.testEnvironment.metaWeather.getHistoricalForecast(woeid, date);
        return data;
    }

    private getWOEID(fromEntity: IDataEntity, matchFields: PropertyFields): string {
        const fromEntityWOEID = (fromEntity) ? fromEntity.entity.woeid : undefined;
        const woeid = matchFields.getField('woeid', fromEntityWOEID).fieldValue;
        if (woeid === undefined) throw new Error('Must specify woeid or reference a location entity');

        return woeid;
    }

}

export default LocationEntityGetter;

