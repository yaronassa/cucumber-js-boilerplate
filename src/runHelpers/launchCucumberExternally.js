
/**
 * Handles actually invoking and running cucumber
 * @description This is meant to be ran as a separate process, as it may invoke process.exit
 */

let Promise = require('bluebird');
let runArgs = require('../../temp/currentRunArgs.json');
let cli = require('cucumber').Cli(runArgs);

return new Promise(function (resolve) {
    return cli.run(function(result){
        let exitCode = (result === true) ? 0 : 1;
        return resolve(exitCode);
    });
}).catch(e => {
    console.log('Catastrophic failure: ' + e.message);

    return Promise.resolve(1);
}).then(code => process.exit(code));
