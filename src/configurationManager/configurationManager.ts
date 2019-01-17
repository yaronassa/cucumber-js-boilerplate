import {IAutomationConfig} from "./IAutomationConfig";
const path = require('path');
const fs = require('fs');
const configPath = path.resolve(__dirname, '../../config');

const deepAssign = require('assign-deep');


// tslint:disable-next-line:max-line-length
const getConfig = (configFiles: string[] = [], configParams: Array<{paramPath: string, paramValue: string}> = [], attemptToLoadLocalConfig: boolean = true): IAutomationConfig => {

    let currentConfig: IAutomationConfig = {};

    if (attemptToLoadLocalConfig && fs.existsSync(path.resolve(configPath, 'local.ts'))) configFiles.unshift(path.resolve(configPath, 'local.ts'));
    if (configFiles.indexOf(path.resolve(configPath, 'master.ts')) < 0) configFiles.unshift(path.resolve(configPath, 'master.ts'));

    configFiles.forEach(file => {
        const filePath = path.resolve(configPath, file);
        if (!fs.existsSync(filePath)) {
            throw new Error('ERROR - Cannot load config file ' + filePath);
            return;
        }

        let configContents = require(filePath);
        if (configContents.default !== undefined) configContents = configContents.default;

        currentConfig = deepAssign({}, currentConfig, configContents);
    });

    console.log(`Merged configuration from ${configFiles.length} files: ${configFiles.join(', ')}`);

    const overrideParam = (paramPath: string, paramValue: any) => {
        let target = currentConfig;

        switch (paramValue.toLowerCase()) {
            case 'false':
            case 'true':
                paramValue = /true/i.test(paramValue);
                break;
            default:
                break;
        }

        paramPath.split('.').every(function overrideConfigPath(currentPath, index, arr) {
            if (target[currentPath] === undefined) {
                if (arr[index - 1] !== 'externalParams') throw new Error(`Current config doesn't have path ${paramPath}`);
                target[currentPath] = {};
            }

            if (index === arr.length - 1) {
                target[currentPath] = paramValue;
            } else {
                target = target[currentPath];
            }
            return true;
        });
    };

    // Override config entries with manually given items
    configParams.forEach(item => overrideParam(item.paramPath, item.paramValue));

    if (configParams.length > 0) console.log(`Merged configuration from ${configParams.length} parameters`);

    // Override config entries with env params
    const envKeys = Object.keys(process.env).filter(key => key.startsWith('configParam_'));
    envKeys.forEach(key => {
        const paramPath = key.replace('configParam_', '').replace(/_/g, '.');
        const paramValue = process.env[key];
        overrideParam(paramPath, paramValue);
    });

    if (configParams.length > 0) console.log(`Merged configuration from ${envKeys.length} environment variables`);


    return currentConfig;

};

export {getConfig};
