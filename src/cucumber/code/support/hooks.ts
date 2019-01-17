import {AutomationInfrastructure} from "../../../infrastructure/automationInfrastructure";
const {After, Before, AfterAll, BeforeAll, setDefinitionFunctionWrapper} = require('cucumber');

AutomationInfrastructure.getInstance().testFlowManager.bindCucumberHooks({After, Before, AfterAll, BeforeAll, setDefinitionFunctionWrapper});

// TODO:IMPLEMENT_ME - Actually, don't implement me.
// This is a reminder that all hook actions are defined in the infrastructure itself, NOT through cucumber support files
// Explore the testFlowManager and hooksManager classes instead
