/**
 * Main access point for infrastructure assertions and validations
 */
class Assert {
    /**
     * @param {AutomationInfrastructure} infra The automation infrastructure
     * @returns {Assert}
     */
    constructor(infra){
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
        /** @type {AssertEntities} */
        this.entities = new (require('./assertEntities'))(infra);
    }

    /**
     * Compares an object to an array of field specs
     * @param {object} actual The actual object to validate
     * @param {{fieldName: string, fieldValue: string}[]} expectedSpec The expected specifications
     * @param {function(string, string):object} [specialMutations] optional function to mutate the actual object for complex comparisons
     * @returns {{result: boolean, mismatches: {fieldName: string, expectedValue: string, actualValue: string}[]}}
     */
    compareObjectToExpectedSpec(actual, expectedSpec, specialMutations=function(fieldName, actualValue){return actualValue;}){
        let _self = this;
        let result = {result : true, mismatches: []};
        
        expectedSpec.forEach(field => {
            let fieldName = field.fieldName;
            let actualValue = specialMutations(fieldName, actual[fieldName]);
            let test = _self._infra.utils.variableProcessor.getTestable(field.fieldValue);
            
            //Add more advanced comparisons
            if (!test.test(actualValue)) {
                result.result = false;
                result.mismatches.push({fieldName, expectedValue: test.toString(), actualValue});
            }
        });
        
        return result;
    }

}

module.exports = Assert;