import {IAutomationConfig} from "../src/configurationManager/IAutomationConfig";

// TODO:IMPLEMENT_ME - create environment-specific config files and use them accordingly

/**
 * This is a demonstration of a local override file
 */
const localConfig: IAutomationConfig = {
    utils: {
        debug: {warnOnCodeEval: false}
    },
    testEnvironment: {
        behaviour: {
            timeouts : {
                http: 180000
            },
            revertEntityChanges: {
                user: false
            }
        }
    }


};

export default localConfig;
