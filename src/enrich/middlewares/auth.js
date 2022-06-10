const fs = require('fs-extra');
const path = require('path');

const boom = require('@hapi/boom');
const { redisClient } = require('../service/redis');

const logger = require('../lib/logger');

const enrichedDir = path.resolve(__dirname, '..', 'out', 'enriched');
const stateDir = path.resolve(__dirname, '..', 'out', 'states');
const uploadedDir = path.resolve(__dirname, '..', 'out', 'uploaded');

/**
 * check the user's api key
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {function} next - do the following
 * @returns {Object|function} res or next
 */
const checkAuth = async (req, res, next) => {
  // TODO check in query
  const apikey = req.get('x-api-key');

  if (!apikey) {
    return res.status(401).json(boom.unauthorized('Not Authorized'));
  }

  let key;
  try {
    key = await redisClient.get(apikey);
  } catch (err) {
    logger.error(`Cannot get ${apikey} on redis`);
    logger.error(err);
    return next(boom.boomify(err));
  }

  let config;

  try {
    config = JSON.parse(key);
  } catch (err) {
    logger.error(`Cannot parse ${key}`);
    logger.error(err);
    return next(boom.boomify(err));
  }

  if (!Array.isArray(config?.access) || !config?.access?.includes('enrich') || !config?.allowed) {
    return res.status(401).json(boom.unauthorized('Not Authorized'));
  }

  let { args } = req.body;

  if (!config.attributes?.includes('*')) {
    if (!args) {
      return res.status(401).json(boom.unauthorized('Not Authorized'));
    }
    let error = false;
    const errors = [];
    args = args.substr(1);
    args = args.substring(0, args.length - 1);
    args = args.replace(/{/g, '.');
    args = args.replace(/}/g, '');
    args = args.replace(/ /g, '');
    args = args.split(',');

    args.forEach((attribute) => {
      if (!config?.attributes?.includes(attribute)) {
        error = true;
        errors.push(attribute);
      }
    });
    if (error) {
      return res.status(401).json(boom.unauthorized(`You don't have access to "${errors.join(',')}" attribute(s)`));
    }
  }

  try {
    if (!await fs.stat(path.resolve(enrichedDir, apikey))) {
      await fs.mkdir(path.resolve(enrichedDir, apikey));
    }
    if (!await fs.stat(path.resolve(stateDir, apikey))) {
      await fs.mkdir(path.resolve(stateDir, apikey));
    }
    if (!await fs.stat(path.resolve(uploadedDir, apikey))) {
      await fs.mkdir(path.resolve(uploadedDir, apikey));
    }
  } catch (err) {
    logger.error(`Cannot create dir ${key}`);
    logger.error(err);
  }

  return next();
};

module.exports = checkAuth;
