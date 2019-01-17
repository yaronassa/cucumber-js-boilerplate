interface ICucumberResultElement {
    id: number,
    name: string,
    line: number,
    keyword: 'Feature' | 'Scenario' | 'Before' | 'After' | 'And ' | 'Given ' | 'When ' | 'Then ',
    tags: Array<{name: string, line: number}>,
}

interface ICucumberResultFeature extends ICucumberResultElement {
    uri: string,
    elements: ICucumberResultScenario[],
    metadata?: Array<{name: string, value: string}>
}


interface ICucumberResultScenario extends ICucumberResultElement {
    type: string,
    steps: ICucumberResultStep[]
}


interface ICucumberResultStep extends ICucumberResultElement {
    hidden: boolean,
    match: {location: string},
    result: {status: Status, duration: number},
    arguments?: string[]

}

type Status = 'passed' | 'failed' | 'skipped' | 'undefined';

class CucumberResultParser {

    private readonly results: ICucumberResultFeature[];
    private _stepCounts: {total: number, failed: number, passed: number, skipped: number, undefined: number};
    private _scenarios: ICucumberResultScenario[];

    constructor(cucumberResults: ICucumberResultFeature[]) {
        this.results = cucumberResults;
    }

    public getScenario(scenarioName: string): ICucumberResultScenario {
        return this.scenarios.find(scenario => scenario.name === scenarioName);
    }

    public getScenarioStatus(scenario: ICucumberResultScenario): Status {
        let result: Status = 'passed';

        for (const step of scenario.steps) {
            if (step.result.status === 'failed') return 'failed';
            if (step.result.status === 'skipped' || step.result.status === 'undefined') result = step.result.status;
        }

        return result;
    }

    public get scenarios(): ICucumberResultScenario[] {
        if (this._scenarios === undefined) {
            this._scenarios = this.results.reduce((acc, feature) => {
                feature.elements.filter(item => item.keyword === 'Scenario').forEach(item => acc.push(item));
                return acc;
            }, []);
        }

        return this._scenarios;
    }

    public get stepCounts(): {total: number, failed: number, passed: number, skipped: number, undefined: number} {
        if (this._stepCounts === undefined) {
            this._stepCounts = {total: 0, failed: 0, passed: 0, skipped: 0, undefined: 0};
            this.scenarios.forEach(scenario => scenario.steps.filter(step => step.hidden !== true).forEach(step => {
                this._stepCounts.total = this._stepCounts.total + 1;
                this._stepCounts[step.result.status] = this._stepCounts[step.result.status] + 1;
            }));
        }

        return this._stepCounts;
    }

}

export {CucumberResultParser};

