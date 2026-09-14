/**
 * Must be imported FIRST by the test entry point.
 *
 * ES module imports are evaluated before the importing module's own statements
 * run, so test configuration cannot be assigned inline at the top of the test
 * file - it has to live in a module that is imported ahead of the app.
 */
process.env.NODE_ENV = 'test';
process.env.USE_IN_MEMORY_DB = 'true';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key_for_automated_tests_only';
process.env.MONGODB_URI = '';
