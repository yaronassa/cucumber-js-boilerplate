import {AutomationInfrastructure} from "./automationInfrastructure";

/**
 * Base class for Infrastructure objects
 */
abstract class InfrastructureObject {
    /**
     * returns the infrastructure root object
     */
    protected get infra(): AutomationInfrastructure {
        return AutomationInfrastructure.getInstance();
    }

    protected log(message: string, indentLevel: number = 2) {
        this.infra.utils.logger.writeToLog('info', message, indentLevel);
    }

    protected error(message: string, indentLevel: number = 2) {
        this.infra.utils.logger.writeToLog('error', message, indentLevel);
    }
}

export {InfrastructureObject};
