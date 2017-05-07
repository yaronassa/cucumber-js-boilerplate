/**
 * Access points for cucumber steps
 */
class CucumberFacades {
    /**
     * @param {AutomationInfrastructure} infra The infrastructure instance
     * @returns {CucumberFacades}
     */
    constructor(infra) {
        /**
         * @type {AutomationInfrastructure}
         * @private
         */
        this._infra = infra;
        /** @type {DemoFacades} */
        this.demo = new (require('./demo/demoFacades'))(infra);
        /** @type {DebugFacades} */
        this.debug = new (require('./debug/debug'))(infra);
        /** @type {SharedFacades} */
        this.shared = new (require('./shared/sharedFacades'))(infra);
    }
}

module.exports = CucumberFacades;