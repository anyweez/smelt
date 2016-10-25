/**
 * Report on the outcome of the trials. This generates console output that summarizes 
 * the output of the trials to the user.
 */
const chalk = require('chalk');

const styles = {
    success_header: chalk.green.bold,
    success: chalk.green,
    meh: chalk.yellow,
    failure_header: chalk.red.bold,
    failure: chalk.red,

    fyi: chalk.yellow,
};

module.exports = function (challenge, outcome) {
    // Print overall summary
    overall(challenge, outcome);

    // Print per-trial summary
    outcome.trials.forEach(t => trial(t));

    if (outcome.report.tips.length > 0) {
        println('Tips:', { color: styles.fyi });
        outcome.report.tips.forEach(t => tip(t));
    }

    if (outcome.report.success) {
        println();
        println('Good work!', { color: styles.success })
    }
};

function tip(t) {
    println(`* ${t}`, { color: styles.fyi, indent: 1 });
}

// Print out information about a single trial.
function trial(t) {
    const args = t.args.map(arg => JSON.stringify(arg));

    if (t.outcome) {  // success: print short form
        println(`\u2714  ${t.parent.fn.name}(${args}) => ${JSON.stringify(t.expected)}`, { color: styles.success_header });
    } else {          // fail: print long form
        println(`\u2718  ${t.parent.fn.name}(${args})`, { color: styles.failure_header });
        println(`Expected: ${JSON.stringify(t.expected)}`, { color: styles.failure, indent: 1 });
        println(`Produced: ${JSON.stringify(t.produced)}`, { color: styles.failure, indent: 1 });
        println();
    }
}

// Print out overall outcome info.
function overall(challenge, outcome) {
    const percentage = outcome.report.passed / outcome.report.attempted;
    let color = undefined;

    if (percentage < 0.5) color = styles.failure;
    else if (percentage < 1.0) color = styles.meh;
    else color = styles.success;

    println(`** Progress: ${outcome.report.passed} / ${outcome.report.attempted} passed (${Math.round(percentage * 1000) / 10}%) **`, { color });
    println();
}

// Generic print function that handles some styling stuff.
function println(content = '', {color, indent} = {}) {
    if (color === undefined) color = chalk.white;
    if (indent === undefined) indent = 0;

    console.log(color(new Array(indent).fill('    ').join('') + content));
}