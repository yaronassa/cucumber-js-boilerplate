import {defineParameterType} from 'cucumber';

const dataEntityParameterType = {
    name: 'DataEntity',
    preferForRegexpMatch: true,
    regexp: /(?:this|the latest|the last)? *.+? *(?:#\d+)?/,
    /** @this {World} */
    transformer(value: string) { return this.facades.parameters.dataEntity(value); },
    useForSnippets: false
};

const propertyFieldsParameterType = {
    name: 'PropertyFields',
    preferForRegexpMatch: true,
    regexp: /(?:.+=.*, ?)*(?:.+=.*)/,
    /** @this {World} */
    transformer(value: string) { return this.facades.parameters.matchFields(value); },
    useForSnippets: false
};

defineParameterType(dataEntityParameterType);
defineParameterType(propertyFieldsParameterType);


