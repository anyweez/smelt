import test from 'ava';

const sorutil = require('../sorutil')({
    // The base URL for requests for challenges
    baseUrl: 'https://sorjs.com/challenges',
    // The file that the tests should be run on.
    sorFile: 'sor.target.js',
    // The tests that should be run on the sorFile (downloaded from baseUrl)
    testsFile: 'sor.tests.js',
});

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

test.serial('runs successfully end-to-end', t => {
    return sorutil.generateFrom('sample/changemaker.js', available)
        .then(sorutil.runTests.bind(sorutil))
        .then(() => {
            sorutil._cleanup();
            t.pass();
        })
        .catch(error => {
            sorutil._cleanup();
            t.fail();
        });
});