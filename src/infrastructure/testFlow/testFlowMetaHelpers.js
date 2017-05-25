/**
 * @typedef {object} PostProcessorResult
 * @property {Error} error
 * @property {*} stepResult
 */


/**
 * @typedef {function} PostProcessorWrapperFunction
 * @property {string} GUID
 * @param {PostProcessorResult} result
 * @returns {PostProcessorResult} The mutated result
 */

/**
 * @typedef {function} PreProcessorWrapperFunction
 * @property {string} GUID
 * @param {Array} stepArguments
 * @returns {Array} The mutated step arguments
 */



let Promise = require('bluebird');
let uuidV4 = require('uuid/v4');

/**
 * Helpers for manipulating the test flow and meta-functions
 */
class TestFlowMetaHelpers {

    /**
     * @param {AutomationInfrastructure} infra The automation infrastructure
     * @returns {TestFlowMetaHelpers}
     */
    constructor(infra){
        this._infra = infra;
        /** @type {PostProcessorWrapperFunction[]} */
        this._postProcessors = [];
        /** @type {PreProcessorWrapperFunction[]} */
        this._preProcessors = [];
        
        this._insertProcessorToPipeline('postProcessors', function failOnPipelineError(finalResult){
            if (finalResult.err) throw(finalResult.err);
            return finalResult.stepResult;
        }, false);
    }

    /**
     * Removes a wrapper from the post and pre pipelines
     * @param {string} wrapperGUID
     * @private
     */
    _removeWrapperFromPipelines(wrapperGUID){
        let postIndex = this._postProcessors.findIndex(func => func.GUID === wrapperGUID);
        if (postIndex) this._postProcessors.splice(postIndex, 1);
        let preIndex = this._preProcessors.findIndex(func => func.GUID === wrapperGUID);
        if (preIndex) this._preProcessors.splice(preIndex, 1);
    }

    /**
     * Inserts a pre/post processor to the pipeline
     * @param {('postProcessors'|'preProcessors')} pipeline
     * @param {PostProcessorWrapperFunction} processorFunction The actual wrapper function
     * @param {boolean} [skipForCurrentStep=true] Skip the pipeline for the currently running step that defined it
     * @param {string} [GUID] wrapper GUID (will be randomly generated if undefined)
     * @returns {string} The wrapper assigned GUID
     * @private
     */
    _insertProcessorToPipeline(pipeline, processorFunction, skipForCurrentStep=true, GUID=uuidV4()){
        processorFunction.GUID = GUID;
        let skip = skipForCurrentStep;
        
        let skippableProcessor = function(){
            if (!skip) return processorFunction(...arguments);
            
            skip = false;
            return arguments;
        };
        
        if (!/(postProcessors|preProcessors)/.test(pipeline)) throw new Error(`Unknown MeteHelper pipeline "_${pipeline}".`);
        
        this['_' + pipeline].unshift(skippableProcessor);
        return GUID;
    }

    /**
     * Wraps a cucumber step definition in the processing pipeline
     * @param {function:Promise} stepFunction The step definition execution function
     * @returns {function:Promise} The wrapper function
     */
    wrapCucumberStep(stepFunction){
        let preProcessors = this._preProcessors;
        let postProcessors = this._postProcessors;
        
        return function stepThroughPipeline(){
            let _self = this; //Cucumber world
            let initialArgs = arguments;
            
            return Promise.try(function runPreProcessors(){
                return Promise.reduce(preProcessors, (acc, processor) => processor.call(_self, acc), initialArgs);
            })
            .then(function actuallyRunStep(funcArgs){
                return new Promise(resolve => {
                    return stepFunction.apply(_self, funcArgs)
                        .then(result => resolve({result}))
                        .catch(err => resolve({err}));
                });
            })
            .then(function runPostProcessors(initialResult) {
                return Promise.reduce(postProcessors, (acc, processor) => processor.call(_self, acc), initialResult);
            });
            
        };
    }

    /**
     * Marks the n coming steps for failure - which means that if they fail, they succeed
     * @param {number} stepCount How many steps should be marked for failure
     * @param {boolean} [mustFail=true] Fail the next steps if the succeed (false = always pass)
     * @param {string} [expectedErrorMessage] Text that must appear in the error message
     */
    markNextStepsForFailure(stepCount, mustFail=true, expectedErrorMessage){
        let _self = this;
        
        let remainingSteps = stepCount;

        let expectedErrorMessageTest = (expectedErrorMessage === undefined) ? {test(){return true;}} : _self._infra.utils.variableProcessor.getTestable(expectedErrorMessage.trim(), {ignoreCase : true, partial : true});
        
        let processorGUID = this._insertProcessorToPipeline('postProcessors', function markStepsForFailureProcessor(currentPipelineResult){
            return Promise.try(function(){
                
                if (currentPipelineResult.err) _self._infra.log(`Step failed as expected (${stepCount - remainingSteps + 1}/${stepCount})`);
                
                if (!mustFail) return {result: currentPipelineResult.result};

                if (!currentPipelineResult.err) return {err: new Error('Original step passed (marked as expected to fail)')};

                if (!expectedErrorMessageTest.test(currentPipelineResult.err.message)) return {err: new Error(`Expected error message to be ${expectedErrorMessageTest.toString()}, but actual was ${currentPipelineResult.err.message}`)};

                return {result: currentPipelineResult.result};
            }).finally(() => {
                remainingSteps = remainingSteps - 1;
                if (remainingSteps === 0) _self._removeWrapperFromPipelines(processorGUID);
            });
        });
        
    }

}

module.exports = TestFlowMetaHelpers;