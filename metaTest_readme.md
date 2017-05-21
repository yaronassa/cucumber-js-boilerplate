# Cucumber Boilerplate Meta-Test Readme

## General

This readme presents an overview of the project's meta-test suite, as well as in depth examples and details of the possible implementations and code structures.

Make sure you read the [general reame](README.md) and go through the installation process before proceeding.

## Meta-Test overview

The meta-test infrastructure resides in `test/`, and basically mirrors the structure of The cucumber infrastructure and the automation infrastructure.
Similarly to the regular infrastructure, the meta-test cucumber world has a `.testCucumberFacades` property, leading into its infrastructure. 

### Running the meta-tests

The meta-test infrastructure relies on `config/testConfig.js` to force cucumber into running the features library in `test/features/`, as well as the support code included there.
In order to run it, either use the `npm test` shorthand, or manually run `node testRunner.js --configFile=testConfig.js`.

### Meta tests capabilities

The meta-tests capabilities are mainly twofold:

- Selectively prodding the automation infrastructure objects
- Validating cucumber features and step definitions via parsing and reflection

##### Prodding automation infrastructure objects

The meta-test infrastructure provides access to the regular automation infrastructure object tree via `TestInfrastructure.automationInfrastructure`, so you can access, manipulate and meta-test all the infrastructure objects and behaviours.
You can replace inner sub-objects with your own mocks, spies and other utilities, and monitor the message flow and call stack when triggering specific infrastructure objects and methods.

For example, use [Sinon](http://sinonjs.org/) to validate singleton patterns, call-once restrictions, and perform other, more complex validations at will.

##### Validating cucumber features and step definitions

These validation capabilities can be used in a very basic and crude fashion (i.e. validate a regexp match occurs / doesn't occur in certain files).
However, the meta-test infrastructure facilitates more sophisticated and nuanced validations.

The meta-test infrastructure scans and parses the automation infrastructure step definitions and features, resulting in structured objects that can be used for complex rule validations.
The current demo scenario exemplifies using the step definition JSDoc comments in pre/post requisite rules.
 
The rule engine gathers all the relevant features, harvests the scenarios, matches the scenario steps to their step definitions, and then uses specific JSDoc structures as markers for steps that **must** appear before/after the step in question.

While not as structured and documented as the automation infrastructure itself, you can track the above test-flow, debug the participating functions and data-structures, and build your own business rules and validations.