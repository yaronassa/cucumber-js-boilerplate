import {it, describe} from 'mocha';
import * as Chai from 'chai';
const expect = require('chai').expect as Chai.ExpectStatic;

import {getConfig} from "../../../src/configurationManager/configurationManager";


describe('ConfigurationManager', () => {
    it('Defaults to master.ts', () => {
        const config = getConfig();
        const master = require('../../../config/master').default;

        expect(config).to.deep.equal(master);
    });

    it('Returns a fresh configuration copy on every call', () => {
        const config = getConfig();
        config.passwords = {decryptionKeyEnvVariable: 'someValue'};
        expect(getConfig().passwords.decryptionKeyEnvVariable).not.to.equal('someValue');
    });

    it('Supports overriding built in parameters via command line', () => {
        const config = getConfig(undefined, [{paramPath: 'passwords.decryptionKeyEnvVariable', paramValue: 'someValue'}]);
        expect(config.passwords.decryptionKeyEnvVariable).to.equal('someValue');
    });

    it('Supports overriding built in parameters via env variables', () => {
        afterEach(() => delete process.env.configParam_passwords_decryptionKeyEnvVariable);
        process.env.configParam_passwords_decryptionKeyEnvVariable = 'someValue';
        const config = getConfig();
        expect(config.passwords.decryptionKeyEnvVariable).to.equal('someValue');
    });

    it('Supports loading multiple config files', () => {
       const config = getConfig(['../test/testInfra/testData/config/configTest2.ts', '../test/testInfra/testData/config/configTest.ts']);
        expect(config.passwords.decryptionKeyEnvVariable).to.equal('someValue');
    });

    it('Throws for non-existent config files', () => {
        expect(() => getConfig(['DoesntExist']))
            .to.throw(/ERROR - Cannot load config file .+DoesntExist/);
    });

    it('Respects config files loading order', () => {
        const config = getConfig(['../test/testInfra/testData/config/configTest.ts', '../test/testInfra/testData/config/configTest2.ts']);
        expect(config.passwords.decryptionKeyEnvVariable).to.equal('someValue2');
    });

    it('Rejects configuration parameters that dont match the configuration spec, except for externalParams', () => {
        expect(() => getConfig(undefined, [{paramPath: 'passwords.doesntExist', paramValue: 'someValue'}]))
            .to.throw(`Current config doesn't have path passwords.doesntExist`);

        expect(() => getConfig(undefined, [{paramPath: 'externalParams.DoesntExist', paramValue: 'someValue'}]))
            .not.to.throw();
    })

});
