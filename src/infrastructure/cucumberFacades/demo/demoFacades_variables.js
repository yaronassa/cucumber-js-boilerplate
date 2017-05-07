let Promise = require('bluebird');

/**
 * Houses facades for the demo variable management and parsing
 */
class DemoFacadesVariables {
    /**
     * @param {AutomationInfrastructure} infra The infrastructure instance
     * @returns {DemoFacadesEntities}
     */
    constructor(infra) {
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
    }

    /**
     * Prints a value to the log
     * @param {string} value The simple value / variable to print
     * @returns {Promise}
     */
    printValue(value){
        let processedValue = this._infra.utils.variableProcessor.parseObjectVariables(value);
        if (processedValue === undefined) processedValue = this._infra.utils.variableProcessor.parseVariables(value);
        
        console.log(this._infra.utils.logHelper.getIndentationSpace() + processedValue);

        return Promise.resolve();
    }

    /**
     * Compare two values
     * @param {string} varA Source value
     * @param {string} varB Comparison target
     * @returns {Promise}
     */
    compareValues(varA, varB){
        let processedValue = this._infra.utils.variableProcessor.parseObjectVariables(varA);
        if (processedValue === undefined) processedValue = this._infra.utils.variableProcessor.parseVariables(varA);

        let testable = this._infra.utils.variableProcessor.getTestable(varB);
        
        if (!testable.test(processedValue)) return Promise.reject(new Error(`${processedValue} != ${testable.toString()}`));
        
        return Promise.resolve();
    }


}

module.exports = DemoFacadesVariables;