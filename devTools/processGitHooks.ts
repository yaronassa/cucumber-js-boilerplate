

const {execSync} = require('child_process');

class GITHooksProcessor {
    public async runFromArgs() {
        const hook = require('yargs').argv.hook as string;
        return this.processGitHook(hook);
    }

    public async processGitHook(hookName: string) {

        switch (hookName) {
            case 'preCommit':
                return this.processPreCommit();

            default:
                throw new Error(`Unknown hook: ${hookName}`);
        }
    }

    private async processPreCommit() {
        const forbiddenFilesMatchers = [/^passwords\/decrypted\//, /passwords\/keys\//];
        const files: string[] = execSync('git diff --cached --name-only').toString().split('\n');

        const forbiddenFiles = files.filter(file => forbiddenFilesMatchers.some(matcher => matcher.test(file)));

        if (forbiddenFiles.length > 0) throw new Error(`Commit includes forbidden files: ${forbiddenFiles.join(', ')}`);

        const lintFiles = files.filter(file => file.endsWith('.ts'));

        if (lintFiles.length > 0) execSync(`./node_modules/.bin/tslint ${lintFiles.join(' ')}`);

    }
}

export {GITHooksProcessor};

if (require.main === module) {
    const processor = new GITHooksProcessor();
    processor.runFromArgs()
        .then(() => {
            console.log('Git hook processed');
            process.exit(0);
        })
        .catch(e => {
            console.error(`Error processing git hook : ${e.message}`);
            process.exit(1);
        });
}
