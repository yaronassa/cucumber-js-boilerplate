
/**
 * Handles actually invoking and running cucumber
 * @description This is meant to be ran as a separate process, as it may invoke process.exit
 */

let Promise = require('bluebird');
let runArgs = require('../../temp/currentRunArgs.json');
let cli = new (require('cucumber').Cli)({argv: runArgs, cwd: process.cwd(), stdout: process.stdout});

return new Promise(function (resolve, reject) {
    try {
        return cli.run()
            .then(success => resolve((success === true) ? 0 : 1));
    } catch (e) {
        return reject(e);
    }
}).catch(e => {
    console.log('Catastrophic failure: ' + e.message);

    return Promise.resolve(1);
}).then(code => process.exit(code));
