# CucumberJS Boilerplate


## General

This project provides a boilerplate for large-scale cucumberJS projects, allowing you to hit the ground running, spending time on what matters - your organization's DSL and specs.

## Features

#### CI friendly
A single access point for easily running a project / integration build.
The configuration automatically supports reading the build number and the build trigger from passed parameters, and mutate the run behaviour accordingly. 

#### Composable configurations
Customize the project's `masterConfig.js` to your needs, then add as many more overriding configuration files as you want.
Run the project with multiple `--configFile=someFile.js` parameters to aggregate and override specific settings for every environment / build type / contingency.

Want something more ad-hoc? No problem - run the project with multiple `--configParam a.b.c=Something` to override specific configuration paths.

#### Built in meta-test infrastructure
Test your automation infrastructure with meta-tests that assert the project itself.
Everything is already set up, just write your own meta-tests, and you're ready to go with a simple `npm test`.
Implement the automation project as a CI build project, and test your code with every push.

#### Easily use report plugins or write your own
The project comes with built in HTML and Slack reporter, and an extremely easy template for implementing your own reporters.

#### Cucumber / Infrastructure code separation 
Keep your cucumber world lean and simple - All cucumber support file, step definitions and hooks see simple code facades through a single access point.
Your infrastructure is completely hidden from cucumber steps, allowing you to change your infrastructure's implementation without any impact on cucumber or the test flow.

#### Debuggable infrastructure
Easily run cucumber in-process, and debug your entire infrastructure from the comfort of your favorite IDE.
Switch to the more efficient spawned-process run in your integration environment by flipping a single configuration value.

#### Use steps the modify future steps
Built in infrastructure for modifying future steps behavior according to the current step / to configuration values.
Customize your own behaviors by tracking a working real-world example for marking the next step as expected to fail with a specific error.

#### Built in utils
The project comes with some basic utils, allowing you to use scenario data context, parsed variables, indented console-log, and more.
Or, throw all those to the bin, and write everything by yourself.

#### Built in encrypted passwords/credentials management
Encrypt your service passwords and credentials with a single command, and commit them with your code.
Decrypt them with similar ease on deployment, and access them like any other infrastructure variable.

## Installation

1. **Get the files** by one of these methods:

