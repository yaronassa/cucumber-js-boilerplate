/**
 * @typedef {object} TestFlowPhase
 * @property {Date} start
 * @property {string} status
 * @property {object} cucumberPayload
 * @property {Error[]} pendingErrors
 */

let Promise = require('bluebird');


/**
 * Manages cucumber test flow and hooks actions
 */
class TestFlow {
    /**
     * @param {AutomationInfrastructure} infra The infrastructure instance
     * @returns {TestFlow}
     */
    constructor(infra) {
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
        let _self = this;
        /** @type {TestFlowMetaHelpers} */
        this.metaHelpers = new (require('./testFlowMetaHelpers'))(infra);

        /**
         * Tracks the current status of the test flow
         * @type {{currentStep: TestFlowPhase, currentScenario: TestFlowPhase, currentFeature: TestFlowPhase}}
         * @private
         */
        this._currentState = {
            currentStep : {},
            currentScenario: {},
            currentFeature: {}
        };

        /**
         * Handlers for cucumber hooks
         * @private
         */
        this._hooksHandlers = {
            BeforeFeatures : function beforeFeaturesHook(){
                let hookActions = [];
                
                return _self._runHookActions(hookActions, 'BeforeFeatures', true);
            },
            BeforeFeature : function beforeFeatureHook(feature){
                _self._currentState.currentFeature = {
                    cucumberPayload : feature,
                    start : new Date(),
                    status : 'Passed',
                    pendingErrors : []
                };

                _self._infra.log(`Entering Feature: ${feature.getName()}`, 'log', 'open');
                
                let hookActions = [];
                
                return _self._runHookActions(hookActions, 'BeforeFeature');
            },
            BeforeScenario : function beforeScenarioHook(scenario){
                _self._currentState.currentScenario = {
                    cucumberPayload : scenario,
                    start : new Date(),
                    status : 'Passed'
                };

                _self._infra.log(`Entering Scenario: ${scenario.getName()}`, 'log', 'open');

                let hookActions = [
                    function data(){return _self._infra.data.beforeScenarioActions();},
                    function testEnvironment(){return _self._infra.testEnvironment.beforeScenarioActions();}
                ];

                return _self._runHookActions(hookActions, 'BeforeScenario', true);
            },
            BeforeStep : function beforeStepHook(step){
                if (step.getKeyword().match(/^after */i)) return Promise.resolve();

                _self._currentState.currentStep = {
                    cucumberPayload : step,
                    start : new Date(),
                    status : 'Passed'
                };

                _self._infra.log(`Entering Step: ${step.getName()}`, 'log', 'open');

                let hookActions = [];

                return _self._runHookActions(hookActions, 'BeforeStep');
            },
            StepResult : function stepResultHook(stepResult){
                if (stepResult.getStep().getKeyword().match(/^after *$/i)) return Promise.resolve();
                
                let duration = (stepResult.getDuration()/1000/1000/1000).toFixed(2);
                let status = stepResult.getStatus().charAt(0).toUpperCase() + stepResult.getStatus().slice(1);
                
                let error = stepResult.getFailureException();
                if (error) _self._infra.log(error.message, 'error');
                
                _self._infra.log(`Step status: ${status}, duration = ${duration}s`, 'log', 'close');

                _self._currentState.currentScenario.status = TestFlow.nextCucumberStatus(_self._currentState.currentScenario.status, stepResult.getStatus());

                let hookActions = [];

                return _self._runHookActions(hookActions, 'StepResult', true);
            },
            // eslint-disable-next-line no-unused-vars
            ScenarioResult : function scenarioResultHook(scenarioResult){
                let hookActions = [];

                return _self._runHookActions(hookActions, 'ScenarioResult', true);
            },
            // eslint-disable-next-line no-unused-vars
            AfterScenario : function afterScenarioHook(scenario){
                let duration = ((new Date() - _self._currentState.currentScenario.start)/1000).toFixed(2);

                _self._infra.log(`\nScenario status: ${_self._currentState.currentScenario.status}, duration = ${duration}s\n`, 'log', 'close');

                _self._currentState.currentFeature.status = TestFlow.nextCucumberStatus(_self._currentState.currentFeature.status, _self._currentState.currentScenario.status);

                let hookActions = [
                    function testEnvironment(){return _self._infra.testEnvironment.afterScenarioActions();}
                ];

                return _self._runHookActions(hookActions, 'AfterScenario', true);
            },
            // eslint-disable-next-line no-unused-vars
            After : function afterScenarioAttachments(scenarioWithAttachments){
                //Add scenario attachments here
                let hookActions = [];

                return _self._runHookActions(hookActions, 'AfterScenarioAttachments', true);
            },
            FeaturesResult : function featureResultHook(featuresResult){
                let pendingErrors = _self._currentState.currentFeature.pendingErrors || [];
                if (pendingErrors.length > 0) {
                    //noinspection JSUnusedAssignment
                    let errorMessage = _self.featuresErrors.reduce((acc, e) => acc += e.message + '\n', '***\nFeature hooks errors:\n ') + '***';

                    _self._infra.log(errorMessage, 'error');

                    featuresResult.witnessScenarioResult({
                        getDuration(){return 1;},
                        getStatus(){return 'failed';},
                        getStepCounts(){return 0;}
                    });
                    _self._currentState.currentFeature.pendingErrors = [];
                }

                let hookActions = [];

                return _self._runHookActions(hookActions, 'FeaturesResult', true);
            },
            // eslint-disable-next-line no-unused-vars
            AfterFeature : function afterFeatureHook(feature){
                let duration = ((new Date() - _self._currentState.currentFeature.start)/1000).toFixed(2);
                
                _self._infra.log(`Feature status: ${_self._currentState.currentFeature.status}, duration = ${duration}s\n`, 'log', 'close');

                let hookActions = [];

                return _self._runHookActions(hookActions, 'AfterFeature', true);
            },
            AfterFeatures : function afterFeaturesHook(){
                let hookActions = [];

                return _self._runHookActions(hookActions, 'AfterFeatures', true);
            }
        };
    }
    /**
     * Runs all registered hook actions
     * @param {function<Promise>[]} actions The hook actions
     * @param {string} hookName The hook name for the report
     * @param {boolean} [failOnError=false]
     * @param {boolean} [report=true] Should we wrap these actions in a report
     * @returns {Promise} Done
     * @private
     */
    _runHookActions(actions, hookName, failOnError=false, report = true){
        let _self = this;
        
        if (actions.length === 0) return Promise.resolve();
        
        if (report) _self._infra.log(`\nStarting ${hookName} actions:`, 'log', 'open');
        
        let currentIndex = -1;
        let actionsErrors = [];
        return Promise.each(actions, action => {
            currentIndex = currentIndex+1;
            return action.call()
                .catch(e => {
                    actionsErrors.push(`${hookName} hook encountered an error in ${actions[currentIndex].name}: ${e.message}`, 'error');
                    return Promise.resolve();
                });
        }).then(() => {
            if (actionsErrors.length > 0) throw new Error(actionsErrors.join('\n'));
            return Promise.resolve();
        }).catch(e => {
            if (failOnError) {
                throw new Error(`${hookName} hook encountered error(s) : ${e.message}`);
            } else {
                _self._currentState.currentFeature.pendingErrors.push(e);
                _self._infra.log('Attempting to resume test');
                return Promise.resolve();
            }
        }).tap(() => {if (report) _self._infra.log(`Finished ${hookName} actions.\n`, 'log', 'close');});
    }

    /**
     * Maps the cucumber hooks to the automation infrastructure
     * @param {{registerHandler: function(string, object, function)}} hooksManager cucumber's registerHandler function
     */
    mapCucumberHooks(hooksManager){
        let standardHookOptions = {timeout : 30 * 60 * 1000};
        let specificHookOptions = {After : {timeout: 30 * 60 * 1000}};
        
        let _self = this;
        
        Object.keys(this._hooksHandlers).forEach(hookName => {
            let options = specificHookOptions[hookName] || standardHookOptions;
            hooksManager.registerHandler(hookName, options, _self._hooksHandlers[hookName]);
        });
    }

    /**
     * Calculates the next cucumber status by severity
     * @param {string} currentStatus
     * @param {string} nextStatus
     * @returns {string}
     * @private
     */
    static nextCucumberStatus(currentStatus, nextStatus){
        let capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
        nextStatus = capitalize(nextStatus);

        if (currentStatus.match(/failed/i)) return 'Failed';
        if (currentStatus.match(/(warning|skipped)/i)) return (nextStatus.match(/warning/i)) ? nextStatus : currentStatus;
        return nextStatus;
    }
}

module.exports = TestFlow;
