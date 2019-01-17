import {setWorldConstructor} from 'cucumber';
import {TestAutomationInfrastructure} from "../../../../../../testClasses/TestAutomationInfrastructure";
import {CucumberFacades} from "../../../../../../../../src/infrastructure/cucumberFacades/cucumberFacades";

const infra = TestAutomationInfrastructure.getInstance();

export interface ICucumberWorld { facades: CucumberFacades, attach: (value: any, type?: string) => void | Promise<void> }

setWorldConstructor(function TestWorld({attach}) {
    this.facades = infra.cucumberFacades;
    this.attach = attach;
});
