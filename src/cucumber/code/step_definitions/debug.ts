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
