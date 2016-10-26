const fs = require('mz/fs');
const process = require('process');
const jshint = require('jshint').JSHINT;
const spawn = require('child_process').spawn;
const request = require('request-promise');
const errors = require('./sorerrors');

const rfr = require('rfr/lib/constants');

const report = require('./mentor/reporter');
const chalk = require('chalk');

module.exports = function (config) {
    process.env.SOR_MENTOR_PATH = `${rfr.defaultRoot}/mentor`;

    // TODO: this should respect the --remote setting
    const CONFIRM_URL = `${config.baseUrl}/attempt?`;

    return {
        /**
         * Remove all files created by other sorutil operations if they exist.
         */
        _cleanup() {
            fs.unlink(config.sorFile);
            fs.unlink(config.testsFile);
        },

        buildUrl(challenge) {
            return `${config.baseUrl}/challenges/${challenge}.js`
        },

        _showChallenge(challenge) {
            console.log(chalk.white.bold(challenge.title.toUpperCase()));
            console.log(chalk.white(challenge.description.short));
            console.log();
        },

        /**
         * Given the provided path, generate the sorfile and download the approriate
         * test file based on what function is found in the sorfile. Both files should
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
                            fs.writeFileSync(config.testsFile, tests, { encoding: 'utf8' });
                            return challenge;
                        });
                });
        }, // end generateFrom

        /** 
         * Run tests on the sorfle, report results, and clean up the test file and sorfile. This function 
         * assumes that both the sorfile and testfile exist.
         */
        runTests(challenge) {
            /**
             * Require this file dynamically. Note that this is hard (impossible?) to do with ES6
             * modules so when the time is right to transition this part will take some refactoring.
             */
            const outcome = require(config.testsFile);
            report(challenge, outcome);

            // Send a ping to the sorjs server indicating whether the attempt was successful or not.
            request({
                url: CONFIRM_URL + `challenge=${challenge.func}&success=${outcome.report.success ? 1 : 0}`,
                headers: { 'User-Agent': 'SorClient' }
            }).then(() => process.exit(0));
        }, // end run
    };
};
