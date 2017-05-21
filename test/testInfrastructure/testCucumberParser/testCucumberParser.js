
/**
 * @typedef {object} TestCucumberParserConfiguration
 * @property {string} cacheStepDefinitions
 */

let Promise = require('bluebird');

/**
 * Parses and processes cucumber files
 */
class TestCucumberParser {
    /**
     * @param {TestInfrastructure} testInfra
     * @returns {TestCucumberParser}
     */
    constructor(testInfra){
        this._testInfra = testInfra;
        
        /** @type {TestFeatureParser} */
        this.featureParser = new (require('./testFeatureParser'))(testInfra);
        /** @type {TestStepDefinitionParser} */
        this.stepDefinitionParser = new (require('./testStepDefinitionParser'))(testInfra);
        /** @type {CucumberStepDefinition[]} */
        this.infrastructureStepDefinitions = [];
    }

    /**
     * Get the relevant config subtree
     * @returns {TestCucumberParserConfiguration}
     */
    get config(){
        return this._testInfra.automationInfrastructure.config.test.cucumberParser;
    }


    /**
     * Actions to perform on BeforeFeatures hook
     */
    beforeFeaturesActions(){
        let stepDefFileMatcher = /\.js$/;
        let fullPath = require('path').resolve('src/features/step_definitions');
        let matchingFiles = this._testInfra.utils.walkSync(fullPath, []).filter(file => stepDefFileMatcher.test(file));
        
        let parsedFiles = matchingFiles.map(file => this.stepDefinitionParser.parse(require('fs').readFileSync(file).toString()));
        
        this.infrastructureStepDefinitions = parsedFiles.reduce((acc, parsedFile) => acc.concat(parsedFile), []);
        
        return Promise.resolve();
    }
}

module.exports = TestCucumberParser;