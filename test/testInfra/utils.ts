import {AutomationInfrastructure} from "../../src/infrastructure/automationInfrastructure";

const path = require('path');
const execSync = require('child_process').execSync;

const projectPath = path.resolve(__dirname, '../../');
const testDataPath = path.resolve(__dirname, 'testData');

const fsExtra = require('fs-extra');
const fs = require('fs');
const uuidv4 = require('uuid/v4');

import {CucumberRunner, ICucumberRunOptions} from "../../src/runHelpers/cucumberRunner";
import {CucumberResultParser} from "./cucumberResultParser";
import {getConfig} from "../../src/configurationManager/configurationManager";

class TestUtils {
    public get projectPath(): string {
        return projectPath;
    }

    public get dataPath(): string {
        return testDataPath;
    }

    public parseResults(cucumberResults): CucumberResultParser {
        const resultsObject = (typeof cucumberResults === 'string')
            ? require(path.resolve(cucumberResults, 'runnerWorkPath', 'results', 'results.json'))
            : cucumberResults;

        return new CucumberResultParser(resultsObject);
    }

    public prepareAutomationRunWorkPath(): string {
        const workPath = this.getTestWorkPath();

        fsExtra.copySync(this.getTestDataFilePath('automationInfra/standardWorkPath'), workPath, {recursive: true});
        // fsExtra.moveSync(path.resolve(workPath, 'config', 'master', 'master.ts'), path.resolve(workPath, 'config', 'master.ts'));

        return workPath;
    }

    // tslint:disable-next-line:max-line-length
    public async runAutomation(infra: AutomationInfrastructure, options: {workPath: string, tags?: string, configFiles?: string[], configParams?: Array<{paramPath: string, paramValue: string}>}) {
        const workPath = options.workPath;

        const runOptions: ICucumberRunOptions = {
            workPath: path.resolve(workPath, 'runnerWorkPath'),
            tags: options.tags || '@test',
            cucumberLibPath: path.resolve(workPath, 'cucumber'),
            configFiles: options.configFiles || [path.resolve(workPath, 'config', 'master.ts')],
            configParams: options.configParams || [],
            passwordFilesPath: path.resolve(workPath, 'passwords')
        };

        const runner = new CucumberRunner(runOptions, infra);

        const result = await runner.run();
        return {workPath, result};
    }

    public createTestFile(filePath: string, content: string) {
        const fullPath = this.getTestDataFilePath(filePath);
        fs.writeFileSync(fullPath, content, {flag: 'w+'});
    }

    public getTestWorkPath(): string {
        const guid = uuidv4();
        const workPath = this.getTestDataFilePath(`temp/${guid}`);
        fsExtra.emptyDirSync(workPath);
        return workPath;
    }

    public deleteTestDataPath(relativePath: string) {
        const fullPath = this.getTestDataFilePath(relativePath);
        fsExtra.removeSync(fullPath);
    }

    public getTestDataFilePath(relativePath: string): string {
        return path.resolve(testDataPath, relativePath);
    }

    public execTS(tsFileFromProjectRoot: string, args: string = '', stdio = ['ignore']) {
        const fileResolvedPath = path.resolve(projectPath, tsFileFromProjectRoot);
        const tsNodePath = path.resolve(projectPath, 'node_modules', '.bin', 'ts-node');
        const result = execSync(`${tsNodePath} ${fileResolvedPath} ${args}`, {stdio});
        return result.toString();
    }

    private createAutomationWorkPath() {

    }
}

export {TestUtils};

