let Gherkin = require('gherkin');
let featureParser = new Gherkin.Parser();


/**
 * Parses and processes cucumber features
 */
class TestFeatureParser {
    /**
     * @param {TestInfrastructure} testInfra
     * @returns {TestFeatureParser}
     */
    constructor(testInfra){
        this._testInfra = testInfra;
    }

    /**
     * Parses a feature file into its components
     * @param {string} content The file content
     * @returns {{type:string, keyword: string, children: {type: string, keyword: string, name: string, steps: {keyword: string, text: string, type: string, stepDefinition: CucumberStepDefinition?}[]}[]}} The file feature
     */
    parse(content){
        let _self = this;
        let parsedFeature = featureParser.parse(content).feature;
        
        parsedFeature.children.forEach(child => {
            child.steps.forEach(step => {
                let stepDefinition = _self._testInfra.cucumberParser.infrastructureStepDefinitions.find(def => def.regex.test(step.text));
                step.stepDefinition = stepDefinition;
            });
        });
        
        return parsedFeature;
        
    }


}

module.exports = TestFeatureParser;