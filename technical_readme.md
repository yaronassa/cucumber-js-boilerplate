# Cucumber Boilerplate Technical Readme

## General

This readme presents an overview of the project structure, as well as in depth examples and details of the possible implementations and code structures.

Make sure you read the [general reame](README.md) and go through the installation process before proceeding.

## Run lifecycle

When a regular test suite runs, i.e. when launching `./testRunner.js`, the following sequence is executed (directories may change if the relevant configuration options are overridden):

*testRunner.js*

- Prepares the file-system for the new run (cleaning old results, etc.).
- Aggregates the configuration and run parameters, and calculates the parameters for the cucumber launch.
- Launches cucumber via the `runHelpers/cucumberRun.js` wrapper.
- After cucumber exists, parses the output, exports relevant reports (html, slack, etc.).

*CucumberJS*

- Is launched via its CLI object with the relevant arguments.
- Scans `src/features/step_definitions` for step definitions, and loads them all.
- Scans `src/features/support` for support files, and loads them all.
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


## Project overview
This project includes 4 main segments

- Run engine that handles setting up the env., parses run arguments and configurations, reporting to external systems, and running the automation tests.
- Cucumber test features with business logic scenarios.
- Cucumber step infrastructure that connects scenario sentences (e.g. "I login as user A") to facade functions.
- Automation infrastructure that actually carries out the facade function calls against internal memory and the test environment.

### Run engine
The main access point to the automation is through the `testRunner.js` file.
It uses helpers under `runHelpers/` to parse run arguments, cucumber results and output streams; and actually launch Cucumber and run the automation tests.

The main configurable arguments you can pass to the file are:

- `--configFile SOMEFILE.json`. Load override configuration from the specified json file (is searched under `config/`).
- `--tags=@someTag`. Run only scenarios tagged as @someTag. You can use any cucumber tag syntax multiple times (e.g. `--tags=@includeMe --tags=~@excludeMe`).

TODO: more config options

### Cucumber test features
These are stored under `src/features`, and include all the `.feature` files there.

### Cucumber infrastructure
This includes all the files under `src/features/support` and under `src/features/step_definitions`.
These are standard cucumberJS support files, with the addition that the cucumber world object has a `.facades` property which leads into the infrastructure facade functions.

### Automation infrastructure
This includes everything under `src/infrastrcture`. Each automation class has a `._infra` property which leads back to the `src/infrastructure/automationInfrastructure.js` root object.
Cucumber infrastructure can only access the facades defined within `facades`, and they branch out to operate the entire automation infrastructure to carry out the required business logic.


## Project structure
