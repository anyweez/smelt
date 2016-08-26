#!/usr/bin/env node

const request = require('request-promise');

if (process.argv.length !== 3) throw Error('You must provide a filename.');

/**
 * Initialize sorutils with configuration values. Sorutils is where the core
 * of the application actually lives.
 */
const sorutil = require('./sorutil')({
    // The base URL for requests for challenges
    baseUrl: 'https://sorjs.com/challenges',
    // The file that the tests should be run on.
    sorFile: 'sor.target.js',
    // The tests that should be run on the sorFile (downloaded from baseUrl)
    testsFile: 'sor.tests.js',
});

// Temporary variables for local testing...need to make this a bit more fluid later.
//const REMOTE_CHALLENGES_LIST_URL = 'http://localhost:3000/challenges.json';
//const REMOTE_CHALLENGES_BASE = 'http://localhost:3000/challenges';
const REMOTE_CHALLENGES_LIST_URL = 'https://sorjs.com/challenges.json';
const TARGET_FILE = process.argv[2];

/**
 * 1. Get list of all available tests from server (test names).
 * 2. Statically analyze use code to find matching function names.
 * 3. Export the matching method. Error if zero or more than one matches.
 * 4. Download tests, import exported function, and run tests.
 * 5. Cleanup (delete sor target, test file)
 */

// 1: get available tests.
request(REMOTE_CHALLENGES_LIST_URL)
    .then(response => {
        let available = JSON.parse(response).available;

        return sorutil.generateFrom(TARGET_FILE, available)
            .then(sorutil.runTests.bind(sorutil))
            .catch(error => console.error(`${error.type}: ${error.message}`));
    });