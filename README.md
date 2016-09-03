# sor

[![Build Status](https://travis-ci.org/anyweez/sor.svg?branch=master)](https://travis-ci.org/anyweez/sor)
[![Coverage Status](https://coveralls.io/repos/github/anyweez/sor/badge.svg?branch=master)](https://coveralls.io/github/anyweez/sor?branch=master)

Sor is a tool for checking your answers to a collection of curated programming practice problems. Pick a problem that you want to solve from [sorjs.com](https://sorjs.com), create a file with a function matching the specified name for the problem, and run:

```
sor your-file.js
```

Running the `sor` command downloads and runs a set of pre-configured tests for the problem that you specify. You'll receive output as the tests run indicating which tests pass and fail.

Note that each file can only contain a solution to a single problem.

## Installation

Sor should be installed globally; run `npm install -g sor` and you should be set. You may need to run this command with administrator privileges if you haven't [fixed npm permissions](https://docs.npmjs.com/getting-started/fixing-npm-permissions): `sudo npm install -g sor`.

## Submitting new problems

The practice problem archive is built by its community. See our [submission guidelines](https://github.com/anyweez/sorjs.com#submitting-challenges).
