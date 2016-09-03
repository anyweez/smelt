module.exports = {
    InvalidChallengeFile() {
        return {
            type: 'File doesn\'t exist',
            message: `must specify a valid test file`,
            code: 102
        };
    },
    
    /**
     * Thrown when the incorrect number of functions are found in an input test. Only one
     * function is supported per file.
     */
    IncorrectFunctionCount({ count }) {
        return {
            type: 'Too many functions',
            message: `must have exactly one testable function per file; this one has ${count}.`,
            code: 101,
            count: count,
        };
    },
};