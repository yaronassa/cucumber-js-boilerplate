import {it, describe} from 'mocha';
import * as Chai from 'chai';
const expect = require('chai').expect as Chai.ExpectStatic;
const moment = require('moment');

import {VariableProcessor} from "../../../../src/infrastructure/utils/variableProcessor";
import {Utils} from "../../../../src/infrastructure/utils/utils";
const utils = new Utils();

class TestProcessor extends VariableProcessor {
    // @ts-ignore
    public get infra() {
        return {
            data: {
                storeRawEntityData: () => {},
                getScenarioEntity: (type: string, indexOrDesc: string) => `${type}-${indexOrDesc}`,
                getUserPassword: (system, domain, user) => `${system}:${domain}:${user}`,
                globalData: {
                    globalVariables: {some: 'value'}
                }
            },
            utils: {
                parser: utils.parser,
                getPropertyRecursive: (obj, path) => `${obj}:${path}`

            },
            config: {
                externalParams: { some: 'value2'}
            }
        };
    }

    public log() {

    }
}

const processor = new TestProcessor();

describe('Utils variable processor', () => {

    describe('Simple value processors', () => {
        describe('Entity variables', () => {

            it('Correctly parses "this" syntax', async () => {
                const result = await processor.processVariables('${this_type.data}');
                expect(result).to.equal('type-latest:entity.data');
            });

            it('Correctly parses index syntax', async () => {
                const result = await processor.processVariables('${entities_type_1.data}');
                expect(result).to.equal('type-1:entity.data');
            });

            it('Correctly retrieves the relevant object path', async () => {
                const result = await processor.processVariables('${entities_type_1.data.inner_property}');
                expect(result).to.equal('type-1:entity.data.inner_property');
            });

            it('Correctly alerts on zero-based index', async () => {
                await expect(processor.processVariables('${entities_type_0}')).to.be.rejectedWith(`Entity indices are 1-based. Don't use a zero based index`);
            });
        });

        it('Handles math variables', async () => {
            const result = await processor.processVariables('${=_ 3*7 + 3}');
            expect(result).to.equal('24');
        });

        it('Handles random variables', async () => {
            const result = await processor.processVariables('${random_3_3}');
            expect(result).to.equal('3');

            const result2 = await processor.processVariables('${random_1_10}');
            expect(Number(result2)).to.be.greaterThan(0).and.lessThan(11);
        });

        describe('Handles date variable', () => {
            it('Defaults to a basic format for today', async () => {
                const result = await processor.processVariables('${date_now}');
                expect(result).to.equal(moment().format('DD/MM/YYYY'));
            });

            it('Can be set to a specific date', async () => {
                const result = await processor.processVariables('${date_11/12/13}');
                expect(result).to.equal('11/12/2013');
            });

            it('Can be modified with multiple different + / - ranges', async () => {
                const result = await processor.processVariables('${date_11/12/13_5_days}');
                expect(result).to.equal('16/12/2013');

                const result1 = await processor.processVariables('${date_11/12/13_5}');
                expect(result1).to.equal('16/12/2013');

                const result2 = await processor.processVariables('${date_11/12/13_-5_months}');
                expect(result2).to.equal('11/07/2013');

                const result3 = await processor.processVariables('${date_11/12/13_-5_months_5_days}');
                expect(result3).to.equal('16/07/2013');
            });

            it('Can output in different formats', async () => {
                const result = await processor.processVariables('${date_11/12/13_format_DD-YYYY}');
                expect(result).to.equal('11-2013');
            });

            it('Can combine output and date modifiers', async () => {
                const result = await processor.processVariables('${date_11/12/13_5_days_format_DD-YYYY}');
                expect(result).to.equal('16-2013');
            });
        });

        it('Handles password variables', async () => {
            const result = await processor.processVariables('${password_system1_domain1_user1}');
            expect(result).to.equal('system1:domain1:user1');
        });

        it('Handles global variables', async () => {
            const result = await processor.processVariables('${global_some.hello}');
            expect(result).to.equal('value:hello');
        });

        it('Handles externalparam variables', async () => {
            const result = await processor.processVariables('${externalparams_some}');
            expect(result).to.equal('value2');
        });

        it('Doesnt change toDelete variables', async () => {
            const result = await processor.processVariables('${toDelete}');
            expect(result).to.equal('${toDelete}');
        });

        it('Throws on unknown variable types', async () => {
            await expect(processor.processVariables('${someType_hello}')).to.be.rejectedWith(`Cannot find variable processor for sometype`);
        });

        it('Processes variable type as case insensitive', async () => {
            const result = await processor.processVariables('${GloBal_some.hello}');
            expect(result).to.equal('value:hello');
        });

        it('Handles nested variables', async () => {
            const result = await processor.processVariables('${global_some.${externalparams_some}}');
            expect(result).to.equal('value:value2');
        });

    });

    describe('Complex object processors', () => {
        it('Handles array values', async () => {
            const result = await processor.parseObjectVariables('${[1, 2, 3]}') as string[];
            expect(result).to.deep.equal(['1', '2', '3']);
        });

        it('Handles regular expressions', async () => {
           const result = await processor.parseObjectVariables('/hello/i') as RegExp;
           expect(result.test('Hello')).to.equal(true);
        });
    });

    // TODO: testables
});
