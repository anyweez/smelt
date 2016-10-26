# sor

[![Build Status](https://travis-ci.org/anyweez/sor.svg?branch=master)](https://travis-ci.org/anyweez/sor)
[![Coverage Status](https://coveralls.io/repos/github/anyweez/sor/badge.svg?branch=master)](https://coveralls.io/github/anyweez/sor?branch=master)
[![Chat on Gitter](https://badges.gitter.im/anyweez/sor.png)](https://gitter.im/sorjs/Lobby)

Sor is a tool for checking your answers to a collection of curated programming practice challenges. Pick a problem that you want to solve from [sorjs.com](https://sorjs.com), create a file with a function matching the specified name for the problem, and run:

```
sor your-file.js
```

Running the `sor` command downloads and runs a set of pre-configured tests for the problem that you specify. You'll receive output as the tests run indicating which tests pass and fail.

Note that each file can only contain a solution to a single problem.

## Installation

Sor should be installed globally; run `npm install -g sor` and you should be set. You may need to run this command with administrator privileges if you haven't [fixed npm permissions](https://docs.npmjs.com/getting-started/fixing-npm-permissions): `sudo npm install -g sor`.

## Submitting new problems

The practice problem archive is built by its community. See our [submission guidelines](https://github.com/anyweez/sorjs.com#submitting-challenges).

## Mentor testing framework

Mentor is a simple framework for testing and providing feedback for function execution; it's similar in some ways to unit testing frameworks but is *dramatically* simplified and has some additional features that are targeted at providing more meaningful feedback in the context of practicing. You can see lots of examples of Mentor tests in the [sorjs.com repository](https://github.com/anyweez/sorjs.com/tree/master/challenges).

Mentor breaks tests into individual trials; reports are avaialble overall for tests and individually for each trial. There are two ways to test outcomes: `produces()` to test return values, or `examine()` to test more complex behaviors. You can provide feedback in the case of trial failure
using the `otherwise()` function.

```javascript
// If you're writing challenge tests for sorjs, make sure to use the SOR_MENTOR_PATH env variable
// instead of a local path. See other examples in the sorjs.com repository.
const runner = require('sor/mentor/runner');

// Example function
const add = (x, y) => x + y;

// Create a new test which will be composed of multiple trials. All trials will be targeted at the 
// add function. If we want to test another function, we should create another test.
const test = runner.test(add);

// Create a trial to test whether add(4, 5) gives us 9
test.trial(4, 5).produces(9); 
// Create a trial testing that add(-2, 3) === 1, and provide a tip if not
test.trial(-2, 3).produces(1).otherwise('Beware negative numbers!');

// Create a trial testing that add(6, 1) produces an odd number. Will evaluate to
// a success if the first and second argument to outcome() are the equivalent, or a failure otherwise.
test.trial(6, 1)
    .examine(fn => runner.outcome('odd number', fn() % 2 === 1 ? 'odd number' : 'even number'));

test.trial(0, 0)
    .examine(fn => runner.outcome('odd number', fn() % 2 === 1 ? 'odd number' : 'even number'))
    .otherwise('Do you properly handle zero?');
```