import {it, describe} from 'mocha';
import * as Chai from 'chai';
const expect = require('chai').expect as Chai.ExpectStatic;

import {TestUtils} from "../../testInfra/utils";
import {loadPasswordsFromPath} from "../../../src/runHelpers/passwordManager";

const testUtils = new TestUtils();

describe('PasswordManager', () => {
    process.env.testDecryptionKey = 'testPassword';
    after(() => delete process.env.testDecryptionKey);
    afterEach(() => testUtils.deleteTestDataPath('passwordManager/decrypted'));

    it('Loads encrypted files', () => {
        const passwords = loadPasswordsFromPath(testUtils.getTestDataFilePath('passwordManager'), 'testDecryptionKey');

        expect(passwords.find(item => item.system ==='system1'))
            .to.deep.equal({system: 'system1', domain: 'domain1', user: 'user1', password: 'password1'});
    });

    it('Loads plain files', () => {
        const passwords = loadPasswordsFromPath(testUtils.getTestDataFilePath('passwordManager'), 'testDecryptionKey');

        expect(passwords.find(item => item.system ==='localSystem'))
            .to.deep.equal({system: 'localSystem', domain: 'localDomain', user: 'localUser', password: 'localPassword'});
    });

    it('Can fall back to decrypted files', () => {
        loadPasswordsFromPath(testUtils.getTestDataFilePath('passwordManager'), 'testDecryptionKey');
        expect(() => loadPasswordsFromPath(testUtils.getTestDataFilePath('passwordManager'), 'noKey'))
            .to.throw('Got empty decryption key. Configure fallbackToPreDecrypted = true to use pre-decrypted files');

        const passwords = loadPasswordsFromPath(testUtils.getTestDataFilePath('passwordManager'), 'noKey', true);
        expect(passwords.find(item => item.system ==='system1'))
            .to.deep.equal({system: 'system1', domain: 'domain1', user: 'user1', password: 'password1'});
    });
});