import {IAutomationConfig} from "../src/configurationManager/IAutomationConfig";

const masterConfig: IAutomationConfig = {

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
            warnOnCodeEval: true
        }
    },
    testEnvironment: {
        behaviour: {
            revertEntityChanges: true,
            timeouts: {
                sampleCreation: 1000 * 60 * 120,
                http: 90000
            }
        },
        metaWeather: {
            baseURL: 'https://www.metaweather.com/api'
        },
        jsonPlaceholder: {
            baseURL: 'https://jsonplaceholder.typicode.com'
        }
    },
    logic: {
        allowDefaultFieldMutator: true,
        testCaseOrder: {
            beginWithTag: '@setup',
            endWithTag: '@teardown'
        }
    }
};

export default masterConfig;
