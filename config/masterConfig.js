/**
 * @typedef {object} TestAutomationConfiguration
 * @property {TestRunnerConfiguration} testRunner Configuration options for the test runner
 * @property {InfrastructureConfiguration} infra Configuration options for the actual infrastructure
 * @property {BuildConfiguration} build Information on the build this run operation in (if applicable)
 * @property {MetaTestConfiguration} test Configuration options for the project's meta-test suite
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
                defaultTagArgs : '--tags=not @debug',
                defaultRunArgs : ['-r', './src/features', './src/features'],
                passThroughArgs : ['-d',  '--dry-run','--no-strict'],
                ignoreHooks : false,
                strict : false,
                rerunFile : '@rerun.txt',
                resultFile : 'results/cucumberResults.json'
            }
        },
        infra : {
            testEnvironment : {
                cleanCreatedEntities : true
            },
            utils : {
                passwordManager: {
                    passwordFile : '../../passwords/outputtedPasswords.json'
                }
            }
        },
        test : {
            
        }
    };
    
    
    return config;
};


module.exports = getMasterConfig();