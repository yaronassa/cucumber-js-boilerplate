import {Argv, Arguments} from "yargs";

const path = require('path');
const fs = require('fs');
const execSync = require('child_process').execSync;

const runFromArgs = (manualArgs?: string[], exitOnFail: boolean = false): string => {

    return require('yargs')
        .command('encryptFile', 'Encrypts a password file', (commandArgs: Argv) => {
            commandArgs
                .option('password', {
                    describe: 'The encryption password',
                    demandOption: true,
                    type: 'string'
                })
                .option('file', {
                    describe: 'The source password file to encrypt',
                    demandOption: true,
                    type: 'string',
                    coerce: val => path.resolve(val)
                })
                .option('output', {
                    describe: 'The target encrypted file',
                    type: 'string',
                    coerce: val => (val) ? path.resolve(val) : val
                })
                .check(parsedArgs => {
                    if (!fs.existsSync(parsedArgs.file)) throw new Error(`File ${parsedArgs.file} doesn't exist`);
                    return true;
                });
        }, args => {
            const output = args.output || `${args.file}.enc`;
            execSync(`openssl enc -aes-256-cbc -in "${args.file}" -out "${output}" -k ${args.password}`);
            console.log(`Password file has been encrypted. Output at ${output}`);
        })
        .command('decryptFile', 'Decrypt a password file', (commandArgs: Argv) => {
            commandArgs
                .option('password', {
                    describe: 'The decryption password',
                    demandOption: true,
                    type: 'string'
                })
                .option('file', {
                    describe: 'The source password file to decrypt',
                    demandOption: true,
                    type: 'string',
                    coerce: val => path.resolve(val)
                })
                .option('output', {
                    describe: 'The target decrypted file',
                    type: 'string',
                    coerce: val => (val) ? path.resolve(val) : val
                })
                .check(parsedArgs => {
                    if (!fs.existsSync(parsedArgs.file)) throw new Error(`File ${parsedArgs.file} doesn't exist`);
                    return true;
                });
        }, args => {
            let output = args.output || args.file.replace(/\.enc$/, '');
            if (output === args.file) output = output + '.dec';
            execSync(`openssl enc -d -aes-256-cbc -in ${args.file} -out ${output} -k ${args.password}`);
            console.log(`Password file has been decrypted. Output at ${output}`);
        })
        .demandCommand()
        .fail((msg: string, err: Error) => {
            if (err) throw err;
            if (exitOnFail) {
                console.error(msg);
                process.exit(1);
            } else {
                throw new Error(msg);
            }
        }).parse(manualArgs);
};

if (require.main === module) {
    runFromArgs(process.argv, true);
}

export {runFromArgs};
