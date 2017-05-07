let AbstractReportPlugin = require('./abstractReportPlugin.js');

let fs = require('fs');
let engine = require('superagent').agent();

/**
 * A report plugin for slack integration
 * @augments {AbstractReportPlugin}
 */
class SlackReportPlugin extends AbstractReportPlugin {
    /** @inheritDoc */
    get pluginName() {return 'slack';}

    /**
     * Replaces template codes with the actual data
     * @param {string} template The source template
     * @param {{totalScenarioCount: number|string, failedScenarios : string[]}} reportData The analyzed report data
     * @param {TestAutomationConfiguration} config
     * @private
     */
    static _fillTemplate(template, reportData, config){
        let result = template;
        result = result.replace('{TOTAL_SCENARIOS_COUNT}', reportData.totalScenarioCount);
        result = result.replace('{FAILED_SCENARIOS_COUNT}', reportData.failedScenarios.length.toString());
        result = result.replace('{FAILED_SCENARIOS_CONTENT}', reportData.failedScenarios.join('\n\n'));
        result = result.replace('{BUILD_NUMBER}', (config.build.buildNumber) ? config.build.buildNumber.toString() : '');
        
        return result;
    }

    /** @inheritDoc */
    produceReport(config, runResult){
        
        /** @type {{includeTags: string[], slackWebhookURL: string, buildLinkTemplate: string, reportTitle : string, passedTemplate: string, failedTemplate: string, errorsTemplate: string}} */
        let reporterConfiguration = this.getReporterConfiguration(config);

        let reportData = SlackReportPlugin._analyzeCucumberResult(config, runResult, reporterConfiguration.includeTags);
        
        let passedMessage = SlackReportPlugin._fillTemplate(reporterConfiguration.passedTemplate, reportData, config);
        let failedMessage = SlackReportPlugin._fillTemplate(reporterConfiguration.failedTemplate, reportData, config);
        let errorsMessage = SlackReportPlugin._fillTemplate(reporterConfiguration.errorsTemplate, reportData, config);
        let buildURL = SlackReportPlugin._fillTemplate(reporterConfiguration.buildLinkTemplate, reportData, config);
        
        let textMessage = (runResult.succeeded) ? passedMessage : failedMessage;
        let errors = (runResult.succeeded) ? 'All OK' : errorsMessage;

        let errorBlock = {
            'title' : '',
            'value' : errors,
            'short' : false
        };

        let payload = {
            'attachments':[
                {
                    'fallback':textMessage,
                    'pretext' : (runResult.succeeded) ? ':white_check_mark: Run Passed' : ':x: Run Failed',
                    'color': (runResult.succeeded) ? '#00CC00' : '#D00000',
                    'fields':[
                        {
                            'title':'Build',
                            'value':buildURL,
                            'short':true
                        },
                        {
                            'title': reporterConfiguration.reportTitle + ' Scenarios',
                            'value': reportData.failedScenarios.length + ' Failed / ' + reportData.totalScenarioCount + ' Total',
                            'short':true
                        }
                    ],
                    'mrkdwn_in': ['fields']
                }
            ]
        };

        if (!runResult.succeeded) payload.attachments[0].fields.push(errorBlock);

        let operation = engine.post(reporterConfiguration.slackWebhookURL).send(payload);

        console.log('\nProducing Slack report\n');

        return new Promise(resolve => {
            return operation
                .end((err, result) => {
                    if (err) {
                        let message = 'Failed to perform HTTP call to ' + operation.url + ': ' + err.message;
                        if (err.response && err.response.text) message += '\n' + err.response.text;
                        console.error(message);
                        //Don't reject
                    }
                    return resolve(result.body);
                });
        });
    }

    /**
     * Analyzes the output JSON to determine the slack payload
     * @param {TestAutomationConfiguration} config The run configuration object
     * @param {{completed: boolean, succeeded: boolean, isCatastrophic: boolean, stderr: string}} runResult Did the run failed catastrophically
     * @param {string[]} includeTags Tag inclusion filter for aggregating scenarios
     * @returns {{totalScenarioCount: number|string, failedScenarios : string[]}}
     * @private
     */
    static _analyzeCucumberResult(config, runResult, includeTags){
        
        if (runResult.isCatastrophic) return {totalScenarioCount : 'NA', failedScenarios : [runResult.stderr]};

        let resultsJSON = JSON.parse(fs.readFileSync(config.testRunner.cucumber.resultFile).toString());
        let totalScenarioCount = 0;
        let failedScenarios = resultsJSON.reduce((acc, feature) => {
            feature.elements.forEach(scenario => {

                if (includeTags !== undefined && includeTags.length > 0) {
                    if (!scenario.tags.some(tag => includeTags.indexOf(tag.name.toLowerCase()) >= 0)) return;
                }

                totalScenarioCount = totalScenarioCount+1;
                scenario.steps.some(step => {
                    if (step.result.status === 'passed') return false;
                    let error;
                    if (step.result.error_message) {
                        error = step.result.error_message.match(/^.*(\n)?.*?at.*/) || [step.result.error_message];
                    } else {
                        error = 'failed, but no error message';
                    }

                    error = error[0];
                    error = error.replace(/\n/g, ' | ');
                    error = error.replace(/at \/?.+\/([^\/]+.js:\d+:\d+)/g, '`$1`');
                    if (error.length > 150) error = error.substr(0,147) + '...';
                    acc.push('*' + scenario.name + '*' + ': _' + step.name + '_ \n' + error);
                    return true;
                });
            });
            return acc;
        }, []);

        return {totalScenarioCount, failedScenarios};
        
    }
}

module.exports = SlackReportPlugin;