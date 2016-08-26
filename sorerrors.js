module.exports = {
    /**
     * Thrown when the incorrect number of functions are found in an input test. Only one
     * function is supported per file.
     */
    IncorrectFunctionCount({ count }) {
        return {
            type: 'Too many functions',
            message: `must have exactly one testable function per file; this one has ${count}.`,
            code: 101,
        }
    },
};