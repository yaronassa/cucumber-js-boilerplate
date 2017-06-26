let Promise = require('bluebird');

/**
 * Manages passwords and credentials
 */
class PasswordManager{
    /**
     * @param {AutomationInfrastructure} infra The automation infrastructure
     * @returns {PasswordManager}
     */
    constructor(infra){
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
    }

    /**
     * Returns the password storage
     * @returns {object}
     */
    get passwords(){
        return this._passwords;
    }

    /**
     * Performs before features password init operations
     * Called by {@link TestFlow._hooksHandlers.BeforeFeatures}
     * @returns {Promise}
     */
    beforeFeaturesActions(){
        return this._loadPasswordFile();
    }

    /**
     * Initializes the password manager from the decrypted password file
     * @returns {Promise}
     * @private
     */
    _loadPasswordFile(){
        let _self = this;
        let passwordFile = require('path').resolve(_self._infra.rootPath, _self._infra.config.utils.passwordManager.passwordFile);
        
        return Promise.try(function(){
            _self._passwords = require(passwordFile);
            _self._infra.log(`Loaded ${_self._passwords.lengh || Object.keys(_self._passwords).length} items from passwords file`);
        })
        .catch(e => _self._infra.log(`Did you remember to run "npm run decryptPasswords"?\nCannot read password from ${passwordFile}:\n${e.message}`, 'error'));
    }
}

module.exports = PasswordManager;