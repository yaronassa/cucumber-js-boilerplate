import {setWorldConstructor} from 'cucumber';
import {AutomationInfrastructure} from "../../../infrastructure/automationInfrastructure";
import {CucumberFacades} from "../../../infrastructure/cucumberFacades/cucumberFacades";

const infra = AutomationInfrastructure.getInstance();

export interface ICucumberWorld { facades: CucumberFacades, attach: (value: any, type?: string) => void | Promise<void> }


setWorldConstructor(function World({attach}) {
    this.facades = infra.cucumberFacades;
    this.attach = attach;
});

// TODO:IMPLEMENT_ME - Actually, don't implement me.
// Cucumber's world should be lean. All utils and functionality should be added on the infrastructure itself.