- Clone the repository and reset its origin to your own repository
- Download & extract the [zipped repo](https://github.com/yaronassa/cucumber-js-boilerplate/archive/master.zip).
- Use [SAO](https://github.com/egoist/sao) to install from report via `sao yaronassa/cucumber-js-boilerplate` 

2. **Install the dependencies** by one of these methods:

- `npm install`
- `yarn install`

3. **Decrypt the demo password file**

- Run `npm run decryptPasswords`

4. **You're good to go**

## Quick start

#### First run

It's probably best to see the infrastructure in action.
Either run `testRunner.js` from you favorite IDE, or through the terminal via `node ./testRunner.js`.
You can also use `npm start` to the effect.

You'll see the infrastructure print out some configuration messages, and then run through with the demo features.
When the run finishes, you'll have a passed and a failed scenario, and console output, and a html result file in `./results/cucumberResults.html`.

#### Configuration

The infrastructure comes with built-in support for multiple environments, configurations and configuration overrides.
`./config/masterConfig.js` represents the complete configuration tree for the run, reports and infrastructure capabilites.

Parameters can be overwritten by running with `--configFile=someFile.js` (expected to be in the `./config` folder) and `--configParam a.b.c.d=value`.
Any JSON path in the config file will override the parallel path in the master file, as well as any path in the configParam parameter.
You can compose and re-compose as many overwriting files and parameters.

Since the configuration system controls the run helpers as well as the infrastructure, it's even used to running the meta-tests.
`./config/testConfig.js` overrides the `testRunner.cucumber.defaultRunArgs` path, which controls that infrastructure, support files and step definitions that will be loaded.

#### New features and steps

Writing more features is similar to any other cucumber project.
Just go to the feature root directory at `src/features`, and write new features, scenarios and matching step definitions.

As you can see in existing steps, the cucumber world objects has `.facades` property, which leads to the `src/infrastructure/cucumberFacades` code structure.
When adding new steps, implement them in new facade functions and objects as needed, and only access other infrastructure modules from within these facade functions.
This will ensure proper code separation and encapsulation.

**Please Note** - Facade functions MUST return a Promise as their result.

#### New infrastructure modules

As cucumber can only access the facade functions and code structures, other infrastructure modules only exists to "serve" these facades.
You can write as many new infrastructure modules as you'd like. It's best to follow the existing convention of creating them as a new instance, and attaching them to one of the existing infrastructure modules (or the root object).
This will ensure every infrastructure module can reuse other modules public methods. 

#### Using cucumber hooks

All cucumber hooks are already connected to the infrastructure in `src/infrastructure/testFlow/testFlow.js` under the `._hooksHandlers` structure.
Like facade functions, it's best to leave these connector functions lean, and just add function calls to the `hookActions` array, as demonstrated in some of the functions.

**Please Note** - Hook action functions MUST return a Promise as their result.

## Normal start

OK, so, you saw the tests run, and you want to know more. Here's some less-than-basic details on the test flow and infrastructure internals:

##### Entity enumeration and storage

A central part of any meaningful test scenario is creating, modifying and validating entities.
The infrastructure mirrors and facilities this by providing a rich internal representation for entities life cycle.
The `Data` module stores created entities references in `.scenarioData.createdEntities`. A document database that can be queried and updated as needed.

Steps can reference entities created in the current scenario by "The last", and "#N" (e.g. The last user / User #3). This reference can be easily translated to a pointed to the stored entity.
This can be used to retrieve it from the test environment and be used for assertions and validations.

Similarly, the `TestFlow._hooksHandlers.AfterScenario` hook triggers `TestEnvironment._deleteScenarioEntities`, which runs through the stored entities, and deletes them in preparations for the next scenario.

These capabilities are demonstrated in `src/features/demo/4. demo_entities.feature`. 

##### Field parsing & Variable processing

Cucumber steps are flat strings, and sometimes require additional processing to applying regexp capture group.
The infrastructure provides two central mechanisms to enrich the flat steps:

- Parsing field-value pairs
- Using variables

###### Parsing field-value pairs

In many situations, it's useful to specify many field-value pairs under one cucumber capture group.
For example, when validating entity properties, we'd like to specify all expected values for all properties in a single, unlimited format.

`Parser.parseFieldPairs` take a string of the format *a=b, c=d, e=f*, and breaks it down to an array of `{fieldName, fieldValue}` objects, while accounting for escaping and variable processing.

This capability is demonstrated in `src/features/demo/4. demo_entities.feature` as part of the entity creation and validation steps.

###### Using variables

Variables appear in the form `${}` and can be used to reference entity properties, produce complex values, and allow for sophisticated value comparisons.

Variables that are transformed to flat string:

- createdEntities variables - are transformed to the relevant entity's property value. e.g. ${createdEntities_User_#1.name} will be transformed into the first created user's name.
- date variables - are transformed into today's date, with the requested offset, and a possible output format. e.g ${Date_today_-1_year}, ${Date_today_-1_year_+5_days}, ${Date_today_format_DD/MM}
- Math & random variables - Are transformed into the string representation of the calculation result. e.g. ${=_1+4*2} will be transformed into the string 9, and ${random_20_25} will be transformed into the string of a number between 20 and 25 (inclusive),
- Password variables - Are transformed into the matching object path specified in `passwords/outputtedPasswords.json`. e.g. ${passwords_some} will be transformed into the string "value" and ${passwords_some.length} into the string "5".

Variables that are transformed to objects:

- array variables - are transformed into actual arrays, and can be useful for functions that expects multiple values: ${[a, b, c, d, ...]}
- regex variables - are transformed into regular expressions, and are mainly used for value comparisons. e.g. ${/some.*regexp/i}.

Array and regex variables can also be used as testable objects, for sophisticated value comparisons.
Testables support variable modifiers that can change their behaviour. These include:

- contains - Makes the variable return true even on partial matches.
- ignoreCase - Makes the variable return true when matching different cased strings
- trim - Makes the variable return true when matching string with trailing spaces.

These capabilities are demonstrated in `src/features/demo/3. demo_variables.feature`.

##### Meta-Test framework
The project is bundled with a built-in meta-test framework, which allows you to test the infrastructure code and features via reflection.

These capabilities are demonstrated in `src/features/demo/2. demo_meta.feature` and in `test/testFeatures/testDemo/testDemoFeature.feature`.

You can read about the Meta-Test framework in detail in the [meta-test readme](metaTest_readme.md).

## Slow start - Technical Overview

A comprehensive technical overview is available in the [technical readme](technical_readme.md). 
