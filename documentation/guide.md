# In depth guid

This is an in depth guid to using the infrastructure.

It's recommended you start with the general quick start [readme](../README.md).

Also, browse the [examples folder](../src/cucumber/features/examples) for some common real-world scenarios.

## Code-first walkthrough

If you prefer learning from the actual code, you can just look for all the `TODO:IMPLEMENT_ME` comments in the project.

These are the "immediate suspects" I expect you to implement when actually using the infrastructure.
(Some of these will be comments asking you to leave that section alone).

## General

This infrastructure was built with 3 major requirements in mind:

- High degree of control over the actual flow of the test suite.
- Structured, extendable handling of the AUT's entities and data models.
- The possibility to separate the test-writer's steps from the inner-workings of the AUT.

Combined, these allow both the infrastructure maintainer and the test writer to operate with a large degree of freedom, and with not many limitations.

### Test flow control

The infrastructure is extremely opinionated with regards to the inner working of Cucumber, up to a degree where some features violate Cucumber's encapsulation.

While this has its drawbacks and may break some features in future versions of Cucumber, I believe the added value outweighs the risks.

##### Pre-run setup

The infrastructure wraps cucumber and runs it internally. This gives you a chance to perform any pre-run setup actions you'd like.

Just add any behaviours you need to the `.setupRunEnvironment` method on [cucumberRunner.ts](../src/runHelpers/cucumberRunner.ts).

