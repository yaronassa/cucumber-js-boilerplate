# CucumberJS Boilerplate

## General

This project provides a boilerplate for large-scale cucumberJS projects, allowing you to hit the ground running, spending time on what matters - your organization's DSL and specs.

- CI friendly
- Module friendly
- Composable configurations
- Extensive cucumber hook support
- Control the cucumber test flow
- Cucumber / Infrastructure code separation
- Debuggable infrastructure
- Built in encrypted passwords/credentials management


## Installation

1. **Get the files** by one of these methods:

- Clone the repository and reset its origin to your own repository
- Download & extract the [zipped repo](https://github.com/yaronassa/cucumber-js-boilerplate/archive/master.zip).
- Use [SAO](https://github.com/egoist/sao) to install from report via `sao yaronassa/cucumber-js-boilerplate` 

2. **Install the dependencies**:

- `npm install`

OR

- `yarn install`

4. **You're good to go**. See The quick-start section below, or go through the more [in-depth guide](./documentation/guide.md)..


## Features

#### CI friendly

The infrastructure provides many CI friendly features:

- Cascading configuration files, allowing local machine / environment / custom overrides through files and parameters.
- A single access point for easily running a project / integration build.
- Ability to inject external build parameters into your cucumber features.
- Ability to filter / reorder tests according to build parameters.
- Flexible setup and teardown hooks, allowing post-run result manipulation. 

#### Module friendly

The entire infrastructure and its runner can be imported to your code and used as any other module.
You can embed an entire cucumber project as a part of a greater whole.

#### Composable configurations

Customize the project's `masterConfig.ts` to your needs, then add as many more overriding configuration files as you want.
Run the project with multiple `--configFile=someFile.ts` parameters to aggregate and override specific settings for every environment / build type / contingency.

Want something more ad-hoc? No problem - run the project with multiple `--configParam a.b.c=Something` to override specific configuration paths.

#### Extensive cucumber hook support

In addition to the usual cucumber hooks, enjoy more fine-grained hooks:

- beforeRun - To initialize your infrastructure before any scenario starts running
- afterRun - To teardown any dependencies that need cucumber to finish runner in order to clean / post-process.
- beforeStep, afterStep - Allows pre and post micro-actions to control how steps are executed

#### Control the cucumber test flow

Access the preloaded test-cases, and reorder, truncate or manipulate them to your liking.

The infrastructure comes with a built in tag grouping mechanism: 

- Scenarios tagged with `@setup`<sup>*</sup> will be executed first
- Scenarios tagged with `@teardown`<sup>*</sup> will be executed last
- Other scenarios will be executed between the above two

<sup>*</sup> The actual tags are configurable

#### Cucumber / Infrastructure code separation 

Keep your cucumber world lean and simple - All cucumber support file, step definitions and hooks see simple code facades through a single access point.

Your infrastructure is completely hidden from cucumber steps, allowing you to change your infrastructure's implementation without any impact on cucumber or the test flow.

#### Debuggable infrastructure

Run cucumber in-process, and debug your entire infrastructure from the comfort of your favorite IDE.

#### Use steps that modify future steps

Built in infrastructure for modifying future steps behavior according to the current step / configuration values.

Customize your own behaviors by tracking a working real-world example for marking the next step as expected to fail with a specific error.

#### Built in utils

The project comes with some basic utils, allowing you to use scenario data context, parsed variables, integrated logs, and more.

Or, throw all those to the bin, and write everything by yourself.

#### Built in encrypted passwords/credentials management

Encrypt your service passwords and credentials with a single command, and commit them with your code.
Decrypt them with similar ease on deployment, and access them like any other infrastructure variable.

## Quick start

#### Demo run and examples

It's probably best to see the infrastructure in action.

Either run through the terminal with `npm start -- cucumber --tags=@demo`, or use `npm run demo` to the same effect.

You'll see the infrastructure print out some configuration messages, and then run through with the demo features.
When the run finishes, you'll have passed and failed scenarios, and console output, and a html result file in `./temp/<Date_Time>/results/index.html`.

You can also take a look at the [example folder](/src/cucumber/features/examples), and the [test suite](./test/tests) to better understand the infrastructure features.

#### Configuration

The infrastructure comes with built-in support for multiple environments, configurations and configuration overrides.
[`./config/master.ts`](./config/master.ts) represents the complete configuration tree for the run, reports and infrastructure capabilities.

Specific parameters can be overridden by running with `--configFile=someFile.ts` (The files are expected to be in the `./config` folder) and `--configParam a.b.c.d=value` to override a specific configuration leaf.

Any JSON path in the config file will override the parallel path in the master file, as well as any path in the configParam parameter.
You can compose and re-compose as many overwriting files and parameters.

#### New features and steps

Writing more features is similar to any other cucumber project.
Just go to the feature root directory at `src/cucumber/features`, and write new features, scenarios and matching step definitions.

As you can see in existing steps, the cucumber world objects has `.facades` property, which leads to the `src/infrastructure/cucumberFacades` code structure.
When adding new steps, implement them in new facade functions and objects as needed, and only access other infrastructure modules from within these facade functions.
This will ensure proper code separation and encapsulation.

**Please Note** - Facade functions MUST return a Promise as their result.

#### New infrastructure modules

As cucumber can only access the facade functions and code structures, other infrastructure modules only exists to "serve" these facades.
You can write as many new infrastructure modules as you'd like. 

It's best to follow the existing convention of creating them as a new instance, and attaching them to one of the existing infrastructure modules (or the root object).
This will ensure every infrastructure module can reuse other modules public methods. 

#### Using cucumber hooks

All cucumber hooks are already connected to the infrastructure in [`src/infrastructure/testFlowManager/hooksManager.ts`](/src/infrastructure/testFlowManager/hooksManager.ts).
Like the facade functions, it's best to leave these connector functions lean, and just add function calls to the `hookActions` array, as demonstrated in some of the functions.

**Please Note** - Don't add your hook action directly to cucumber - instead, use the infrastructure's exiting methods and functions.

**Please Note** - Hook action functions MUST return a Promise as their result.

#### Using encrypted passwords

Usually the automation infrastructure needs to access repositories, services and accounts, not all of which have access-keys similar methods of authorization.
This raises the problem of passwords/credentials management. Should they be committed with the infrastructure code - exposed? Or managed separately, connected to the code via environment variables?
Each method has its pros and cons.

This boilerplate offers another option - encrypt your passwords with the organization's access-keys, commit them with the code, and decrypt them when deployed to a server / a developer workstation (both usually have the matching private-key for decryption).

- Encrypt your password files using [`./devTools/passwordUtils.ts`](/devTools/passwordUtils.ts).
- Put the encrypted file in `./passwords`. It can be safely committed with the project.
- Set the encryption secret in the relevant environment variable (see `config/master.ts` for the variable name).
- The infrastructure can now access you passwords using the `${password}` variable.

You can see the expected password format and variable usage in the [`./src/features/examples`](/src/cucumber/features/examples) path.

## In-depth look

OK, so, you saw the demo run, and you want to know more.

Browse the [examples folder](./src/cucumber/features/examples) for some common real-world scenarios.

Browse the [test folder](./test/tests) to get a handle on the specific capabilities.

You can find some less-than-basic details on the flow and infrastructure concepts in the [full guide](./documentation/guide.md).

And last but not least, a comprehensive technical overview is available in the [technical readme](./documentation/technical_readme.md).


