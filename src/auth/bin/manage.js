const crypto = require('crypto');
const redis = require('redis');
const redisClient = require('../lib/redis');

const createAuth = async (name, access, attributes, allowed) => {
  const currentDate = (new Date()).valueOf().toString();
  const random = Math.random().toString();
  const hash = crypto.createHash('sha256').update(`${currentDate}${random}`).digest('hex');
  const id = hash;
  const config = {
    name,
    access,
    attributes,
    allowed,
  };

  await redisClient.set(id, `${JSON.stringify(config)}`, redis.print);
  return id;
};

const updateAuth = async (id, name, access, attributes, allowed) => {
  const config = {
    name,
    access,
    attributes,
    allowed,
  };

  await redisClient.set(id, `${JSON.stringify(config)}`, redis.print);
  return id;
};

const deleteAuth = async (id) => {
  await redisClient.del(id, redis.print);
  return id;
};

module.exports = {
  createAuth,
  updateAuth,
  deleteAuth,
};
