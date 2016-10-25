#!/usr/bin/env node

/**
 * Returns zero if the application runs successfully AND all tests pass. 
 * Returns one if the application runs successfully but at least one test fails. 
 * Returns a number >= 100 if an error occured during execution.
 */

const process = require('process');
const commander = require('commander');
const request = require('request-promise');

commander
    .option('-r, --remote <url>', 'The server to retrieve challenges from')
    .parse(process.argv);

const REMOTE_CHALLENGE_URL = commander.remote || 'https://sorjs.com';

if (commander.args.length !== 1) {
    console.error('You must provide a filename.');
    return 100;
}

/**
 * Initialize sorutils with configuration values. Sorutils is where the core
 * of the application actually lives.
 */
const sorutil = require('./sorutil')({
    // The base URL for requests for challenges
    baseUrl: REMOTE_CHALLENGE_URL,
    // The file that the tests should be run on.
    sorFile: `${process.cwd()}/sor.target.js`,
    // The tests that should be run on the sorFile (downloaded from baseUrl)
    testsFile: `${process.cwd()}/sor.tests.js`,
});

// The URL to grab the list of available tests from.
const REMOTE_CHALLENGES_LIST_URL = `${REMOTE_CHALLENGE_URL}/challenges.json`;
const TARGET_FILE = process.argv[2];

/**
 * 1. Get list of all available tests from server (test names).
 * 2. Statically analyze use code to find matching function names.
 * 3. Export the matching method. Error if zero or more than one matches.
 * 4. Download tests, import exported function, and run tests.
 * 5. Cleanup (delete sor target, test file)
 */

// 1: get available tests.
request({ url: REMOTE_CHALLENGES_LIST_URL, headers: { 'User-Agent': 'SorClient' } })
    .then(response => {
        let available = JSON.parse(response).available;

        return sorutil.generateFrom(TARGET_FILE, available)
            .then(sorutil.runTests.bind(sorutil))
            .then(() => sorutil._cleanup())
            .catch(error => {
                console.error(`${error.type || 'Unknown error'}: ${error.message}`);
                console.log(error.stack);

                sorutil._cleanup();
                process.exit(error.code || 1);
            });
    });