import {AutomationInfrastructure} from "../infrastructure/automationInfrastructure";
import WriteStream = NodeJS.WriteStream;

import {getConfig} from "../configurationManager/configurationManager";
import {loadPasswordsFromPath, IPasswordItem} from "./passwordManager";
import {IAutomationConfig} from "../configurationManager/IAutomationConfig";


interface ICucumberRunOptions {
    workPath: string,
    cucumberLibPath: string,
    configFiles: string[],
    configParams: Array<{paramPath: string, paramValue: string}>,
    passwordFilesPath: string,
    tags: string
}

const fsExtra = require('fs-extra');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

/**
 * Executes infrastructure cucumber runs
 */
class CucumberRunner {
    private cucumberOutStream: WriteStream;
    private cucumberRunArgs: string[];
    private cucumberFeaturesPath: string;
    private resultsPath: string;
    private readonly options: ICucumberRunOptions;
    private readonly config: IAutomationConfig;
    private passwords: IPasswordItem[];
    private infra: AutomationInfrastructure;

    constructor(options: ICucumberRunOptions, existingInfra?: AutomationInfrastructure) {
        this.options = options;
        this.config = getConfig(this.options.configFiles, this.options.configParams);
        this.infra = existingInfra;
    }

    /**
     * Actually runs cucumber
     */
    public async run(): Promise<{result: boolean, error?: Error}> {
        this.passwords = loadPasswordsFromPath(this.options.passwordFilesPath, this.config.passwords.decryptionKeyEnvVariable, this.config.passwords.fallbackToPreDecrypted);

        if (this.infra === undefined) this.infra = new AutomationInfrastructure(this.options.workPath, this.config, this.passwords);

        await this.setupRunEnvironment();

        this.buildCucumberArgs();
        this.initOutStream();

        const started = Date.now();

        const runResult = await this.runCucumberCLI();

        const ended = Date.now();

        await this.produceRunReport(started, ended);

        return runResult;
    }

    private async produceRunReport(started: number, ended: number) {
        // TODO:IMPLEMENT_ME - You may want to implement your own reporter

        const report = require('multiple-cucumber-html-reporter');

        const startedMoment = new moment(started);
        const endedMoment = new moment(ended);

        const timeString = startedMoment.format('DD/MM/YY HH:MM:ss') + ' - '
                            + endedMoment.format('HH:MM:ss')
                            + ` (${endedMoment.diff(startedMoment, 'minutes')}m)`;

        try {
            report.generate({
                durationInMS: true,
                displayDuration: true,
                disableLog: true,
                pageTitle: 'Genoox Automation Run Report',
                reportName: 'Genoox Automation Run Report', // TODO: change this
                pageFooter: '<div>Page footer</div>', // TODO: change this
                jsonDir: `${this.resultsPath}`,
                reportPath: `${this.resultsPath}`,
                customData: {
                    title: 'Run Parameters',
                    data: [
                        {label: 'Time', value: timeString},
                        {label: 'Tags', value: this.options.tags},
                        {label: 'Run Performance', value: `<a href="performance/globalReport.html">Open Report</a>`}

                    ]
                },
                customMetadata: true
            });
        } catch (e) {
            // TODO: implement failure report
            console.error(`Error producing report: ${e.message}`);
            return;
        }


    }

    /**
     * Prepares the run environment
     */
    private async setupRunEnvironment() {
        this.options.workPath = path.resolve(this.options.workPath);
        this.cucumberFeaturesPath = path.resolve(this.options.workPath, 'features');
        this.resultsPath = path.resolve(this.options.workPath, 'results');

        fsExtra.emptyDirSync(this.options.workPath);
        fsExtra.emptyDirSync(this.cucumberFeaturesPath);
        fsExtra.copySync(path.resolve(this.options.cucumberLibPath, 'features'), this.cucumberFeaturesPath);

        fsExtra.emptyDirSync(this.resultsPath);

        fs.writeFileSync(path.resolve(this.options.workPath, 'mergedConfig.json'), JSON.stringify(this.config, null, 4));
        fs.writeFileSync(path.resolve(this.options.workPath, 'runOptions.json'), JSON.stringify(this.options, null, 4));

        // TODO:IMPLEMENT_ME - You want want to perform more pre-run actions, like downloading remote files, etc.

    }

    /**
     * Constructs the appropriate arguments to pass to the cucumber CLI constructor
     */
    private buildCucumberArgs() {

        const tagArgs = (this.options.tags.indexOf('not @skip') < 0) ? `(${this.options.tags}) and not @skip` : this.options.tags;

        console.log(`Running scenarios tagged ${tagArgs}`);

        // TODO: TBI
        this.cucumberRunArgs = ['',
            '--require', `${this.options.workPath}/features/**/*.feature`, '--require', `${this.options.cucumberLibPath}/**/*.ts`, `--tags=${tagArgs}`,
            '--format', 'summary', '--format-options', '{"colorsEnabled": false}',
            '--format', `json:${this.options.workPath}/results/results.json`];

        fs.writeFileSync(path.resolve(this.options.workPath, 'cucumberRunArgs.json'), JSON.stringify(this.cucumberRunArgs));
    }

    private initOutStream() {
        // TODO:IMPLEMENT_ME - You may want to control the output stream, clone or redirect it
        this.cucumberOutStream = process.stdout;
    }

    /**
     * Actually run the cucumber CLI
     * Taken from https://github.com/cucumber/cucumber-js/blob/master/src/cli/run.js
     */
    private async runCucumberCLI(): Promise<{result: boolean, error?: Error}> {

        const cli = new (require('cucumber')).Cli({
            argv: this.cucumberRunArgs,
            cwd: process.cwd(),
            stdout: this.cucumberOutStream
        });

        let result;
        try {
            result = await cli.run();
        } catch (e) {
            return {result: false, error: e};
        }

        return {result: result.success, error: (result.success) ? undefined : new Error('Run failed')};
    }

}

export {CucumberRunner, ICucumberRunOptions};
