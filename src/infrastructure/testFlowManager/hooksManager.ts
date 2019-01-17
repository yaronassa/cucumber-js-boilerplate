import {InfrastructureObject} from "../infrastructureObject";
import {ICucumberScenario} from "./testFlowManager";

const bluebird = require('bluebird');

const cucumber = require('cucumber');

const originalRuntimeStart = cucumber.Runtime.prototype.start;


class HooksManager extends InfrastructureObject {

    private originalDefaultTimeout: number;
    private supportCodeLibrary: {defaultTimeout: number};

    public nullifyDefaultTimeout() {
        this.supportCodeLibrary.defaultTimeout = -1;
    }

    public async beforeRun() {
        await this.infra.utils.logger.beforeRun();

        const parallelActions: Array<() => Promise<any>> = [
            // TODO:IMPLEMENT_ME - Add initialization actions and calls here
        ];

        try {
            await bluebird.map(parallelActions, action => action());
        } catch (e) {
            console.error(`BeforeRun hook failed: ${e.stack}`);
            throw e;
        }
    }

    public async afterRun() {

        this.log(`\nPerforming AfterRun actions`, 0);

        const hookActions: Array<() => Promise<any>> = [
            // TODO:IMPLEMENT_ME - Add teardown actions and calls here, or mutate the results JSON according to your needs
        ];

        await bluebird.map(hookActions, action => action());
        
        console.log('\n');
    }

    public async runtimeStarted(runtime: {testCases: ICucumberScenario[], supportCodeLibrary: {defaultTimeout: number}}) {
        console.log(`\nCucumber loaded ${runtime.testCases.length} scenarios`);

        if (runtime.testCases.length === 0) throw new Error('Cucumber loaded 0 scenarios');

        runtime.testCases = this.reorderTestCases(runtime.testCases);

        this.infra.testFlowManager.setRunScenarios(runtime.testCases);
        this.supportCodeLibrary = runtime.supportCodeLibrary;

        await this.beforeRun();

        try {
            const result = await originalRuntimeStart.call(runtime);
            return result;
        } catch (e) {
            return false;
        } finally {
            try {
                await this.afterRun();
            } catch (e) {
                console.error(`Infrastructure after run failed: ${e.message}`);
            }
        }

    }

    /**
     * Binds cucumber hooks to the infrastructure
     */
    public bindCucumberHooks({After, Before, AfterAll, BeforeAll, setDefinitionFunctionWrapper}) {
        const _self = this;
        const beforeHandler = function(scenario: ICucumberScenario) { return _self.beforeScenario(scenario, this); };
        const afterHandler = function(scenario: ICucumberScenario) { return _self.afterScenario(scenario, this); };
        const beforeAllHandler = () => this.beforeAllScenarios();
        const afterAllHandler = () => this.afterAllScenarios();

        Before(beforeHandler);
        After(afterHandler);
        BeforeAll(beforeAllHandler);
        AfterAll(afterAllHandler);
        setDefinitionFunctionWrapper(stepFunction => {
            if ([beforeHandler, afterHandler, beforeAllHandler, afterAllHandler].every(handler => handler !== stepFunction)) {
                return this.beforeStepFunction(stepFunction);
            } else {
                return stepFunction;
            }
        });

        cucumber.Runtime.prototype.start = function() {
            cucumber.Runtime.prototype.start = originalRuntimeStart;
            return _self.runtimeStarted.call(_self, this);
        };
    }

    public async beforeStep() {
        try {
            this.infra.testFlowManager.promoteStep();

            this.log(this.infra.testFlowManager.getPhaseLogMessage('beforeStep'), 1);

            // TODO:IMPLEMENT_ME - Add pre-step actions

        } catch (e) {
            throw new Error(`beforeStep hook failed: ${e.stack}`);
        }
    }

    public async afterStep(finalError?: Error): Promise<Error> {
        try {
            // TODO:IMPLEMENT_ME - Add post-step actions

            if (finalError) this.error(`Step failed: ${finalError.message}`, 3);

            return finalError; // Or not?
        } catch (e) {
            throw new Error(`afterStep hook failed: ${e.stack}`);
        }
    }

    public async beforeAllScenarios() {
        try {

            await this.runHookActions('beforeAllScenarios', [
                // TODO:IMPLEMENT_ME - Add pre-scenarios actions
            ]);

        } catch (e) {
            // TODO:IMPLEMENT_ME - Currently failing the beforeAllScenarios doesn't fail the run. Throw an error to change this behaviour
            this.error(`beforeAllScenarios hook failed: ${e.stack}`);
        }

    }

    public async afterAllScenarios() {
        try {

            this.log('\n\nFinished All Scenarios', 0);
            await this.runHookActions('afterAllScenarios', [
                // TODO:IMPLEMENT_ME - Add post-scenarios actions
            ]);

        } catch (e) {
            this.error(`afterAllScenarios hook failed: ${e.stack}`);
        }

        this.log('\n');
    }

