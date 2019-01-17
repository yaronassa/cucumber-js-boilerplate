// TODO:IMPLEMENT_ME - Add configuration options for you AUTs, test environments and custom behaviours

export interface IAutomationConfig {
    externalParams?: {[name: string]: string},
    passwords?: {
        fallbackToPreDecrypted?: boolean,
        decryptionKeyEnvVariable?: string
    },
    utils?: {
        email?: {
            enabled?: boolean,
            user?: string,
            host?: string
            port?: number,
            tls?: boolean,
            authTimeout?: number
        },
        performance?: {
            generateForTags?: string[]
        },
        debug?: {
            warnOnCodeEval?: boolean
        }
    },
    testEnvironment?: {
        behaviour?: {
            revertEntityChanges?: boolean | { [key: string]: boolean },
            timeouts?: {
                sampleCreation?: number,
                http?: number
            }
        },
        metaWeather?: {
            baseURL?: string
        },
        jsonPlaceholder?: {
            baseURL?: string
        }
    },
    logic?: {
        allowDefaultFieldMutator?: boolean,
        testCaseOrder?: {
            beginWithTag?: string,
            endWithTag?: string
        }
    }
}


