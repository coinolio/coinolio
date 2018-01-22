const redis = require('redis');
const kue = require('kue-scheduler');
const bluebird = require('bluebird');
const config = require('./config');
const errors = require('./utils/errors');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient(config.redis);
const queue = kue.createQueue({
  redis: config.redis
});

client.on('error', errors.log); // eslint-disable-line no-console

module.exports = {client, queue};