    public async beforeScenario(scenario: ICucumberScenario, world) {
        try {
            this.infra.testFlowManager.startScenario(scenario);

            this.log('\n' + this.infra.testFlowManager.getPhaseLogMessage('beforeScenario'), 0);

            await this.runHookActions('beforeScenario', [
                // TODO:IMPLEMENT_ME - Add pre-scenario actions
            ]);

        } catch (e) {
            throw new Error(`beforeScenario hook failed: ${e.stack}`);
        }
    }

    public async afterScenario(scenario: ICucumberScenario, world) {
        try {
            if (scenario.result.status.toLowerCase() !== 'passed') {
                this.error(`Scenario status = ${scenario.result.status.toUpperCase()}`);
            }

            await this.runHookActions('afterScenario', [
                () => this.infra.testEnvironment.afterScenario()
                // TODO:IMPLEMENT_ME - Add post-scenario actions
            ]);

        } catch (e) {
            throw new Error(`afterScenario hook failed: ${e.stack}`);
        } finally {
            this.infra.testFlowManager.endScenario();
        }

    }

    protected reorderTestCases(testCases: ICucumberScenario[]): ICucumberScenario[] {

        // TODO:IMPLEMENT_ME - You might want to implement your own test-case reorder behaviour (or cancel this one)

        const beginWith = [];
        const endWith = [];
        const others = [];

        const {beginWithTag, endWithTag} = (this.infra.config.logic || {testCaseOrder: {}}).testCaseOrder;

        testCases.forEach(testCase => {
            if (testCase.pickle.tags.some(tag => tag.name === beginWithTag)) {
                beginWith.push(testCase);
                return;
            }

            if (testCase.pickle.tags.some(tag => tag.name === endWithTag)) {
                endWith.push(testCase);
                return;
            }

            others.push(testCase);
        });

        const newOrder = [].concat(beginWith).concat(others).concat(endWith);

        return newOrder;
    }


    private async runHookActions(hookName: string, actions: Array<() => Promise<void>>) {

        if (actions.length > 0) this.log(`Running ${actions.length} ${hookName} hook actions`, 1);

        const errors: Error[] = await bluebird.reduce(actions, async (acc, action) => {
            try {
                await action();
            } catch (e) {
                acc.push(e);
            }

            return acc;
        }, []);

        if (errors.length > 0) {
            const errorMessage = `Error - ${hookName} hook had these errors:\n${errors.map(e => e.message).join('\n')}`;
            this.log(errorMessage + '\nAttempting to resume');

            throw new Error(errorMessage);
        }

    }

    // tslint:disable-next-line:ban-types
    private beforeStepFunction(stepFunction: Function): Function {
        // TODO:IMPLEMENT_ME - You can add very complex behaviors through this function.
        // It completely controls the way actual cucumber steps are called and processed
        // You can mutate a step arguments or alter it results

        // Currently, this function support marking steps are expected-to-fail, and retrying steps until they pass

        const _self = this;

        return async function() {
            await _self.beforeStep();

            const currentStep = _self.infra.testFlowManager.currentStatus.currentStep;
            const isRetryStep = (currentStep.retryMinutes !== undefined);
            const retryUntil = Date.now() + (currentStep.retryMinutes || 0) * 60 * 1000;
            const started = Date.now();

            if (isRetryStep) _self.log(`Started waiting at ${new Date()}`);

            do {
                try {
                    currentStep.result = await stepFunction.apply(this, arguments);
                } catch (e) {
                    currentStep.error = e;
                    if (isRetryStep) await bluebird.delay(30 * 1000);
                }
            } while (Date.now() < retryUntil && currentStep.error !== undefined);

            if (isRetryStep) {
                _self.supportCodeLibrary.defaultTimeout = _self.originalDefaultTimeout;
                _self.log(`Waited for ${((Date.now() - started) / 1000 / 60).toFixed(0)} minutes`);
            }

            let finalError;

            if (currentStep.expectedFailure) {
                const {mustFail, expectedErrorTest} = currentStep.expectedFailure;
                if (mustFail && currentStep.error === undefined) {
                    finalError = Error(`Expected step to fail, but it passed`);
                } else {
                    if (expectedErrorTest && currentStep.error) {
                        if (!expectedErrorTest.test(currentStep.error.message)) {
                            finalError = Error(`Expected step to fail with ${expectedErrorTest.toString}, but actual was: ${currentStep.error.message}`);
                        }
                    }
                }

                if (finalError === undefined) _self.log(`  The step failed as expected`);
            } else {
                finalError = currentStep.error;
            }

            finalError = await _self.afterStep(finalError);

            if (finalError) throw finalError;

        };
    }
}

export {HooksManager};


