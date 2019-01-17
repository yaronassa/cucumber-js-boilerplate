import {InfrastructureObject} from "../infrastructureObject";
import {HooksManager} from "./hooksManager";
import {ScenarioData} from "../dataManager/scenarioData";
import {ITestable} from "../utils/variableProcessor";

interface ICucumberScenario {
    sourceLocation: {line: number, uri: string},
    result?: {duration: number, status: string},
    pickle: {tags: Array<{name: string}>, name: string, steps: ICucumberStep[]},
    scenarioData?: ScenarioData
}

interface ICucumberStep {
    text: string,
    arguments: string[],
    result?: any,
    error?: Error,
    expectedFailure?: {
        expectedErrorTest?: ITestable,
        mustFail: boolean
    },
    retryMinutes?: number
}

class TestFlowManager extends InfrastructureObject {

    public currentStatus: {currentScenario?: ICucumberScenario, currentStep?: ICucumberStep} = {};
    public previousScenarios: ICucumberScenario[] = [];
    public upcomingScenarios: ICucumberScenario[];
    public totalScenarioCount: number;

    public readonly hooksManager: HooksManager = new HooksManager();

    private currentScenarioStepIndex: number = -1;

    constructor() {
        super();
    }

    public getPhaseLogMessage(messageType: 'beforeScenario' | 'beforeStep'): string {
        // TODO:IMPLEMENT_ME - You may want other messages
        switch (messageType) {
            case 'beforeScenario':
                return `Executing scenario: ${this.currentStatus.currentScenario.pickle.name} (${this.previousScenarios.length + 1} / ${this.totalScenarioCount})`;
            case 'beforeStep':
                let message = `Step: ${this.currentStatus.currentStep.text}`;
                if (this.currentStatus.currentStep.retryMinutes !== undefined) message = message + ` (retrying for ${this.currentStatus.currentStep.retryMinutes} minutes)`;
                return message;
        }
    }

    public setRunScenarios(scenarios: ICucumberScenario[]) {
        this.upcomingScenarios = scenarios;
        this.totalScenarioCount = scenarios.length;
    }

    public async waitForNextStepToFinish(minutes: number) {
        const affectedStep = this.currentStatus.currentScenario.pickle.steps[this.currentScenarioStepIndex + 1];
        if (affectedStep === undefined) throw new Error(`Required to wait for next step to pass, but the scenario doesn't have any more steps`);

        affectedStep.retryMinutes = minutes;
        this.hooksManager.nullifyDefaultTimeout();
    }

    public async markStepsForFailure(stepCount: number, mustFail: boolean = true, expectedErrorMessage?: string) {
        const affectedSteps = this.currentStatus.currentScenario.pickle.steps.slice(this.currentScenarioStepIndex + 1, this.currentScenarioStepIndex + 1 + stepCount);
        if (affectedSteps.length < stepCount) throw new Error(`Required next ${stepCount} steps to fail, but the scenario only has ${affectedSteps.length} remaining steps`);
        let expectedErrorTest;
        if (expectedErrorMessage) expectedErrorTest = await this.infra.utils.variableProcessor.getTestable({fieldName: 'Error', fieldValue: expectedErrorMessage});

        affectedSteps.forEach(step => step.expectedFailure = {mustFail, expectedErrorTest});
    }

    public startScenario(scenario: ICucumberScenario) {
        this.upcomingScenarios.splice(0, 1);
        scenario.scenarioData = new ScenarioData();
        this.currentStatus.currentScenario = scenario;
        this.currentScenarioStepIndex = -1;
    }

    public endScenario() {
        this.previousScenarios.push(this.currentStatus.currentScenario);
    }

    public promoteStep() {
        this.currentScenarioStepIndex = this.currentScenarioStepIndex + 1;
        this.currentStatus.currentStep = this.currentStatus.currentScenario.pickle.steps[this.currentScenarioStepIndex];
    }

    public bindCucumberHooks(hooks) {
        this.hooksManager.bindCucumberHooks(hooks);
    }

}

export {TestFlowManager, ICucumberScenario, ICucumberStep};
