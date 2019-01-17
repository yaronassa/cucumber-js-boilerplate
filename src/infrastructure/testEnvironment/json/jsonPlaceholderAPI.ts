import {InfrastructureObject} from "../../infrastructureObject";
import {PropertyFields} from "../../logic/propertyFields";

const https = require('https');

// See http://jsonplaceholder.typicode.com/ for specifications

interface IJSONPlaceholderAPIUser {
    id: number,
    name: string,
    email: string,
    username: string,
    address: {street: string, city: string, zipcode: string, geo: {lat: string, lng: string}},
    phone: string,
    website: string,
    company: {name: string, catchPhrase: string, bs: string}
}

class JsonPlaceholderAPI extends InfrastructureObject {

    public get baseURL(): string {
        return this.infra.config.testEnvironment.jsonPlaceholder.baseURL;
    }

    public async getUsers(matchFields: PropertyFields): Promise<IJSONPlaceholderAPIUser[]> {
        let getURL = `${this.baseURL}/users`;
        if (matchFields.length > 0) getURL = getURL + '?' + matchFields.toString('&');

        const result = await this.getHTTPSResponse(getURL) as IJSONPlaceholderAPIUser[];

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

export {JsonPlaceholderAPI, IJSONPlaceholderAPIUser};
