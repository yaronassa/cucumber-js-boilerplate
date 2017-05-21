let fs = require('fs');
let path = require('path');

/**
 * Test infrastructure utils
 */
class TestUtils {
    /**
     * @param {TestInfrastructure} testInfra
     * @returns {TestUtils}
     */
    constructor(testInfra){
        this._testInfra = testInfra;
    }

    /**
     * Returns a file list of an entire file tree
     * @param {string} dir source dir for scraping
     * @param {string[]} fileList The harvested file list
     * @returns {string[]} fileList The harvested file list
     */
    walkSync(dir, fileList){
        let _self = this;
        
        fs.readdirSync(dir).forEach(function(file){

            fileList = fs.statSync(path.join(dir, file)).isDirectory()
                ? _self.walkSync(path.join(dir, file), fileList)
                : fileList.concat(path.join(dir, file));

        });
        
        return fileList;
    }
}

module.exports = TestUtils;