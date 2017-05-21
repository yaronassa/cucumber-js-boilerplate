/**
 * @typedef {object} JSDOCData
 * @property {string} description
 * @property {number} line
 * @property {string} source
 * @property {{name: string, source: string, optional: boolean, tag: string, type: string}[]} tags
 */

/**
 * @typedef {object} CucumberStepDefinition A representation of a cucumber step definition
 * @property {string} regexString The step match regexp
 * @property {RegExp} regex
 * @property {string} functionName
 * @property {JSDOCData} stepComment
 * @property {JSDOCData} functionComment
 * @property {string} keyword
 * @property {string} definitionFile
 * @property {object} optionsObject
 */


let commentParser = require('comment-parser');

/**
 * Parses and processes cucumber step definitions
 */
class TestStepDefinitionParser {
    /**
     * @param {TestInfrastructure} testInfra
     * @returns {TestStepDefinitionParser}
     */
    constructor(testInfra){
        this._testInfra = testInfra;
    }

 
    /**
     * Parses a cucumberJS step definition file
     * @param {string} content The file's content
     * @returns {CucumberStepDefinition[]}
     */
    parse(content){
        let _self = this;
        let stepCatcher = /(?:(?:(\/\*(?:\r?\n\r?(?!\*\/)|.(?!\*\/))*?.?[\t\r\n ]*\*\/))|((?:[\t\r ]*\/\/.*\r?\n\r?)+))?[\t\r\n ]*(?:this.)?(Given|When|Then|And)\((\/.*?\/[igm]*) *(?:, (\{.+}*))?,[\t\r\n ]*(?:(?:(\/\*(?:\r?\n\r?(?!\*\/)|.(?!\*\/))*?.?[\t\r\n ]*\*\/))|((?:[\t\r ]*\/\/.*\r?\n\r?)+))?[\t\r\n ]*function *(.*?)?\(/ig;

        let steps = [];

        let stepMatch;
        do {
            stepMatch = stepCatcher.exec(content);
            if (stepMatch){
                let step = {};

                let rawStepComment = stepMatch[1] || stepMatch[2];
                step.keyword = stepMatch[3];
                step.regexString = stepMatch[4];
                step.regex = _self._testInfra.automationInfrastructure.utils.parser.buildRegexp(step.regexString);
                let optionsString = stepMatch[5] || '{}';
                let rawFunctionComment = stepMatch[6] || stepMatch[7];
                step.functionName = stepMatch[8] || '';

                step.stepComment = (rawStepComment) ? commentParser(rawStepComment)[0] : {tags : []};
                step.functionComment = (rawFunctionComment) ? commentParser(rawFunctionComment)[0] : {tags: []};
                
                try {
                    step.optionsObject = JSON.parse(optionsString);
                } catch (e) {
                    step.optionsObject = {};
                }
                
                steps.push(step);

            }
        } while (stepMatch);

        return steps;

    }

}

module.exports = TestStepDefinitionParser;