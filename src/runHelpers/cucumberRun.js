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
 * @property {string} defaultTagArgs Default tags to run
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
 * @typedef {object} CucumberRunArguments
 * @property {{isFailedRerun: boolean, skipFailedRerun: boolean, hasRerunFile: boolean}} rerun
 * @property {boolean} isDryRun
 * @property {boolean} isMetaTestRun
 * @property {string} runType
 * @property {string} triggeredBy
 * @property {number} buildNumber
 * @property {{slackReportChannel: string, slackTitle : string}} report
 * @property {boolean} debugMode
 */



let Promise = require('bluebird');

let configurationReader = require('../../config/configReader');

let path = require('path');
let fs = require('fs');



/**
 * A basic cucumber run, to be extended
 */
class CucumberRun {
    /**
     * @returns {CucumberRun}
     */
    constructor(){
        this.result = {
            completed : false,
            succeeded : false,
            isCatastrophic : false,
            stderr : ''
        };

        /** @type {TestAutomationConfiguration} */
        this._configuration = configurationReader.getConfig();
        this._initArgs = process.argv;

        this._processConfiguration();
    }

    /**
     * Access the test runner config
     * @returns {TestRunnerConfiguration} The test runner configuration
     */
    get testRunnerConfig() {
        return this._configuration.testRunner;
    }

    /**
     * Processes the initialization arguments for this run
     * @private
     */
    _processConfiguration(){

        this._tagArg = this._calculateTagArg();
        this._runArgs = this._calculateRunArgs();

        console.log(`\n\nRunning features with tags:${this._tagArg.replace('--tags=', '')}\n`);
    }

    /**
     * Checks if the environment has a valid rerun file
     * @returns {boolean}
     * @private
     */
    _hasRerunFile(){
        let rerunFile = this.testRunnerConfig.cucumber.rerunFile;
        return (fs.existsSync(`./${rerunFile}`) && fs.readFileSync(`./${rerunFile}`).toString().trim() !== '');
    }

    /**
     * Checks if this run should be a failed rerun
     * @returns {boolean}
     * @private
     */
    _calculateFailedRerun(){
        
        if (this.testRunnerConfig.isMetaTestRun) {
            console.log('Skipping failed-rerun:  This is a meta-test run.\n');
            return false;
        }

        if (!this._hasRerunFile()) {
            console.log('Skipping failed-rerun:  Empty / non-existent rerun file.\n');
            return false;
        }

        if (this.testRunnerConfig.skipFailedRerun) {
            console.log('Skipping failed-rerun:    Run was initiated with --skipFailedRerun\n');
            return false;
        }

        if ((this.testRunnerConfig.runType === 'integration')) {
            console.log('Skipping failed-rerun:    Integration run was triggered by ' + this._configuration.build.triggeredBy + '\n');
            return false;
        }

        return true;
    }

    /**
     * Cucumber output formatter options
     * @returns {string[]}
     * @protected
     */
    _calculateOutputArgs() {
        let outputArgs = ['-f', 'summary'];

        if (this.testRunnerConfig.cucumber.rerunFile) {
            outputArgs.push('-f');
            outputArgs.push(`rerun:${this.testRunnerConfig.cucumber.rerunFile}`);
        }

        if (this.testRunnerConfig.cucumber.resultFile) {
            outputArgs.push('-f');
            outputArgs.push(`json:${this.testRunnerConfig.cucumber.resultFile}`);
        }

        return outputArgs;
    }

    /**
     * Calculates the run arguments to be passed to cucumber
     * @returns {string[]}
     * @protected
     */
    _calculateRunArgs(){
        let defaultPassThroughArgs = this.testRunnerConfig.cucumber.passThroughArgs;
        let defaultRunArgs = this.testRunnerConfig.cucumber.defaultRunArgs;
        
        let passThroughArgs = this._initArgs.filter(arg => (defaultPassThroughArgs.indexOf(arg) >= 0));
        
        let tagArg = this._tagArg;
        
        let isFailedRerun = this._calculateFailedRerun();
        
        if (isFailedRerun) {
            let rerunFile = this.testRunnerConfig.cucumber.rerunFile;

            console.log(`** Performing failed rerun **\n${rerunFile} contents: \n${fs.readFileSync(`./${rerunFile}`)}\n\n`);
            tagArg = '';
            defaultRunArgs.pop();
            defaultRunArgs.push(rerunFile);
        }
        
        let outputArgs = this._calculateOutputArgs();


        return [].concat(defaultRunArgs).concat(tagArg.split('=')).concat(passThroughArgs).concat(outputArgs);
    }

    /**
     * Calculates the run tag args
     * @returns {string}
     * @protected
     */
    _calculateTagArg(){
        let defaultTagArgs = this.testRunnerConfig.cucumber.defaultTagArgs;
        
        let sentTagArgs = this._initArgs.filter(arg => arg.startsWith('--tags='));
        
        if (sentTagArgs.length > 1) throw new Error('More than 1 --tags parameter. Please migrate to the new tag expressions format.\nSee: https://docs.cucumber.io/tag-expressions/');
      
        switch (this._configuration.build.triggeredBy) {
            //Mutate tag args according to the trigger
            default:
                break;
        }
        
        let tagArg = (sentTagArgs.length === 0) ? defaultTagArgs : sentTagArgs[0];
        
        if (tagArg.indexOf('not @skip') < 0) tagArg = `${tagArg} and not @skip`;

        return tagArg;
    }

