/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'jsdom',
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverageFrom: ['assets/js/**/*.js'],
};
