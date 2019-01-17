import {CucumberFacades} from "./cucumberFacades/cucumberFacades";
import {TestFlowManager} from "./testFlowManager/testFlowManager";
import {Utils} from "./utils/utils";
import {DataManager} from "./dataManager/dataManager";
import {TestEnvironment} from "./testEnvironment/testEnvironment";
import {Logic} from "./logic/logic";
import {Services} from "./services/services";

import {IAutomationConfig} from "../configurationManager/IAutomationConfig";
import {IPasswordItem} from "../runHelpers/passwordManager";
import {Assert} from "./assert/assert";


/**
 * The automation infrastructure tree root
 */
class AutomationInfrastructure {

    public static getInstance(): AutomationInfrastructure {
        if (AutomationInfrastructure.instance === undefined) console.error('No infrastructure instance. Have you initiated it before calling cucumber?');
        return AutomationInfrastructure.instance;
    }

    protected static instance: AutomationInfrastructure;

    public readonly workPath: string;
    public readonly config: IAutomationConfig;

    public readonly cucumberFacades = new CucumberFacades();
    public readonly testFlowManager = new TestFlowManager();
    public readonly logic = new Logic();
    public readonly utils = new Utils();
    public readonly data: DataManager;
    public readonly testEnvironment = new TestEnvironment();
    public readonly services = new Services();
    public readonly assert = new Assert();

    public constructor(workPath: string, config: IAutomationConfig, passwords: IPasswordItem[] = []) {
        if (AutomationInfrastructure.instance !== undefined) {
            const errorMessage = 'Attempted to create Automation infrastructure more than once';
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        this.data = new DataManager(passwords);

        this.workPath = workPath || process.cwd();
        this.config = config;

        this.config.externalParams = this.config.externalParams || {};

        AutomationInfrastructure.instance = this;
    }
}

export {AutomationInfrastructure};
