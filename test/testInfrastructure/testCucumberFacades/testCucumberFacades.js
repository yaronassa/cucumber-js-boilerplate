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

        /**
         * Transforms a plain-test string into a matching regexp
         * @param {string} source The plain text string
         * @returns {RegExp} The resulting regular expression
         */
        let buildRegexp = function(source){
            if (source.match(/^\/.+?\/[igm]*$/)){ //regexp
                let regexpParts = source.match(/^\/(.+?)\/([igm]*)$/);
                return new RegExp(regexpParts[1], regexpParts[2] || '');
            } else {
                return new RegExp(source.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1'));
            }
        };
        
        let fileMatcherTest = buildRegexp(fileMatcher);
        let stringMatcherTest = buildRegexp(stringMatcher);

        let fullPath = path.resolve(scanPath);

        let walkSync = (dir, fileList) => {
            fs.readdirSync(dir).forEach(file => {

                fileList = fs.statSync(path.join(dir, file)).isDirectory()
                    ? walkSync(path.join(dir, file), fileList)
                    : fileList.concat(path.join(dir, file));

            });
            return fileList;
        };

        let matchingFiles = walkSync(fullPath, []).filter(file => fileMatcherTest.test(file));

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
}

module.exports = TestCucumberFacades;