These can be downloading features from a remote storage such as [TestRail](https://www.gurock.com/testrail), firing up virtual machines or setting up demo accounts on your AUT.

##### Extended cucumber hooks

The infrastructure takes control over all cucumber hooks, and adds a few of its own.
You can see all the hook wrapper functions in [hooksManager.ts](../src/infrastructure/testFlowManager/hooksManager.ts), and implement your own behaviours in them.

The available hooks are:

- beforeRun - Allows you to perform the async initialization actions of the infrastructure itself
- reorderTestCases - Allows you to control which test cases will actually be run and in which order  
- beforeAllScenarios - The standard cucumber BeforeAll hook
- beforeScenario - The standard cucumber Before hook
- beforeStep - Allows you to perform pre-step actions (not likely you'll need it)
- afterStep - Allows you to perform post-step actions, including mutating / cancelling step errors
- afterScenario - The standard cucumber After step
- afterAllScenarios - The standard cucumber AfterAll step
- afterRun - Cucumber has shutdown, you can perform teardown operations, as well as mutate the results JSON if needed

##### Built-in flow mutations

Overriding and extending cucumber's hooks and internals allows the infrastructure to manipulate the standard test flow behaviours.

You can implement your own behaviours, but the infrastructure comes with these built in options:

- Flip a future step result. You can mark next *n* steps for failure, which means you can expect them to fail (and even with a specific error if you'd like to).
This can allow you to quickly implement negative tests, without building "negative infrastructure" to support them.
- Wait for a future step to pass in a given timespan. This allows you to automatically retry a given action until it passes (say, query the AUT for an entity you just created),
without having to develop the specific infrastructure to support it.

You can see these behaviours in the [step manipulation feature example](../src/cucumber/features/examples/meta_step_manipulations.feature).

### Entity handling

A central part of any meaningful test scenario is creating, modifying and validating entities.
The infrastructure mirrors and facilitates this by providing a rich internal representation for entities life cycle.

#### Getting entities from the test environment and using them

The infrastructure generically supports getting entities and storing them using the *`"I work with a <type> with fields: <prop=value, prop=value>"`*.

For example: `Given I work with a location list with fields: name = lond`

This will automatically identify the entity type; mutate the user field (maybe the user wrote `name=someName` but the API field is called `fullName`, or maybe the value should be translated to an enum?); and call the relevant entity getter in the infrastructure.

The entity will be retrieved and stored for future reference - steps can reference entities retrieved in the current scenario with terms like `The last`, and `#N` (e.g. The last user / User #3). 
These references are automatically translated to the actual relevant entities.

For example: `Then this location list has fields: count = 3`

This entity-based language can be used to retrieve entities from the test environment and be used for assertions and validations.
These capabilities are demonstrated in the [Basic Entities example](../src/cucumber/features/examples/entities_basic.feature).

#### Updating, creating and deleting entities

You'll have to write your own (probably separate) cucumber steps for updating and creating entities.

These can be connected to the same generic entities infrastructure (like the entities getters), which can provide field mutation and payload preparation services.

See these capabilities demonstrated in the [Advanced Entities example](../src/cucumber/features/examples/entities_full_crud.feature). 

You can read more about the entity data flow from the code's perspective in the [technical readme](./documentation/technical_readme.md).
 
#### Adding your own entities

So, what's **actually** needed to add your own entity handlers?

##### Add system and type logic

The logic systems and types framework is used to parse the human readable entity types the user writes into the ridged constraints of code entity types.  

In [logic/entities.ts](../src/infrastructure/logic/entities.ts): 

- Update the `System` enum with your entity's system
- Update the `processRawTypeSystem` method to extract and identify the above system.
- Update the `getRootTypeName` method to extract the root type for your new entity types. 

The root type will define the file-name the infrastructure will search for in the next sections.

##### Add field mutation logic

Field mutators are the bridge between the user possibly messy steps and the structured payloads and algorithms of your systems APIs and processes.

A mutator can be as simple as mapping human-readable field names to API technical fields; cam include simple value mutations as lower-casing a value;
and can have a full-blown algorithm adding, merging and mapping fields and values in sophisticated ways.

In [logic/fieldMutators](../src/infrastructure/logic/fieldMutators), create a folder with your new system name.
In it, place a mutator file with a filename matching the root-type of your new entity.

The file should default-export a class extending the [abstractFieldMutator](../src/infrastructure/logic/fieldMutators/abstractFieldMutator.ts) class.
You can see how to mutate user fields and values in the existing mutators and examples.

In most cases, a simple mutator with a `sharedMutations` object property will be enough to map fields and values as needed.
The [technical readme](./documentation/technical_readme.md) has an in-depth discussion of even more advanced mutation possibilities.

##### Add relevant entity services

Entity services are used to create, get, update and delete entities in the test-environment. 
A service will usually prepare the payload and parse the API/DB response, while leaving the actual action to the testEnvironment module.

Since entities are stored in a uniform manner in the infrastructure, the entity services expect structured inputs / outputs to their operations.

In [services/entityServices](../src/infrastructure/services/entityServices/), under the relevant action (entityCreators, entityDeleters, entityGetters, entityUpdaters), add a file matching your entity's root type.

The file should default-export a class extending the relevant abstract class. 
You can look at the existing samples as to how to implement each class type.

The [technical readme](./documentation/technical_readme.md) has an in-depth discussion of each class tyoe and it's relevant details and nuances.

Additional unstructured services can be added under the [additionalEntityServices](../src/infrastructure/services/entityServices/additionalEntityServices.ts) class, and called from the cucumberFacades / other modules.

##### Add and connect relevant testEnvironment classes

The testEnvironment module is supposed to house method that actually "go out to the world" and perform some actions.
Unlike the logic / services classes, the testEnvironment ones aren't structured and don't relay on common implementations.

Just write the methods to retrieve / manipulate your AUT's entities, and use them from the different services.
Change the config schema and master files to support your new operations.

##### That's it

### Field parsing & Variable processing

Cucumber steps are just flat strings, but sometimes more is required - interloping strings, working with arrays, regexps, etc.

The infrastructure provides two ways for enriching flat steps:

- Parsing field-value pairs
- Using variables

##### Parsing field-value pairs

In many situations, it's useful to specify many field-value pairs under one cucumber capture group.
For example, when validating entity properties, we'd like to specify all expected values for all properties in a single, unlimited format.

`Parser.parseFieldPairs` take a string of the format *`a=b, c=d, e=f`*, and breaks it down to an array of `{fieldName, fieldValue}` objects, while accounting for escaping and variable processing.

This capability is demonstrated as part of the entity creation and validation steps.
You can also explore the relevant [parser tests](../test/tests/infrastructure/utils/parser.tests.ts).

##### Using variables

Variables appear in the form `${Variable}` and can be used to reference entity properties, produce complex values, and allow for sophisticated value comparisons.

Variables that are transformed to flat string:

- createdEntities variables - are transformed to the relevant entity's property value. e.g. ${createdEntities_User_#1.name} will be transformed into the first created user's name.
- global, external variables - are transformed to a previously stored / externally passed data, e.g. ${global_someName}, ${externalParams_someName}
- date variables - are transformed into today's date, with the requested offset, and a possible output format. e.g ${Date_today_-1_year}, ${Date_today_-1_year_+5_days}, ${Date_today_format_DD/MM}
- Math & random variables - Are transformed into the string representation of the calculation result. e.g. ${=_1+4*2} will be transformed into the string 9, and ${random_20_25} will be transformed into the string of a number between 20 and 25 (inclusive),
- Password variables - Are transformed into the matching password from the encrypted password file. e.g. ${password_system_domain_user} will be transformed into the matching password for this system-domain-user combination (if exists).

Variables that are transformed to objects:

- array variables - are transformed into actual arrays, and can be useful for functions that expects multiple values: `${[a, b, c, d, ...]`}
- regex variables - are transformed into regular expressions, and are mainly used for value comparisons. e.g. ${/some.*regexp/i}.

Array and regex variables can also be used as testable objects, for sophisticated value comparisons.
Testables support variable modifiers that can change their behaviour. These include:

- contains - Makes the variable return true even on partial matches.
- ignoreCase - Makes the variable return true when matching different cased strings
- trim - Makes the variable return true when matching string with trailing spaces.

See these capabilities demonstrated in the [variables example](../src/cucumber/features/examples/variables.featrure).

You can also explore the relevant [variable tests](../test/tests/infrastructure/utils/variableProcessor.tests.ts) to gain a better understanding.

**Please note** Currently all variable processing is logged and appears in the output, except for password variables.

# Deeper dive - A Technical Overview

A comprehensive technical overview is available in the [technical readme](./technical_readme.md). 
