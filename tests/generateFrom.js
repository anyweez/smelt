import test from 'ava';

const config = {
    // The base URL for requests for challenges
    baseUrl: 'http://localhost:3000',
    // The file that the tests should be run on.
    sorFile: `${process.cwd()}/_sor.target.js`,
    // The tests that should be run on the sorFile (downloaded from baseUrl)
    testsFile: `${process.cwd()}/_sor.tests.js`,
};

const fs = require('fs');
const sorutil = require('../sorutil')(config);

const available = [
    {
        title: "Blackjacked",
        func: "blackjack",
        description: {
            short: "Determine whether a blackjack hand busts or not",
            full: "[Blackjack](https://en.wikipedia.org/wiki/Blackjack) is a card game where the goal is to get as close to 21 points without going over.  Face cards count as ten points, numbered cards are worth the value shown on their face, and aces can be worth either one or eleven (player's choice). Players 'bust' when they exceed 21 points, and lose the hand. Write a function that returns true when the provided deck busts (totals more than 21) and false when it doesn't."
        }
    },
    {
        title: "Changemaker",
        func: "changemaker",
        description: {
            short: "Break the specified amount of money into standard bills.",
            full: "Imagine we have a very versatile change machine. Create a variable called amount stores a quantity of dollars, and write some code that produces an array that indicates the number of 1, 5, 10, and 20 bills that the change machine should return. You want the change machine to return the smallest number of bills possible."
        }
    }
];

/**
 * Tests to ensure that sor.tests.js and sor.target.js are both generated. This test will
 * also fail if generateFrom() (well jshint really) can't parse the input file. It does 
 * not explicitly test the contents of both files to ensure they're valid Javascript.
 * 
 * This test requires an internet connection in order to fetch the contents of 
 * sor.tests.js.
 */
test.serial('can load valid challenge files and generate outputs', t => {
    return sorutil.generateFrom('sample/changemaker.js', available).then(() => {
        // Test to ensure the expected files exist.
        return Promise.all([
            new Promise(resolve => fs.stat(config.testsFile, err => resolve(t.is(err, null)))),
            new Promise(resolve => fs.stat(config.sorFile, err => resolve(t.is(err, null)))),
        ]);
    }).then(() => sorutil._cleanup());
});

/**
 * Test to ensure that we're able to catch issues loading files that don't exist.
 */
test.serial('fails gracefully for missing challenge files', t => {
    return sorutil.generateFrom('sample/__nay.js', available)
        .then(() => {
            sorutil._cleanup();
            t.fail();
        })
        .catch(err => t.true(err.code === 102));
});

/**
 * Test to ensure that existing but invalid files lead to catchable errors.
 */
test.serial('fails gracefully for invalid challenge files', t => {
    return sorutil.generateFrom('sample/failfile.js', available)
        .then(() => {
            sorutil._cleanup();
            t.fail();
        })
        .catch(err => t.true(err.code && 101 && err.count === 0));
});