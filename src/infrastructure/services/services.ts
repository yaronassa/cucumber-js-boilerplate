import {InfrastructureObject} from "../infrastructureObject";
import {EntityServices} from "./entityServices/entityServices";

class Services extends InfrastructureObject {
    public readonly entity = new EntityServices();

    // TODO:IMPLEMENT_ME - Add other services (service = usually requires / changes an external state in the test environment)
}

export {Services};
