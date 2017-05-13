# Cucumber Boilerplate Technical Readme

## General

This readme presents an overview of the project structure, as well as in depth examples and details of the possible implementations and code structures.

Make sure you read the [general reame](README.md) and go through the installation process before proceeding.


## Project overview
This project includes 5 main segments

- Run engine that handles setting up the env., parses run arguments and configurations, reporting to external systems, and running the automation tests.
- Cucumber test features with business logic scenarios.
- Cucumber step infrastructure that connects scenario sentences (e.g. "I login as user A") to facade functions.
- Automation infrastructure that actually carries out the facade function calls against internal memory and the test environment.
- Meta-test infrastructure, that tests the automation infrastructure itself

### Run engine
The main access point to the automation is through the `testRunner.js` file.
It uses helpers under `runHelpers/` to parse run arguments, cucumber results and output streams; and actually launch Cucumber and run the automation tests.

The main configurable arguments you can pass to the file are:

- `--configFile SOMEFILE`. Load override configuration from the specified json file (is searched under `config/`).
- `--tags=@someTag`. Run only scenarios tagged as @someTag. You can use any cucumber tag syntax multiple times (e.g. `--tags=@includeMe --tags=~@excludeMe`).

TODO: more config options

### Cucumber test features
These are stored under `src/features`, and include all the `.feature` files there.

### Cucumber infrastructure
This includes all the files under `src/features/support` and under `src/features/step_definitions`.
These are standard cucumberJS support files, with the addition that the cucumber world object has a `.facades` property which leads into the infrastructure facade functions.

### Automation infrastructure
This includes everything under `src/infrastrcture`. Each automation class has a `._infra` property which leads back to the `src/infrastructure/automationInfrastructure.js` root object.
Cucumber infrastructure can only access the facades defined within `facades` (leading into the object sub-tree defined in `src/infrastructure/cucumberFacades/`), and they branch out to operate the entire automation infrastructure to carry out the required business logic.

### Meta-test infrastructure
This segment includes everything in `test/`, and basically mirror the structure of The cucumber infrastructure and the automation infrastructure.
The meta-test infrastructure relies on `config/testConfig.js` to force cucumber into running the features library in `test/features/`, as well as the support code included there.
Similarly to the regular infrastructure, the meta-test cucumber world has a `.testCucumberFacades` property, leading into its infrastructure. 
Besides providing automation facades, `.testCucumberFacades` also provides access to the regular automation infrastructure object tree via `TestInfrastructure.automationInfrastructure`, so you can access, manipulate and meta-test all the infrastructure objects and behaviours.

**Please note** - The meta-test infrastructure is only loaded when the `config/testConfig.js` configuration file is loaded. 
It's not part of the regular infrastructure run lifecycle.

## Run lifecycle

When a regular test suite runs, i.e. when launching `./testRunner.js`, the following sequence is executed (directories may change if the relevant configuration options are overridden):

*testRunner.js*

- Prepares the file-system for the new run (cleaning old results, etc.).
- Aggregates the configuration and run parameters, and calculates the parameters for the cucumber launch.
- Launches cucumber via the `runHelpers/cucumberRun.js` wrapper.
- After cucumber exists, parses the output, exports relevant reports (html, slack, etc.).

*CucumberJS*

- Is launched via its CLI object with the relevant arguments.
- Scans `src/features/step_definitions/` for step definitions, and loads them all.
- Scans `src/features/support/` for support files, and loads them all.
  - Specifically, `src/features/support/world.js` defines the cucumber World object, and attaches a `.facades` property to a new `cucumberFacades` object facades.
  - This constructs the singleton root of the infrastructure object (see below).
  - Also, `src/features/support/hooks.js` connect cucumber event to the automation infrastructure test event handlers.
- When the tests execute, events trigger the infrastructure event handles, and steps trigger its facades.
- Exists when all cucumber features have been exhausted.
  
*AutomationInfrastructure.js*

