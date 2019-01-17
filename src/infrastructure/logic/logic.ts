import {InfrastructureObject} from "../infrastructureObject";
import {EntitiesLogic} from "./entities";

class Logic extends InfrastructureObject {
    public readonly entities = new EntitiesLogic();

    // TODO:IMPLEMENT_ME - Add other logic classes and operations (logic = usually doesn't require any external information / actions from the test environment)

}

export {Logic};
