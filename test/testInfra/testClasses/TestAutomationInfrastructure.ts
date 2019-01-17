import {AutomationInfrastructure} from "../../../src/infrastructure/automationInfrastructure";

class TestAutomationInfrastructure extends AutomationInfrastructure {
    public static destroyInstance() {
        TestAutomationInfrastructure.instance = undefined;
        AutomationInfrastructure.instance = undefined;
    }
}

export {TestAutomationInfrastructure};
