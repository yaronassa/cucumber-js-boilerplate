
/**
 * @typedef {object} InfrastructureConfiguration
 * @property {InfraTestEnvironmentConfiguration} testEnvironment Configurations relating to the test environment
 */


/**
 * Singleton marker
 * @type {AutomationInfrastructure}
 */
let singletonInfrastructure = undefined;

let configurationReader = require('../../config/configReader');

/**
 * Main access point for the proprietary test automation infrastructure
 */
class AutomationInfrastructure {

    /**
     * Builds the automation infrastructure object tree
     * @param {boolean} [createNew=false] Should we forcefully create a new instance
     */
    constructor(createNew=false){
        if (singletonInfrastructure && !createNew) return singletonInfrastructure;
        // eslint-disable-next-line consistent-this
        if (!singletonInfrastructure) singletonInfrastructure = this;

        this._config = configurationReader.getConfig();

        /** @type {Assert} */
        this.assert = new (require('./assert/assert'))(this);
        /** @type {CucumberFacades} */
        this.cucumberFacades = new (require('./cucumberFacades/cucumberFacades'))(this);
        /** @type {TestFlow} */
        this.testFlow = new (require('./testFlow/testFlow'))(this);
        /** @type {Utils} */
        this.utils = new (require('./utils/utils'))(this);
        /** @type {Data} */
        this.data = new (require('./data/data'))(this);
        /** @type {TestEnvironment} */
        this.testEnvironment = new (require('./testEnvironment/testEnvironment'))(this);
        /** @type {Logic} */
        this.logic = new (require('./logic/logic'))(this);
        /** @type {Services} */
        this.services = new (require('./services/services'))(this);
    }

    /**
     * The current run configuration (entire config tree)
     * @returns {TestAutomationConfiguration}
     */
    get allConfig(){
        return this._config;
    }

    /**
     * The current infra configuration
     * @returns {InfrastructureConfiguration}
     */
    get config(){
        return this._config.infra;
    }

    /**
     * Proxy for the infrastructure logger
     * @param {string} [level='log'] The logging level
     * @param {string} message The message to log
     * @param {string} [indentAction='none'] Should we open / close a log indent
     */
    log(message, level='log', indentAction='none'){
        this.utils.logHelper[level.toLowerCase()](message);
        if (/^(open|add)$/i.test(indentAction)) this.utils.logHelper.addIndent();
        if (/^(close|remove)$/i.test(indentAction)) this.utils.logHelper.removeIndent();
    }
}

module.exports = AutomationInfrastructure;