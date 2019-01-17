import {it, describe} from 'mocha';
import * as Chai from 'chai';
const expect = require('chai').expect as Chai.ExpectStatic;

import {TestUtils} from "../../testInfra/utils";
import {runFromArgs} from "../../../devTools/passwordUtils";

const testUtils = new TestUtils();
const fs = require('fs');

describe('passwordUtils', () => {
    describe('Encrypt passwords args', () => {
        it('Requires a password and a source file', () => {
            expect(() => runFromArgs(['encryptFile']))
                .to.throw(/Missing required arguments: password, file/);
        });

        it('Throws for non existent files', () => {
            expect(() => runFromArgs(['encryptFile', '--file=DoesntExist', '--password=hello']))
                .to.throw(/DoesntExist doesn't exist/);
        });
    });

    describe('Decrypt passwords args', () => {
        it('Requires a password and a source file', () => {
            expect(() => runFromArgs(['decryptFile']))
                .to.throw(/Missing required arguments: password, file/);
        });

        it('Throws for non existent files', () => {
            expect(() => runFromArgs(['decryptFile', '--file=DoesntExist', '--password=hello']))
                .to.throw(/DoesntExist doesn't exist/);
        });
    });

    describe('Encrypt/Decrypt cycle', () => {
        const sourceFile = testUtils.getTestDataFilePath('./temp/sourceFile.txt');
        const targetFile = sourceFile + '.enc';
        const content = 'Some Data';

        after(() => { try { fs.unlinkSync(targetFile); } catch (e) { } });

        it('Creates encrypted files', () => {
            fs.writeFileSync(sourceFile, content, {flag: 'w+'});
            after(() => fs.unlinkSync(sourceFile));

            runFromArgs([`encryptFile`, `--file=${sourceFile}`, `--password=hello`]);

            expect(fs.existsSync(targetFile)).to.equal(true);
            expect(fs.readFileSync(targetFile).toString()).not.to.equal(content);
        });

        it('Decrypts encrypted files', () => {
            runFromArgs([`decryptFile`, `--file=${targetFile}`, `--password=hello`]);

            expect(fs.existsSync(sourceFile)).to.equal(true);
            expect(fs.readFileSync(sourceFile).toString()).to.equal(content);
        });
    });

});