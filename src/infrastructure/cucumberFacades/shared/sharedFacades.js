/**
 * Houses facades for shared cucumber steps
 */
class SharedFacades {
    /**
     * @param {AutomationInfrastructure} infra The infrastructure instance
     * @returns {SharedFacades}
     */
    constructor(infra) {
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
        /** @type {SharedGivenFacades} */
        this.given = new (require('./shared_given'))(infra);
        /** @type {SharedWhenFacades} */
        this.when = new (require('./shared_when'))(infra);
        /** @type {SharedThenFacades} */
        this.then = new (require('./shared_then'))(infra);
    }
}

module.exports = SharedFacades;