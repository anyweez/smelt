
/**
 * Create a test, which evaluates a single function. The test is a container for 
 * a bunch of trials, each which evaluates the output of a function based on a 
 * set of inputs.
 * 
 * Running the test produces a report, which can be used by the reporter for
 * outputting to the screen and the core application for logging, etc.
 */

const eq = require('lodash').isEqual;
const clone = require('lodash').cloneDeep;

function Test(fn) {
    const self = this;

    this.fn = fn;
    this.trials = [];

    this.report = {
        get success() { return self.trials.find(trial => trial.outcome === false) === undefined },
        get attempted() { return self.trials.filter(trial => trial.outcome !== undefined).length },
        get passed() { return self.trials.filter(trial => trial.outcome).length },
        get failed() { return self.trials.filter(trial => !trial.outcome).length },
        get tips() { return [].concat(...self.trials.filter(trial => !trial.outcome).map(trial => trial.tips)) },
    };

    return this;
}

Test.prototype.trial = function (...args) {
    return new Trial(this, args);
};

function Trial(test, args) {
    this.parent = test;
    this.args = args;

    this.parent.trials.push(this);

    // Raw outcome information.
    this.outcome = undefined;   // todo: make this a getter, get rid of _run?
    this.expected = undefined;  // expected outcome
    this.produced = undefined;  // produced outcome

    this.tips = [];

    return this;
}

Trial.prototype.produces = function (expected) { return this._run(expected) };
Trial.prototype.otherwise = function (msg) { 
    this.tips.push(msg); 
    return this; 
};

Trial.prototype._run = function (expected) {
    this.expected = expected;
    // Clone arguments so that they're effectively immutable from sor's POV.
    this.produced = this.parent.fn.call(null, ...clone(this.args));
    this.outcome = eq(this.expected, this.produced);

    return this;
};

module.exports = {
    test(fn) { return new Test(fn); }
};