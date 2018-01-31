const redis = require('redis');
const kue = require('kue-scheduler');
const bluebird = require('bluebird');
const config = require('./config');
const errors = require('./utils/errors');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient({
  redis: config.redis,
  prefix: 'coinolio:'
});
const queue = kue.createQueue({
  redis: config.redis,
  prefix: 'coinolio-queue'
});

client.on('error', errors.log); // eslint-disable-line no-console
queue.on('schedule error', errors.log); // eslint-disable-line no-console
// queue.on('already scheduled', errors.log); // eslint-disable-line no-console
// queue.on('lock error', errors.log); // eslint-disable-line no-console

module.exports = {client, queue};
