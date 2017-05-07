/* eslint-disable no-unused-vars */
/**
 * Abstract report plugin class to be extended
 */
class AbstractReportPlugin{

    /**
     * Plugin friendly name
     * @returns {string}
     */
    get pluginName() {return 'Abstract';}
    
    /**
     * Actually produce the report.
     * Must return a promise
     * @param {TestAutomationConfiguration} config The run configuration object
     * @param {{completed: boolean, succeeded: boolean, isCatastrophic: boolean, stderr: string}} runResult Did the run failed catastrophically
     * @returns {Promise}
     */
    produceReport(config, runResult){
        
    }

    /**
     * Returns the specific configuration sub-object for the report
     * @param {TestAutomationConfiguration} config
     * @returns {object} The sub-configuration object
     */
    getReporterConfiguration(config) {
        return config.testRunner.reports.find(subConfig => subConfig.name === this.pluginName);
    }
}

module.exports = AbstractReportPlugin;