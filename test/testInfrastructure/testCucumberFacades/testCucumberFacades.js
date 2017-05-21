let fs = require('fs');
let path = require('path');

/**
 * Access point for test cucumber steps
 */
class TestCucumberFacades {
    /**
     * @param {TestInfrastructure} testInfra
     * @returns {TestCucumberFacades}
     */
    constructor(testInfra){
        this._testInfra = testInfra;
    }

    /**
     * A facade demonstrating the test demo given step
     * @returns {Promise}
     */
    testDemoGivenStep(){
        this._testInfra.automationInfrastructure.log('Some test step things');
        return Promise.resolve();
    }

    /**
     * Debug helper to scan infrastructure files
     * @param {string} fileMatcher File matcher pattern
     * @param {string} scanPath relative to infrastructure root
     * @param {string} stringMatcher What to look for
     * @param {boolean} expectedResult
     */
    evalInfrastructureFiles(fileMatcher, scanPath, stringMatcher, expectedResult){
        
        let fileMatcherTest = this._testInfra.automationInfrastructure.utils.parser.buildRegexp(fileMatcher);
        let stringMatcherTest = this._testInfra.automationInfrastructure.utils.parser.buildRegexp(stringMatcher);

        let fullPath = path.resolve(scanPath);

        let matchingFiles = this._testInfra.utils.walkSync(fullPath, []).filter(file => fileMatcherTest.test(file));

        console.log(`   Found ${matchingFiles.length} files matching ${fileMatcher}`);

        let containing = matchingFiles.filter(file => {
            let content = fs.readFileSync(file).toString();
            return stringMatcherTest.test(content);
        });

        console.log(`   Found ${containing.length} files containing ${stringMatcher}`);

        if ((containing.length > 0) !== expectedResult) {
            let errorMessage = `Expected all files ${(expectedResult) ? 'to contain' : 'not to contain'} the string ${stringMatcher}, but ${containing.length} did${(containing.length > 0) ? '\n' + containing.join('\n') : ''}`;
            throw new Error(errorMessage);
        }
    }
    
    /**
     * Validates a rule on cucumber files
     * @param {string} scanPath relative to infrastructure root
     * @param {string} rule The rule id
     * @returns {Promise}
     */
    validateRule(scanPath, rule){
        
        let validator = this._testInfra.rulesValidator.getValidator(rule);
        if (validator === undefined) return Promise.reject(new Error(`Unrecognized rule name: "${rule}"`));
        
        let featureFileMatcher = /.feature$/;
        let fullPath = path.resolve(scanPath);
        let matchingFiles = this._testInfra.utils.walkSync(fullPath, []).filter(file => featureFileMatcher.test(file));
        
        let validationErrors = matchingFiles
                                .map(file => ({errors: validator(fs.readFileSync(file).toString()), file}))
                                .filter(res => res.errors.length > 0);
        
        if (validationErrors.length > 0){
            let errorMessage = `The following files didn't adhere to the ${rule} rule: \n${validationErrors.map(res => `${res.file}: ${res.errors.join('\n')}`).join('\n\n')}`;
            return Promise.reject(new Error(errorMessage));
        }
        
        return Promise.resolve();
    }
}

module.exports = TestCucumberFacades;