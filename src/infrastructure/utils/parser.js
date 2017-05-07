/**
 * Parses strings and other data structures
 */
class Parser {
    /**
     * @param {AutomationInfrastructure} infra The automation infrastructure
     * @returns {Parser}
     */
    constructor(infra){
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
    }

    /**
     * Parses a comma separated field list into fieldName, fieldValue pairs
     * @param {string} [fieldsData=''] The fields string to parse
     * @param {boolean} [parseVariable=true] Parse and interpret ${} variables
     * @returns {{fieldName: string, fieldValue: string}[]} The parsed fields
     */
    parseFieldPairs(fieldsData='', parseVariable = true){
        let _self = this;

        return this.safeSplit(fieldsData, ',').map(fieldData => {
            let field = _self.safeSplit(fieldData, '=');
            let fieldName = field.splice(0,1)[0] || '';
            let fieldValue = field.join('=');
            
            let processedFieldValue = (parseVariable) ? _self._infra.utils.variableProcessor.parseVariables(fieldValue) : fieldValue;

            return {
                fieldName : fieldName.trim(),
                fieldValue : processedFieldValue.trim()
            };
        });
    }

    /**
     * Splits a string by a delimiter, while ignoring escaped delimiters, and transforming them into regular delimiters.
     * e.g. safeSplit('Some\\=thing=otherThing', '=') will return ['some=thing', 'otherThing']
     * @param {string} value The string to split
     * @param {string} delimiter The delimiter to parse by
     * @returns {string[]} The split result
     */
    safeSplit(value, delimiter){

        let protectedVariables = value.replace(/\$\{[^}]+}/g, function(outerVariable){
            return outerVariable.split(delimiter).join('\\' + delimiter); //cheap replace all
        });

        return protectedVariables.split('\\' + delimiter).map(shard => shard.split(delimiter)).reduce((acc,shards, index) => {
            if (index > 0) {
                let attachValue = shards.splice(0, 1)[0] || '';
                acc[acc.length - 1] += delimiter + attachValue;
            }

            return acc.concat(shards);
        },[]);
    }

}

module.exports = Parser;