/**
 * Main access point runner
 * Can still be consumed as a class
 */

import {Argv} from "yargs";
import {CucumberRunner, ICucumberRunOptions} from "./src/runHelpers/cucumberRunner";

const path = require('path');

const projectPath = path.resolve(__dirname);
const moment = require('moment');


/**
 * Runner for automation commands
 */
class AutomationInfrastructureRunner {
    /**
     * Run a command from arguments
     */
    public runFromArgs(): Promise<{result: boolean, error?: Error}> {
        const pendingPromise = this.getPendingPromise<{result: boolean, error?: Error}>();

        require('yargs')
            .command(
                'cucumber', 'Run the infrastructure cucumber scenarios',
                args => this.parseRunCucumberArgs(args),
                args => this.doRunCucumber(args as ICucumberRunOptions).then(pendingPromise.finishedOK).catch(pendingPromise.finishedError)
            )
            .demandCommand(1, 1)
            .parse();


        return pendingPromise.result;
    }

    /**
     * Perform an infrastructure automation cucumber run
     * @param options The run options
     */
    public async doRunCucumber(options: ICucumberRunOptions): Promise<{result: boolean, error?: Error}> {
        const runner = new CucumberRunner(options);

        const result = await runner.run();

        return result;
    }

    /**
     * Parses arguments for standard infrastructure cucumber run
     * @param commandArgs The process command args
     */
    private parseRunCucumberArgs(commandArgs: Argv): Argv {
        return commandArgs
            .option('workPath', {
                string: true,
                describe: 'Work directory',
                default: path.resolve(projectPath, 'temp', moment().format('DDMMYY_HHmm'))
            })
            .option('cucumberLibPath', {
                string: true,
                describe: 'The relative cucumber library path (containing features and support files)',
                default: path.resolve(projectPath, 'src', 'cucumber'),
                hidden: true
            })
            .options('configFile', {
                describe: 'Config override files',
                alias: 'configFiles',
                array: true
            })
            .option('configParam', {
                alias: 'configParams',
                describe: 'Specific config overrides',
                array: true,
                coerce: arg => arg.map(item => {
                    const [paramPath, paramValue] = item.split('=');
                    return {paramPath, paramValue};
                })
            })
            .group(['configParam', 'configFile'], 'Configuration')
            .option('tags', {
                string: true,
                describe: 'Tag expression to run (not @skip will be added by default)',
                default: '@debug'
            })
        .option('passwordFilesPath', {
            string: true,
            describe: 'Passwords file locations',
            default: path.resolve(projectPath, 'passwords'),
            hidden: true
        });

    }

    /**
     * Returns a pending promise with exposed resolve and reject methods
     */
    private getPendingPromise<T>(): {finishedOK: (result: T) => void, finishedError: (e: Error) => void, result: Promise<T>} {
        let finishedOK: (T) => any = (res: T) => {throw new Error(`Called before initiation. Result = ${res}`); };
        let finishedError: (e: Error) => void = (e: Error) => {throw new Error(`Called before initiation. Error = ${e.message}`); };

        const result = new Promise((resolve, reject) => [finishedOK, finishedError] = [resolve, reject]) as Promise<T>;

        return {result, finishedError, finishedOK};
    }


}


if (require.main === module) {
    const infraRunner = new AutomationInfrastructureRunner();
    infraRunner.runFromArgs()
        .then(runResult => {
            if (runResult.result === false) throw runResult.error || new Error('Run ended with result = false');
            console.log('Run ended');
        })
        .catch(e => {
            console.log(`Error running process: ${e.stack}`);
            process.exit(1);
        });
}

export {AutomationInfrastructureRunner, ICucumberRunOptions};



