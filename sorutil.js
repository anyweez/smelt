const fs = require('mz/fs');
const process = require('process');
const jshint = require('jshint').JSHINT;
const spawn = require('child_process').spawn;
const request = require('request-promise');
const errors = require('./sorerrors');

// TODO: this should respect the --remote setting
const CONFIRM_URL = 'https://sorjs.com/attempt?';

module.exports = function (config) {
    return {
        /**
         * Remove all files created by other sorutil operations if they exist.
         */
        _cleanup() {
            fs.unlink(config.sorFile);
            fs.unlink(config.testsFile);
        },

        buildUrl(challenge) {
            return `${config.baseUrl}/${challenge}.js`
        },

        _showChallenge(challenge) {
            console.log(challenge.title.toUpperCase());
            console.log(challenge.description.short);
            console.log();
        },

        /**
         * Given the provided path, generate the sorfile and download the approriate
         * test file based on what function is found in the sorFile. Both files should
         * exist when the promise returned by this function completes.
         * 
         * `available` is the array of problems available from the server.
         */
        generateFrom(target, available) {
            let challenge = null;

            return fs.readFile(target)
                .catch(() => { throw errors.InvalidChallengeFile() })
                .then(content => {
                    let code = content.toString('utf8');

                    // 2: statically analyze code
                    jshint(code, {}, {});

                    let funcs = jshint.data().functions.map(f => {
                        return {
                            name: f.name,
                            line: f.line - 1
                        };
                    }).filter(f => available.map(a => a.func).indexOf(f.name) >= 0);

                    if (funcs.length !== 1) throw errors.IncorrectFunctionCount({ count: funcs.length });

                    // Find the challenge that matches (if any)
                    challenge = available.find(prob => prob.func === funcs[0].name);
                    challenge.line = funcs[0].line;

                    this._showChallenge(challenge);

                    // 3: output sorfile
                    let lines = code.split('\n');
                    lines[challenge.line] = `module.exports = ${lines[challenge.line]}`;
                    return fs.writeFile(config.sorFile, lines.join('\n'), { encoding: 'utf8' })
                        .then(() => challenge);
                })
                .then(challenge => {
                    return request({ url: this.buildUrl(challenge.func), headers: { 'User-Agent': 'SorClient' } })
                        .then(tests => {
                            fs.writeFile(config.testsFile, tests, { encoding: 'utf8' });
                            return challenge;
                        });
                });
        }, // end generateFrom

        /** 
         * Run tests on the sorfle, report results, and clean up the test file and sorfile. This function 
         * assumes that both the sorfile and testfile exist.
         */
        runTests(challenge) {
            // 4
            process.env.SOR_RUNNER_DIR = `${__dirname}/node_modules/ava`;

            let tester = spawn(
                `${__dirname}/node_modules/.bin/ava`,
                ['--verbose', `${process.cwd()}/${config.testsFile}`],
                // TODO: Should pass cwd instead of env once this bug is fixed: 
                // https://github.com/avajs/ava/issues/32
                { env: process.env }
            );

            tester.stderr.setEncoding('utf8');
            tester.stderr.on('data', data => {
                if (data.trim().length > 0) console.log(data.trim());
            });

            tester.on('close', code => {
                console.log();
                this._cleanup();

                if (code === 0) {
                    console.log('Successfully ran all tests!');
                    request({ url: CONFIRM_URL + `challenge=${challenge.func}&success=1`, headers: { 'User-Agent': 'SorClient' } })
                        .then(() => process.exit(0));
                }
                else {
                    console.error('Error encountered on at least one test.');
                    request({ url: CONFIRM_URL + `challenge=${challenge.func}&success=0`, headers: { 'User-Agent': 'SorClient' } })
                        .then(() => process.exit(1));
                }
            });
        }, // end run
    };
};