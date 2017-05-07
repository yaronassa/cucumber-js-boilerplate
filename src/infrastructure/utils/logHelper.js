'use strict';

/**
 * Provides logging services for the infrastructure
 */
class LogHelper{
    /**
     * @param {AutomationInfrastructure} infra The automation infrastructure
     * @returns {LogHelper}
     */
    constructor(infra){
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;

        this._indentLevel = 0;

        this._pendingMessages = [];
    }

    /**
     * Adds a tabbed indent to all future log messages
     */
    addIndent(){
        this._indentLevel = this._indentLevel+1;
    }

    /**
     * Returns the current spaced indentation
     * @returns {string}
     */
    getIndentationSpace(){
        return ' '.repeat(this._indentLevel*2);
    }

    /**
     * Removes a tabbed indent from all future log messages
     */
    removeIndent(){
        this._indentLevel = this._indentLevel-1;
        if (this._indentLevel < 0) this._indentLevel = 0;
    }

    /**
     * Log the message
     * @param {string} message Message to log
     */
    log(message){
        this._logMessage(message);
    }

    /**
     * Log a warning message
     * @param {string} message Message to log
     */
    warn(message){
        message = 'WARN: ' + message;
        this._logMessage(message);
    }

    /**
     * Log an error message
     * @param {string} message Message to log
     */
    error(message){
        message = 'ERROR: ' + message;
        this._logMessage(message);
    }

    /**
     * Actually logs the message with the proper indent (or stores in in the pending queue)
     * @param {string} message The raw message to log
     * @private
     */
    _logMessage(message){
        let indent = this.getIndentationSpace();

        if (!message.split) message = JSON.stringify(message);
        message = message.split('\n').map(line => indent + line).join('\n');

        console.log(message);
    }

}

module.exports = LogHelper;