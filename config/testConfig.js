
/**
 * Returns the test overrides to the config object
 * @return {{}}
 */
let testConfig = function getMasterConfig() {
    let config = {
        build : {

        },
        testRunner : {
            skipFailedRerun : true,
            metaTestRun : true,
            reports : [{
                name : 'html',
                pluginFileName : 'htmlReportPlugin.js',
                reportPath : './results/testCucumberResults.html',
                reportTitle : 'Meta - Test run'
            }, {
                name : 'slack',
                enabled : false
            }],
            cucumber : {
                defaultRunArgs : ['-r', './test/testInfrastructure',  '-r', './test/testFeatures', './test/testFeatures'],
                rerunFile : '@testRerun.txt',
                resultFile : 'results/testCucumberResults.json'
            }
        },
        infra : {

        }
    };


    return config;
};


module.exports = testConfig();