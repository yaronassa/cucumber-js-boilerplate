import {Given} from 'cucumber';
import {ICucumberWorld} from "../support/world";


Given(/^I run an? (.+)? *step$/, function(this: ICucumberWorld, rawProperties) {
    const properties = {
        async: /async/i.test(rawProperties),
        failed: /fail/i.test(rawProperties),
        skipped: /skip/i.test(rawProperties)
    };

    return this.facades.debug.demoStep(properties);
});

Given(/^Eval code (.+)$/, {timeout: -1},
    function(this: ICucumberWorld, userCode) {
        return this.facades.debug.evalCode(userCode);
    });

Given (/^(?:I )?print variable (.+)$/i, function(this: ICucumberWorld, variable) {
    return this.facades.debug.printVariable(variable);
});

Given(/^I write (.+?) to (.+)$/i, function(this: ICucumberWorld, content, file) {
    return this.facades.misc.writeToFile(file, content);
});


Given(/^The next (\d+)? *steps? (should|must|may) fail(?: with (.+?))?$/i,
    function(this: ICucumberWorld, stepCount, mustFail, errorMessage) {
        if (stepCount === undefined || isNaN(stepCount)) stepCount = 1;
        mustFail = (!mustFail.match(/may/i));
        return this.facades.misc.markNextStepsForFailure(stepCount, mustFail, errorMessage);
    });

Given(/^I wait for the next step to pass (?:(?:in|for) (\d+) minutes|indefinitely)?$/i,
    function(this: ICucumberWorld, minutes) {
        minutes = (minutes === undefined) ? 60 * 10 : Number(minutes);
        return this.facades.misc.waitForNextStepToFinish(minutes);
    });

