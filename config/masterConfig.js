/**
 * @typedef {object} TestAutomationConfiguration
 * @property {TestRunnerConfiguration} testRunner Configuration options for the test runner
 * @property {InfrastructureConfiguration} infra Configuration options for the actual infrastructure
 * @property {BuildConfiguration} build Information on the build this run operation in (if applicable)
 */

/**
 * @typedef {object} TestRunnerConfiguration
 * @property {boolean} debugMode Run cucumber in debug mode (=in process)
 * @property {('local'|'integration','projectBuild')} runType The main category of this test run
 * @property {boolean} skipFailedRerun **SKIP** processing the failed-rerun file
 * @property {boolean} dryRun Is this a cucumber dry run (nothing is actually run)
 * @property {boolean} metaTestRun Is this a run that tests the automation infrastructure internals
 * @property {boolean} printConfig Should we print the run config
 * @property {TestRunnerReportConfiguration[]} reports Configuration for the runner report
 * @property {TestRunnerCucumberConfiguration} cucumber Configuration for the cucumber engine
 */

/**
 * @typedef {object} TestRunnerReportConfiguration
 * @property {string} name The plugin user friendly name
 * @property {string} pluginFileName The plugin file to require (expected to be in runHelpers/reportPlugins)
 */

/**
 * @typedef {object} TestRunnerCucumberConfiguration
 * @property {string[]} defaultTagArgs Default tags to run
 * @property {string[]} defaultRunArgs Default run arguments to be passed to the cucumber CLI
 * @property {string[]} passThroughArgs Process arguments to pass to the CLI if present (beside --tags arguments)
 * @property {boolean} ignoreHooks Cucumber should skip / run hooks
 * @property {boolean} strict Run in strict mode (undefined steps throw the entire run)
 * @property {string} rerunFile The expected cucumber rerun file
 * @property {string} resultFile The path to the cucumber output file
 */

/**
 * @typedef {object} BuildConfiguration
 * @property {number} [buildNumber] The current build number (if applicable)
 * @property {string} [triggeredBy] Who triggered this build (if applicable)
 */

/**
 * @typedef {object} InfrastructureConfiguration
 * @property {InfraTestEnvironmentConfiguration} testEnvironment Configurations relating to the test environment
 */

/**
 * @typedef {object} InfraTestEnvironmentConfiguration
 * @property {boolean} [cleanCreatedEntities=true] Removed created entities at the end of the scenario
 */

/**
 * Returns the master config object
 * @return {TestAutomationConfiguration}
 */
let getMasterConfig = function getMasterConfig() {
    /** @type {TestAutomationConfiguration} */
    let config = {
        build : {
           
        },
        testRunner : {
            debugMode : true,
            runType : 'local',
            dryRun : false,
            skipFailedRerun : true,
            metaTestRun : false,
            printConfig : false,
            reports : [{
                name : 'html',
                pluginFileName : 'htmlReportPlugin.js',
                reportPath : './results/cucumberResults.html',
                reportTitle : 'Test run',
                enabled : true
            },{
                name : 'slack',
                pluginFileName : 'slackReportPlugin.js',
                reportTitle : 'Test run',
                passedTemplate: '{TOTAL_SCENARIOS_COUNT} Scenarios Passed',
                failedTemplate: 'RUN FAILED: {FAILED_SCENARIOS_COUNT} scenario(s) failed',
                errorsTemplate: '{FAILED_SCENARIOS_CONTENT}',
                buildLinkTemplate: '< http://some.ci.build.server/{BUILD_NUMBER} | #{BUILD_NUMBER}>',
                slackWebhookURL : 'https://hooks.slack.com/services/TOKEN',
                includeTags : [],
                enabled : false //enabled one slack is setup
            }],
            cucumber : {
                defaultTagArgs : ['--tags=~@debug', '--tags=~@skip'],
                defaultRunArgs : ['-r', './src/infrastructure',  '-r', './src/features', './src/features'],
                passThroughArgs : ['-d', '--strict', '--nohooks'],
                ignoreHooks : false,
                strict : false,
                rerunFile : '@rerun.txt',
                resultFile : 'results/cucumberResults.json'
            }
        },
        infra : {
            testEnvironment : {
                cleanCreatedEntities : true
            }
        }
    };
    
    
    return config;
};


module.exports = getMasterConfig();