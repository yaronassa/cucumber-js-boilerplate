import {InfrastructureObject} from "../../infrastructureObject";

const https = require('https');

// See https://www.metaweather.com/api/ for specifications

interface IMetaWeatherAPILocationResponse {
    title: string,
    location_type: 'City' | 'Region / State / Province' | 'Country' | 'Continent',
    latt_long: string,
    woeid: number,
    distance: number
}

interface IMetaWeatherAPIForecastResponse extends IMetaWeatherAPILocationResponse {
    consolidated_weather: IMetaWeatherAPIHistoricalForecastResponse[],
    parent: IMetaWeatherAPILocationResponse,
    time: Date,
    sun_rise: Date,
    sun_set: Date,
    timezone_name: string,
    sources: Array<{title: string, url: string}>
}

interface IMetaWeatherAPIHistoricalForecastResponse {
    id: number,
    applicable_date: Date,
    weather_state_name: string,
    weather_state_abbr: string,
    wind_speed: number,
    wind_direction: number,
    wind_direction_compass: string,
    min_temp: number,
    max_temp: number,
    the_temp: number,
    air_pressure: number,
    humidity: number,
    visibility: number,
    predictability: number
}

class MetaWeatherAPI extends InfrastructureObject {

    public get baseURL(): string {
        return this.infra.config.testEnvironment.metaWeather.baseURL;
    }

    public async getForecast(woeid: string): Promise<IMetaWeatherAPIForecastResponse> {
        const getURL = `${this.baseURL}/location/${woeid}/`;

        const result = await this.getHTTPSResponse(getURL) as IMetaWeatherAPIForecastResponse;

        return result;
    }

    public async getHistoricalForecast(woeid: string, date: string): Promise<IMetaWeatherAPIHistoricalForecastResponse[]> {
        const getURL = `${this.baseURL}/location/${woeid}/${date}/`;

        const result = await this.getHTTPSResponse(getURL) as IMetaWeatherAPIHistoricalForecastResponse[];

        return result;
    }

    public async searchLocation(queryField: 'query' | 'lattlong', fieldValue: string): Promise<IMetaWeatherAPILocationResponse[]> {
        const getURL = `${this.baseURL}/location/search/?${queryField}=${fieldValue}`;

        const result = await this.getHTTPSResponse(getURL) as IMetaWeatherAPILocationResponse[];

        return result;
    }


    private async getHTTPSResponse(getURL: string): Promise<any> {
        const result = await new Promise((resolve, reject) => {
            const response = [];

            https.get(getURL, res => {
                if (res.statusCode !== 200) {
                    res.resume();
                    return reject(new Error(`Bad status code: ${res.statusCode}`));
                }

                res
                    .on('data', d => response.push(d.toString()))
                    .on('error', reject)
                    .on('end', () => {
                        try {
                            const parsedData = JSON.parse(response.join(''));
                            return resolve(parsedData);
                        } catch (e) {
                            return reject(new Error(`Failed to parse response data: ${e.message}`));
                        }
                    });
            });
        });

        return result;
    }
}

export {MetaWeatherAPI, IMetaWeatherAPILocationResponse, IMetaWeatherAPIForecastResponse, IMetaWeatherAPIHistoricalForecastResponse};
