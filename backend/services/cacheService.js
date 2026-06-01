const NodeCache = require('node-cache');
const { pool } = require('../config/db');

// Cache configuration:
// stdTTL: Default time-to-live is 1 hour (3600 seconds)
// checkperiod: Delete expired items every 10 minutes
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

module.exports = {
    cache
};
