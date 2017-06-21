let crypto = require('crypto');
let path = require('path');
let fs = require('fs');

let operations = {
    encrypt(toEncrypt, relativeOrAbsolutePathToPublicKey) {
        let absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey);
        let publicKey = fs.readFileSync(absolutePath, 'utf8');
        if (publicKey.toString().indexOf('-----BEGIN PUBLIC KEY-----') === -1) throw new Error(`Expected ${relativeOrAbsolutePathToPublicKey} to be a PEM public key (starts with -----BEGIN PUBLIC KEY-----)`);
        let buffer = new Buffer(toEncrypt);
        let encrypted = crypto.publicEncrypt(publicKey, buffer);
        return encrypted.toString('base64');
    },
    decrypt(toDecrypt, relativeOrAbsolutePathtoPrivateKey) {
        let absolutePath = path.resolve(relativeOrAbsolutePathtoPrivateKey);
        let privateKey = fs.readFileSync(absolutePath, 'utf8');
        if (privateKey.toString().indexOf('-----BEGIN RSA PRIVATE KEY-----') === -1) throw new Error(`Expected ${relativeOrAbsolutePathtoPrivateKey} to be a private key (starts with -----BEGIN RSA PRIVATE KEY-----)`);
        let buffer = new Buffer(toDecrypt, 'base64');
        let decrypted = crypto.privateDecrypt(privateKey, buffer);
        return decrypted.toString('utf8');
    }
};

let usageMessage = `Usage: $0 <sourceFile> <keyFile> [outputFile]

If <source> ends with .enc, it will be decrypted. Otherwise it will be encrypted.
The <key> should be a private-key for decryption, public key (pem) for encryption.
`;

let argv = require('optimist')
    .usage(usageMessage)
    .describe(0, 'The source file to operate on')
    .describe(1, 'The key file to encrypt / decrypt the source')
    .describe(2, 'Optional - output file')
    .demand([0, 1])
    .argv;

let source = argv._[0];
let key = argv._[1];

let operation = (source.endsWith('.enc')) ? 'decrypt' : 'encrypt';

let sourceContent = fs.readFileSync(source).toString();

let result = operations[operation](sourceContent, key);

let target = argv._[2] || `./output.${(operation === 'decrypt') ? 'txt' : 'enc'}`;

fs.writeFileSync(target, result);

console.log(`${operation}ed the file to ${target}`);