    /**
     * Downloads remote artifacts and resources to run environment
     * @private
     */
    _downloadRemoteArtifacts(){
        //TODO: implement
        return Promise.resolve();
    }

    /**
     * Sets up the run fs environment
     * @returns {Promise}
     */
    setupRunEnvironment(){
        
        let fsExtra = require('fs-extra');

        //Clear old runs data
        fsExtra.emptyDirSync('./temp');
        fsExtra.emptyDirSync('./results');
        
        return this._downloadRemoteArtifacts();

    }

    /**
     * Actually runs cucumber and returns the result
     * @returns {Promise<{result: boolean, stdout: string, stderr : string}>}
     */
    doRun(){
        if (this.testRunnerConfig.printConfig) console.log(`Running with options: ${JSON.stringify(this._configuration.testRunner, null, 1)} \n\n`);
        
        let runTarget;

        if (this.testRunnerConfig.debugMode) {
            runTarget = this._runCucumberInProcess();
        } else {
            runTarget = this._runCucumberExternally();
        }
        
        return runTarget;
    }

    /**
     * Runs cucumber as a CLI object in an externally spawned process
     * @return {Promise.<number>} The CLI exit code
     * @private
     */
    _runCucumberExternally(){
        console.log('\n\n************************ Starting Cucumber Run ************************\n\n');

        fs.writeFileSync('./temp/currentRunArgs.json', JSON.stringify(this._runArgs));

        let runProcess;
        let spawnArgs = ['./src/runHelpers/launchCucumberExternally.js'].concat(process.argv);

        return new Promise((resolve, reject) => {
            let stdoutOutput = [];
            let stderrOutput = [];

            runProcess = require('child_process').spawn('node', spawnArgs, {cwd : process.cwd(), env: process.env});
            runProcess.stdout.pipe(process.stdout);
            runProcess.stderr.pipe(process.stderr);

            runProcess.stdout.on('data', function(data){
                let str = data.toString();
                stdoutOutput.push(str.trim());
            });

            runProcess.stderr.on('data', function(data){
                let str = data.toString();
                stderrOutput.push(str);
            });

            /**
             * Combines and returns the run output
             * @return {{stdout: string, stderr: string}}
             */
            function getOutput(){
                let stdout = runProcess.stdout.read() || '';
                let stderr = runProcess.stderr.read() || '';

                stderr = stderrOutput.join('') + stderr.toString();
                stdout = stdoutOutput.join('') + stdout.toString();

                return {
                    stdout,
                    stderr
                };
            }

            runProcess.on('error', function(error){
                let output = getOutput();
                runProcess.kill();
                reject(new Error('Error spawning test process ' + output.stderr + '\n' + error.stack.toString() + '\n\n. Output: ' + output.stdout));
            });

            runProcess.on('exit', function(exitCode){
                let output = getOutput();
                runProcess.kill();
                return resolve({result: exitCode === 0, stdout: output.stdout, stderr: output.stderr});
            });

        }).finally(() => {
            fs.unlinkSync('./temp/currentRunArgs.json');
            console.log('\n\n************************ Cucumber Run Finished ************************\n\n');
        });
    
    }

    /**
     * Runs cucumber as a CLI object in the current process
     * @return {Promise.<number>} The CLI exit code
     * @private
     */
    _runCucumberInProcess(){
        console.log('\n\n************************ Starting In-Process Cucumber Run ************************\n\n');

        let cli = new (require('cucumber').Cli)({argv : this._runArgs, cwd: process.cwd(), stdout: process.stdout});
        
        return new Promise(function (resolve, reject) {
            try {
                return cli.run()
                    .then(resolve)
                    .catch(reject);
            } catch (e) {
                return reject(e);
            }

        }).catch(e => {
            console.log('Catastrophic failure: ' + e.message);

            return Promise.resolve(1);
        });

    }

    /**
     * Report to all plugin endpoints
     * @returns {Promise}
     */
    produceReports(){
        let _self = this;
        
        return Promise.mapSeries(this.testRunnerConfig.reports, report => {
            if (report.enabled === false) return Promise.resolve();
            return Promise.try(function(){
                /** @type {AbstractReportPlugin} */
                let reporter = new (require(path.resolve(__dirname, 'reportPlugins', report.pluginFileName)));
                return reporter.produceReport(_self._configuration, _self.result);
            }).catch(e => console.log(`Error producing ${report.name} report: ${e.message}`));
          
        });
    }

    /**
     * Processes the actual cucumber run output
     * @param {{result: boolean, stdout: string, stderr : string}} runOutput The actual run output
     */
    processOutput(runOutput){
        let expectedResultFile = this.testRunnerConfig.cucumber.resultFile;

        this.result.completed = true;
        this.result.succeeded = runOutput.result;
        this.result.stderr = runOutput.stderr;

        this.result.isCatastrophic = !(fs.existsSync(expectedResultFile) && fs.readFileSync(expectedResultFile).toString().trim() !== '');
    }
}

module.exports = CucumberRun;