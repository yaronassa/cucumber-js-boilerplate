import {it, describe} from 'mocha';
import * as Chai from 'chai';
const expect = require('chai').expect as Chai.ExpectStatic;

import {Parser} from "../../../../src/infrastructure/utils/parser";
const parser = new Parser();

describe('Utils parser', () => {
    describe('Parse Field Pairs', () => {
        it('Defaults to an empty collection', async () => {
            const pairs = await parser.parseFieldPairs('', false);
            expect(pairs.length === 0);
        });

        it('Defaults field values to empty strings', async () => {
            const pairs = await parser.parseFieldPairs('a,b,c', false);
            expect(pairs.length === 3);
            expect(pairs.every(item => item.fieldValue === '')).to.equal(true);
        });

        it('Can escape split characters', async () => {
            const pairs = await parser.parseFieldPairs('a\\,b,c\\==c value', false);
            expect(pairs.length === 2);
            expect(pairs.find(item => item.fieldName === 'a,b')).not.to.be.undefined;
            expect(pairs.find(item => item.fieldName === 'c=')).not.to.be.undefined;
            expect(pairs.find(item => item.fieldName === 'c=').fieldValue).to.equal('c value');
        });

        it('Can default retrieved field value', async () => {
            const pairs = await parser.parseFieldPairs('a,b,c', false);
            const fieldWithoutDefault = pairs.getField('d');
            const fieldWithUndefinedDefault = pairs.getField('d', undefined);
            const fieldWithValueDefault = pairs.getField('d', 'd');

            expect(fieldWithoutDefault).to.be.undefined;
            expect(fieldWithUndefinedDefault).not.to.be.undefined;
            expect(fieldWithUndefinedDefault.fieldValue).to.be.undefined;
            expect(fieldWithValueDefault.fieldValue).to.be.equal('d');
        });

        it('Can remove fields by name and value', async () => {
            const pairs = await parser.parseFieldPairs('a=a1,b=b1,c=a1,d=b1', false);
            const removed = pairs.removeByValue('a1');
            expect(removed.length).to.equal(2);
            expect(removed[0].fieldName).to.equal('a');
            expect(removed[1].fieldName).to.equal('c');
            expect(pairs.length).to.equal(2);
            expect(pairs[0].fieldName).to.equal('b');

            const removedByName = pairs.removeField('b');
            expect(removedByName.fieldName).to.equal('b');
            expect(pairs.length).to.equal(1);
            expect(pairs[0].fieldName).to.equal('d');
        });

        it('Can to turned into a string', async () => {
            const pairs = await parser.parseFieldPairs('a=a1,b=b1,c=a1,d=b1', false);
            expect(pairs.toString()).to.equal('a=a1, b=b1, c=a1, d=b1');
            expect(pairs.toString('; ')).to.equal('a=a1; b=b1; c=a1; d=b1');
        });

        it('Can be cloned', async () => {
            const pairs = await parser.parseFieldPairs('a=a1,b=b1,c=a1,d=b1', false);
            const pairs2 = pairs.clone();

            expect(pairs2.length).to.equal(4);
            expect(pairs2.toString()).to.equal(pairs.toString());

            pairs.getField('a').fieldValue = 'a2';

            expect(pairs.getField('a').fieldValue).to.equal('a2');
            expect(pairs2.getField('a').fieldValue).to.equal('a1');
        });

        it('Can push items into it', async () => {
            const pairs = await parser.parseFieldPairs('a=a1', false);
            pairs.push({fieldValue: 'b1', fieldName: 'b'});
            expect(pairs.getField('b', undefined).fieldValue).to.equal('b1');
        });
    });
});