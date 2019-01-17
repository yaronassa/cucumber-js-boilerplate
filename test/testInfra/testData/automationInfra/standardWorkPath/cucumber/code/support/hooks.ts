import {TestAutomationInfrastructure} from "../../../../../../testClasses/TestAutomationInfrastructure";

const {After, Before, AfterAll, BeforeAll, setDefinitionFunctionWrapper} = require('cucumber');

TestAutomationInfrastructure.getInstance().testFlowManager.bindCucumberHooks({After, Before, AfterAll, BeforeAll, setDefinitionFunctionWrapper});
