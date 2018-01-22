const redis = require('redis');
const kue = require('kue-scheduler');
const bluebird = require('bluebird');
const errors = require('./utils/errors');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient(process.env.REDIS_URL || 'redis://redis_db:6379');
const queue = kue.createQueue({
  redis: process.env.REDIS_URL || 'redis://redis_db:6379'
});

client.on('error', errors.log); // eslint-disable-line no-console

module.exports = {client, queue};
