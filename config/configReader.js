let path = require('path');
let fs = require('fs');
let deepAssign = require('deep-assign');

/**
 * Facilitates reading and parsing config files and parameters
 */
class ConfigReader {

    /**
     * Overrides special configuration parameters by reading run parameters
     * @param {TestAutomationConfiguration} currentConfig The current aggregated configuration object
     * @returns {TestAutomationConfiguration} The overridden object
     * @private
     */
    static _overrideSpecialConfigParams (currentConfig){
        let initArgs = process.argv;
        
        if (initArgs.some(arg => arg === '-d')) currentConfig.testRunner.dryRun = true;
        if (initArgs.some(arg => arg === '--nohooks')) currentConfig.testRunner.cucumber.ignoreHooks = true;
        if (initArgs.some(arg => arg === '--strict')) currentConfig.testRunner.cucumber.strict = true;
        
        let triggeredBy = initArgs.find(arg => arg.startsWith('--triggeredBy='));
        if (triggeredBy) currentConfig.build.triggeredBy = triggeredBy.replace('--triggeredBy=', '');

        let buildNumber = initArgs.find(arg => arg.startsWith('--buildNumber='));
        if (buildNumber) currentConfig.build.buildNumber = triggeredBy.replace('--buildNumber=', '');
        
        return currentConfig;
        
    }
    
    /**
     * Returns the aggregated config object from all the files and parameters
     * @param {string[]|string} [configFiles] Ability to add config files directly
     * @returns {TestAutomationConfiguration}
     */
    static getConfig (directConfigFiles){
        if (!Array.isArray(directConfigFiles)) directConfigFiles = [directConfigFiles].filter(file => (file !== undefined));
        let currentConfig = require(path.resolve(__dirname, 'masterConfig.js'));
        
        let argsParser = require('optimist');

        //Get all command line --configFile values in an array
        let configFiles = directConfigFiles.concat(argsParser.argv.configFile).filter(item => (item));
        
        //Get all command line --configParam values in an array
        let configParams = [].concat(argsParser.argv.configParam).filter(item => (item));

        //Override config entries with files
        configFiles.forEach(file => {
            let filePath = path.resolve(__dirname, file);
            if (!fs.existsSync(filePath)) {
                console.error('ERROR - Cannot load config file ' + filePath);
                return;
            }

            let configFileContents = require(filePath);
            deepAssign(currentConfig, configFileContents);
            console.log('Merged configuration from ' + filePath);
        });

        //Override config entries with manually given items
        configParams.forEach(function processManualConfig(item) {
            let itemConfig = item.split('=');
            let configPath = itemConfig.splice(0,1)[0].split('.');
            let configValue = itemConfig.join('=');
            let target = currentConfig;

            switch(configValue.toLowerCase()){
                case 'false':
                case 'true':
                    configValue = /true/i.test(configValue);
                    break;
                default:
                    break;
            }

            configPath.every(function overrideConfigPath(currentPath, index, arr) {
                if (target[currentPath] === undefined) return false;

                if (index === arr.length - 1) {
                    target[currentPath] = configValue;
                } else {
                    target = target[currentPath];
                }
                return true;
            });
        });
        
        currentConfig = ConfigReader._overrideSpecialConfigParams(currentConfig);
        
        return currentConfig;
    }
}

module.exports = ConfigReader;