- Is constructed by cucumber's World object initialization.
- Loads the entire infrastructure module hierarchy (everything is initialized as a singleton object instance).
- Listens to cucumber events through `src/infrastructure/testFlow/testFlow.js` event handlers.
- Reacts to cucumber steps through `src/infrastructure/cucumberFacades/` step handlers (called from cucumber step definition files).
- Usually exists once cucumber AfterFeatures hook has ran, and CucumberJS has exited.

## Automation infrastructure classes

The following outlines the automation infrastructure structure under `src/infrastructure/`

#### AutomationInfrastructure 
Main Access point for the entire class structure. 

Its constructor has a `createNew` parameter (default=false), which if set to true, builds a new object (with an entirely new class structure) and returns it instead of the singleton root object.
Creating this class will recursively create and initialize the entire infrastructure object tree.

#### Assert
- Assertion services and logic. Any and all validations are performed in this class structure.
- The different sub-classes correspond to the applicative area to assert (currently only has an `assertEntities` subclass).
- Most assertion functions should work with an expected result structured as an array of `{fieldName, fieldValue}` objects, built by `Parser.parseFieldPairs`.
- This will allow the assertion functions to use `Assert.compareObjectToExpectedSpec` - a generic comparison function with overridable options and extensions.

#### CucumberFacades
- Contains the business-logic functions that are called by the cucumber steps.
- Are split into an object sub-tree of applicative areas. It's best practice for this sub-tree to mirror the step definition files structure.
- All functions **must** return a bluebird promise result.
- Assume facade functions may be called from other functions as well as from the cucumber steps.

#### Data
- The `Data` class stores all the run, feature and scenario information about created entities and operations performed by the infrastructure.
- Most of the information is stored in `TestPhaseData` objects. These objects are aggregated and used to reset the environment at the end of the test phase. See [Test Environment](#TestEnvironment) for more details.

#### Logic
- Contains all the processing and logic manipulation on the system's entities and business processes. 
- Unlike functions under `Services`, logic functions work internally, and don't access the test environment by themselves (this also means they are synchronous).

#### Services
- Contains wrappers for actions against outside services, apis and other tools that are not constrained to the internal data representation of the infrastructure.
- Basically, if a wrapper activates something outside of this folder structure, it should be under services. 

#### TestEnvironment
- Used as the external gate for accessing the manipulating the test environment.
- Currently only houses stubs and mocks. A real-world example would have sub-structures for api, db, fs and other manipulations as needed.

#### TestFlow
- Handles the test flow, and keeps records of test phase durations, statuses and exceptions.
- The `TestFlow._hooksHandlers` structure houses functions that are called by the cucumber hook with the corresponding name.
- Most `TestFlow._hooksHandlers` functions have an array of hook actions to perform (**must** return a promise), that are called sequentially by `TestFlow._runHookActions`. 
- The `TestFlowMetaHelpers` class contains utils that manipulate the way the test flows and response to commands. These utils replace CucumberFacade functions with proxies that manipulate their inputs, outputs and success criteria (for example, flip future step results when using "The next N steps should fail" step).

**Notable cucumber hooks**:
- BeforeFeatures - The first hook that's called and executed. Used as the infrastructure's a-synchronous init hook (environment building, listener inits, etc.). This is the only hook that stops the entire run if it fails.
- BeforeScenario - Used mostly to clean the restructure the internal infrastructure data.
- AfterScenario - Used to reset the environment by cleaning scenario created entities.
- AfterFeatures - The last hook that's called and executed. Used as the infrastructure's a-synchronous teardown hook.

##### Utils
- Houses helpers and processors, some of them use and manipulate the test environment asynchronously.
- `LogHelper` controls the stdout and cucumber out logs, allowing suppression and manipulation of outgoing logs.
- `Parser` used for unstructured information parsing and processing. Mostly used to break down cucumber steps unstructured information, in order to be sent to validation functions and other utilities.
- `VariableProcessor` - Used to parse plain-text phrases and expressions from cucumber steps. Most frequent uses: parsing complex data types (arrays, regexps), accessing created entities properties (retrieve claim id, etc.), and constructing assert-test objects in `VariableProcessor.getTestable`, which encapsulates many assertions, tests and comparisons.

