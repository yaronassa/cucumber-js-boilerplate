import {IAutomationConfig} from "../../../../../../src/configurationManager/IAutomationConfig";

const testMasterConfig: IAutomationConfig = {

    externalParams: {},
    passwords: {
        fallbackToPreDecrypted: true,
        decryptionKeyEnvVariable: 'AUTOMATION_INFRA_PASSWORDS_KEY'
    },
    utils: {
        email: {
            enabled: true,
            user: 'someTestUser@gmail.com',
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            authTimeout: 3000
        },
        performance: {
            generateForTags: ['@debug', '@performance', '@load']
        },
        debug: {
            warnOnCodeEval: false
        }
    },
    testEnvironment: {
        behaviour: {
            revertEntityChanges: true,
            timeouts: {
                sampleCreation: 1000 * 60 * 120,
                http: 90000
            }
        }
    },
    logic: {
        testCaseOrder: {
            endWithTag: '@teardown',
            beginWithTag: '@setup'
        }
    }
};

export default testMasterConfig;
