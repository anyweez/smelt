#!/usr/bin/env node

const fs = require('mz/fs');
const process = require('process');
const request = require('request-promise');
let jshint = require('jshint').JSHINT;
const spawn = require('child_process').spawn;

if (process.argv.length !== 3) throw Error('You must provide a filename.');

// Temporary variables for local testing...need to make this a bit more fluid later.
//const REMOTE_CHALLENGES_LIST_URL = 'http://localhost:3000/challenges.json';
//const REMOTE_CHALLENGES_BASE = 'http://localhost:3000/challenges';
const REMOTE_CHALLENGES_LIST_URL = 'https://sorjs.com/challenges.json';
const REMOTE_CHALLENGES_BASE = 'https://sorjs.com/challenges';
const TARGET_FILE = process.argv[2];
const SOR_FILE = 'sor.target.js';
const TESTS_FILE = 'sor.tests.js';

/**
 * 1. Get list of all available tests from server (test names).
 * 2. Statically analyze use code to find matching function names.
 * 3. Export the matching method. Error if zero or more than one matches.
 * 4. Download tests, import exported function, and run tests.
 * 5. Cleanup (delete sor target, test file)
 */

function cleanup() {
    fs.unlink(SOR_FILE);
    fs.unlink(TESTS_FILE);
}

function testUrlBuilder(name) {
    return `${REMOTE_CHALLENGES_BASE}/${name}.js`
}

// 1: get available tests.
request(REMOTE_CHALLENGES_LIST_URL)
    .then(response => {
        let available = JSON.parse(response).available;
        let challenge = null;

        return fs.readFile(TARGET_FILE)
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

                if (funcs.length !== 1) {
                    throw Error(`Must only have one testable function per file; this one has ${funcs.length}`);
                }

                challenge = available.find(prob => prob.func === funcs[0].name);
                challenge.line = funcs[0].line;
                
                console.log(challenge.title.toUpperCase());
                console.log(challenge.description.short);
                console.log();

                // 3
                let lines = code.split('\n');
                lines[challenge.line] = 'module.exports = ' + lines[challenge.line];
                return fs.writeFile(SOR_FILE, lines.join('\n'), { encoding: 'utf8' });
            })
            .then(() => {
                return request(testUrlBuilder(challenge.func))
                    .then(tests => {
                        fs.writeFile(TESTS_FILE, tests, { encoding: 'utf8' });
                    });
            })
            .then(() => {
                // 4
                let env = process.env;
                env.SOR_RUNNER_DIR = `${__dirname}/node_modules/ava`;

                let tester = spawn(
                    `${__dirname}/node_modules/.bin/ava`,
                    ['--verbose', `${process.cwd()}/${TESTS_FILE}`],
		    // TODO: Should pass cwd instead of env once this bug is fixed: 
		    // https://github.com/avajs/ava/issues/32
                    { env: env }
                );

                tester.stderr.setEncoding('utf8');
                tester.stderr.on('data', data => {
                    if (data.trim().length > 0) console.log(data);
                });
                tester.on('close', code => {
                    if (code === 0) console.log('Successfully ran all tests!');
                    else console.error('Error encountered on at least one test.');

                    cleanup();
                });
            });
    });
