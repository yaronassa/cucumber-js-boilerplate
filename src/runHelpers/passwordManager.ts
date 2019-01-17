interface IPasswordItem {
    system: string,
    domain: string,
    user: string,
    password: string
}

const fs = require('fs');
const crypt = require('crypto');
const path = require('path');
const fsExtra = require('fs-extra');

// TODO:IMPLEMENT_ME - Actually, don't implement me. Encrypt/Decrypt is kind of a drag. It does what it says on the box, not need to poke at it.
// The one thing you may want to do is to change the IPasswordItem structure to better fit your needs

const decrypt = (filePath: string, decryptionKey: string): string => {

    // Decrypt AES-256-CBC w/ salt: https://stackoverflow.com/a/19939873
    const md5 = data => {
        const hash = crypt.createHash('md5');
        hash.update(data);
        return new Buffer(hash.digest('hex'), 'hex');
    };

    const text = fs.readFileSync(filePath);
    const salt = text.slice(8, 16);
    const cryptoText = text.slice(16);
    const password = new Buffer(decryptionKey);

    const hash0 = new Buffer('');
    const hash1 = md5(Buffer.concat([hash0, password, salt]));
    const hash2 = md5(Buffer.concat([hash1, password, salt]));
    const hash3 = md5(Buffer.concat([hash2, password, salt]));
    const key = Buffer.concat([hash1, hash2]);

    const decoder = crypt.createDecipheriv('aes-256-cbc', key, hash3);

    const chunks = [];
    chunks.push(decoder.update(cryptoText, 'binary', 'utf8'));
    chunks.push(decoder.final('utf8'));
    return chunks.join('');
};

const loadPasswordsFromPath = (passwordsPath: string, decryptionKeyEnvVariable: string, fallbackToPreEncrypted: boolean = false): IPasswordItem[] => {
    const decryptedPasswordsPath = path.resolve(passwordsPath, 'decrypted');
    if (!fs.existsSync(decryptedPasswordsPath)) fsExtra.ensureDirSync(decryptedPasswordsPath);

    const decryptionKey = process.env[decryptionKeyEnvVariable] || '';

    if (decryptionKey === '') {
        if (fallbackToPreEncrypted === false) throw new Error('Got empty decryption key. Configure fallbackToPreDecrypted = true to use pre-decrypted files');
        console.log('Failed to get decryption key. Attempting to work with pre-decrypted files');
    }

    const passwordFiles = fs.readdirSync(passwordsPath)
                                .filter(file => file.endsWith('.json') || file.endsWith('.enc'));

    const result = passwordFiles.reduce((acc, passwordFile) => {
        let additionalPasswords: IPasswordItem[] = [];

        if (passwordFile.endsWith('.json')) {
            // Regular file, just consume it
            additionalPasswords = require(path.resolve(passwordsPath, passwordFile));
        } else {

            const preDecryptedPath = path.resolve(decryptedPasswordsPath, passwordFile.replace(/\.enc$/, ''));

            if (decryptionKey === '') {
                // Lets try to consume the pre-decrypted file
                if (!fs.existsSync(preDecryptedPath)) throw new Error(`Cannot find pre-decrypted file for: ${passwordFile}`);
                additionalPasswords = require(preDecryptedPath);
            } else {
                // Decrypt, save to cache and consume
                const decryptedData = decrypt(path.resolve(passwordsPath, passwordFile), decryptionKey);

                fs.writeFileSync(preDecryptedPath, decryptedData);
                additionalPasswords = JSON.parse(decryptedData);
            }
        }

        return acc.concat(additionalPasswords);
    }, []);

    console.log(`Read passwords from ${passwordFiles.length} files`);

    return result;

};

export {loadPasswordsFromPath, IPasswordItem};
