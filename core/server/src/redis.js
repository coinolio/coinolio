const redis = require('redis');
const bluebird = require('bluebird');
const errors = require('./utils/errors');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient(process.env.REDIS_URL);

client.on('error', errors.log); // eslint-disable-line no-console

module.exports = client;
