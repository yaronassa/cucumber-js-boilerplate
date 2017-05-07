/**
 * Actually runs the test suite
 */

/** @type {CucumberRun} */
let currentRun = new (require('./src/runHelpers/cucumberRun'))();

return currentRun.setupRunEnvironment()
    .then(() => currentRun.doRun())
    .then(runOutput => {
        currentRun.processOutput(runOutput);
        let code = (currentRun.result.succeeded) ? 0 : 1;

        if (currentRun.result.isCatastrophic) console.error('CATASTROPHIC FAILURE');

        /**
         * Exits the process after all output pipes have been drained
         * @return {Promise<number>} The exit code
         */
        function exitNow() {
            return currentRun.produceReports()
                .then(() => process.exit(code));
        }

        if (process.stdout.write('')) {
            return exitNow();
        } else {
            // write() returned false, kernel buffer is not empty yet...
            process.stdout.on('drain', exitNow);
            return;
        }
    });



