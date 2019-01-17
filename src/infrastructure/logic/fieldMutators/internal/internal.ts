import {AbstractFieldMutator, IMutationObject} from "../abstractFieldMutator";

class InternalFieldMutator extends AbstractFieldMutator {
    protected sharedMutations: IMutationObject = {};
}

export default InternalFieldMutator;
