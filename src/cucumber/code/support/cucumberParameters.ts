import {defineParameterType} from 'cucumber';
import {ICucumberWorld} from "./world";

// TODO:IMPLEMENT_ME - Add your own parameters or change these

const dataEntityParameterType = {
    name: 'DataEntity',
    preferForRegexpMatch: true,
    regexp: /(?:this|the latest|the last)? *.+? *(?:#\d+)?/,
    /** @this {World} */
    transformer(this: ICucumberWorld, value: string) { return this.facades.parameters.dataEntity(value); },
    useForSnippets: false
};

const propertyFieldsParameterType = {
    name: 'PropertyFields',
    preferForRegexpMatch: true,
    regexp: /(?:.+=.*, ?)*(?:.+=.*)/,
    /** @this {World} */
    transformer(this: ICucumberWorld, value: string) { return this.facades.parameters.matchFields(value); },
    useForSnippets: false
};

defineParameterType(dataEntityParameterType);
defineParameterType(propertyFieldsParameterType);


