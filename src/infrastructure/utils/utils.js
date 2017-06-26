/**
 * @typedef {object} InfraUtilsConfiguration
 * @property {{passwordFile: string}} passwordManager
 */


/**
 * Entry point for misc utils and helpers
 */
class Utils{
    /**
     * @param {AutomationInfrastructure} infra The automation infrastructure
     * @returns {Utils}
     */
    constructor(infra){
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;

        /** @type {LogHelper} */
        this.logHelper = new (require('./logHelper'))(infra);
        /** @type {Parser} */
        this.parser = new (require('./parser'))(infra);
        /** @type {VariableProcessor} */
        this.variableProcessor = new (require('./variableProcessor'))(infra);
        /** @type {PasswordManager} */
        this.passwordManager = new (require('./passwordManager'))(infra);

    }

    /**
     * Returns the value in the relevant object path
     * @param {object} obj Object to traverse
     * @param {string|string[]} path Property path, separated by . (or as an array)
     */
    getPropertyRecursive(obj, path){
        if (path === undefined) return undefined;
        if (obj === undefined) return undefined;
        if (Array.isArray(path)) {
            path = [].concat(path);
        } else {
            path = path.split(/[.\[]/);
        }

        if (path.length === 0 || path.length === 1 && path[0] === '') return obj;

        let currentPath = path.splice(0,1)[0].trim();
        if (/^.*]$/.test(currentPath)) currentPath = currentPath.substr(0,currentPath.length-1);

        let isFunc = false;
        if (/^.*\(\)$/.test(currentPath)) {
            currentPath = currentPath.substr(0, currentPath.length - 2);
            isFunc = true;
        }

        let result = obj[currentPath];
        if (isFunc) result = result.call(obj);

        return this.getPropertyRecursive(result, path);
    }
}

module.exports = Utils;