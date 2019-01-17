import {InfrastructureObject} from "../infrastructureObject";
import {ParameterTypes} from "./parameterTypes";
import {DebugFacades} from "./debugFacades";
import {EntitiesFacades} from "./entities";
import {MiscFacades} from "./miscFacades";

/**
 * Main access point for facades exposed to cucumber steps
 */
class CucumberFacades extends InfrastructureObject {

    // TODO:IMPLEMENT_ME - Add as many facade categories as needed

    public parameters: ParameterTypes = new ParameterTypes();
    public debug: DebugFacades = new DebugFacades();
    public entities: EntitiesFacades = new EntitiesFacades();
    public misc: MiscFacades = new MiscFacades();
}

export {CucumberFacades};
