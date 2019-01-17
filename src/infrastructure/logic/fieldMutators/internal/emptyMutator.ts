import {AbstractFieldMutator, IMutationObject} from "../abstractFieldMutator";

class EmptyFieldMutator extends AbstractFieldMutator {
    protected sharedMutations: IMutationObject = {};
}

export default EmptyFieldMutator;
