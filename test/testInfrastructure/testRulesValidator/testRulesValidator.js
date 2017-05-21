/**
 * Engine for validating step and scenario rules
 */
class TestRulesValidator {
    /**
     * @param {TestInfrastructure} testInfra
     * @returns {TestRulesValidator}
     */
    constructor(testInfra){
        this._testInfra = testInfra;
        
        /** @private */
        this._rules = {
            // eslint-disable-next-line object-shorthand
            'step-prerequisite' : function(content){
                let parsedFeature = testInfra.cucumberParser.featureParser.parse(content);
                
                let relevantScenarios = parsedFeature.children.filter(scenario => scenario.steps.some(step => step.stepDefinition.stepComment.tags.some(tag => tag.type === 'step-prerequisite')));
                
                let errors = [];
                
                relevantScenarios.forEach(scenario => {
                    scenario.steps.forEach(step => {
                        let id = step.stepDefinition.stepComment.tags.find(tag => tag.tag === 'cucumber-id');
                        if (id) step.id = id.name;
                    });
                    scenario.steps.forEach((step, index) => {
                        let stepPrerequisites = step.stepDefinition.stepComment.tags.filter(tag => tag.type === 'step-prerequisite').map(tag => tag.name);
                        stepPrerequisites = stepPrerequisites.filter(preReq => !scenario.steps.slice(0, index).some(preStep => preStep.id === preReq));

                        if (stepPrerequisites.length > 0) errors.push(`Step "${step.text}" expected these unfulfilled pre-requisites: ${stepPrerequisites.join(', ')}`);
                    });
                });
                
                return errors;
            },
            // eslint-disable-next-line object-shorthand
            'step-postrequisite' : function(content){
                let parsedFeature = testInfra.cucumberParser.featureParser.parse(content);

                let relevantScenarios = parsedFeature.children.filter(scenario => scenario.steps.some(step => step.stepDefinition.stepComment.tags.some(tag => tag.type === 'step-postrequisite')));

                let errors = [];

                relevantScenarios.forEach(scenario => {
                    scenario.steps.forEach(step => {
                        let id = step.stepDefinition.stepComment.tags.find(tag => tag.tag === 'cucumber-id');
                        if (id) step.id = id.name;
                    });
                    scenario.steps.forEach((step, index) => {
                        let stepPostrequisites = step.stepDefinition.stepComment.tags.filter(tag => tag.type === 'step-postrequisite').map(tag => tag.name);
                        stepPostrequisites = stepPostrequisites.filter(postReq => !scenario.steps.slice(index).some(postStep => postStep.id === postReq));

                        if (stepPostrequisites.length > 0) errors.push(`Step "${step.text}" expected these unfulfilled post-requisites: ${stepPostrequisites.join(', ')}`);
                    });
                });

                return errors;
            }

        };
    }

    /**
     * Returns a validator for the given rule
     * @param {string} ruleName The rule to validate
     * @returns {function(string):string[]} A validation function
     */
    getValidator(ruleName){
        if (!ruleName) return undefined;
        
        let canonizedRuleName = ruleName.toLowerCase().trim().replace(/ +/g, '-');
        
        return this._rules[canonizedRuleName];
    }
}

module.exports = TestRulesValidator;