import {Given} from 'cucumber';
import {ICucumberWorld} from "../support/world";

Given(/^I write (.+?) to (.+)$/i, function(this: ICucumberWorld, content, file) {
    return this.facades.misc.writeToFile(file, content);
});

Given (/^I set the global variable (.+) to (.+)$/,
    async function(this: ICucumberWorld, variableName, content) {
        return this.facades.misc.setGlobalVariable(variableName, content);
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

Given(/^The variable (.+?) (does(?:n't| not))? *equals? (.+?)$/i,
    function(this: ICucumberWorld, actual, rawExpectedResult, expected) {
        const expectedResult = (rawExpectedResult === undefined);
        return this.facades.misc.compareVariables(actual, expected, expectedResult);
    });

