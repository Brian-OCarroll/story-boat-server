'use strict';
// exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/jwt-auth-demo';
// exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/jwt-auth-demo';
// exports.PORT = process.env.PORT || 8080;
// exports.JWT_SECRET = process.env.JWT_SECRET;
// exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';


require('dotenv').config();

// module.exports = {
//   PORT: process.env.PORT || 8080,
//   CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
//   MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost/hyperloop',
//   TEST_DATABASE_URL:
//     process.env.TEST_DATABASE_URL || 'mongodb://localhost/hyperloop',
//   JWT_SECRET: process.env.JWT_SECRET,
//   JWT_EXPIRY: process.env.JWT_EXPIRY || 15 * 60 * 1000,
//   MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost/hyperloop',
//   TEST_MONGODB_URI:
//     process.env.TEST_MONGODB_URI || 'mongodb://localhost/hyperloop-test'
// };

exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/storyboat';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/storyboat-test';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';