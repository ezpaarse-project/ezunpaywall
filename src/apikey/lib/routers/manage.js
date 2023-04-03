const router = require('express').Router();
const joi = require('joi');

const checkAuth = require('../middlewares/auth');

const {
  redisClient,
  load,
} = require('../services/redis');

const logger = require('../logger');

const {
  createApiKey,
  updateApiKey,
  deleteApiKey,
} = require('../controllers/manage');

const {
  availableAccess,
  unpaywallAttrs,
} = require('../controllers/attributes');

/**
 * Route that get config of apikey.
 * Auth required.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following in error handler.
 *
 * @routeParams {string} apikey - Key of apikey.
 *
 * @routeResponse {Object} Apikey config.
 *
 * @return {import('express').Response} HTTP response.
 */
router.get('/keys/:apikey', async (req, res, next) => {
  const { apikey } = req.params;
  const { error } = joi.string().trim().required().validate(apikey);

  if (error) return res.status(400).json({ message: error.details[0].message });

  let key;
  try {
    key = await redisClient.get(apikey);
  } catch (err) {
    logger.error(`Cannot get key [${apikey}] on redis`);
    logger.error(err);
    return next({ message: `Cannot get key [${apikey}] on redis`, stackTrace: err });
  }

  if (!key) {
    return res.status(404).json({ message: `Key [${key}] not found` });
  }

  let config;
  try {
    config = JSON.parse(key);
  } catch (err) {
    logger.error(`Cannot parse config [${config}] of key [${key}]`);
    logger.error(err);
    return next({ message: `Cannot parse config [${config}] of key [${key}]`, stackTrace: err });
  }

  return res.status(200).json(config);
});

/**
 * Get list of all apikeys.
 * Auth required.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following in error handler.
 *
 * @routeResponse {Array<Object>} Array of apikey with key and config
 *
 * @return {import('express').Response} HTTP response.
 */
router.get('/keys', checkAuth, async (req, res, next) => {
  let keys;
  try {
    keys = await redisClient.keys('*');
  } catch (err) {
    return next({ message: 'Cannot get alls keys on redis', stackTrace: err });
  }

  if (!Array.isArray(keys)) {
    return next({ message: `${keys} is not an array` });
  }

  const allKeys = [];

  for (let i = 0; i < keys.length; i += 1) {
    const apikey = keys[i];

    let config;

    try {
      config = await redisClient.get(apikey);
    } catch (err) {
      return next({ message: `Cannot get key [${apikey}] on redis`, stackTrace: err });
    }

    try {
      config = JSON.parse(config);
    } catch (err) {
      return next({ message: `Cannot parse config [${config}]`, stackTrace: err });
    }

    allKeys.push({ apikey, config });
  }

  const sortApikey = (a, b) => {
    if (a.config?.name < b?.config.name) { return -1; }
    if (a.config?.name > b?.config.name) { return 1; }
    return 0;
  };

  allKeys.sort(sortApikey);

  return res.status(200).json(allKeys);
});

/**
 * Route that create new apikey.
 * Auth required.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following in error handler.
 *
 * @routeBody {string} name - Name of apikey.
 * @routeBody {Array<string>} attributes - Attributes names of the unpaywall attributes
 * to which the key has access.
 * Only accept attributes from ./attributes.js.
 * @routeBody {Array<string>} access - Names of the services to which the key has access.
 * Only accept graphql and enrich.
 * @routeBody {boolean} allowed - Indicates if the key is authorized or not.
 *
 * @routeResponse {Object} Key of apikey and its config.
 *
 * @return {res} HTTP response.
 */
router.post('/keys', checkAuth, async (req, res, next) => {
  const { error, value } = joi.object({
    name: joi.string().trim().required(),
    attributes: joi.array().items(joi.string().trim().valid(...unpaywallAttrs)).default(['*']),
    access: joi.array().items(joi.string().trim().valid(...availableAccess)).default(['graphql']),
    allowed: joi.boolean().default(true),
  }).validate(req?.body);

  if (error) return res.status(400).json({ message: error?.details?.[0]?.message });

  const {
    name, attributes, access, allowed,
  } = value;

  let keys;

  try {
    keys = await redisClient.keys('*');
  } catch (err) {
    logger.error(err);
    return next({ message: 'Cannot get keys [*] on redis', stackTrace: err });
  }

  for (let i = 0; i < keys.length; i += 1) {
    let config;

    try {
      config = await redisClient.get(keys[i]);
    } catch (err) {
      logger.error(err);
      return next({ message: `Cannot get key [${keys[i]}] on redis`, stackTrace: err });
    }

    try {
      config = JSON.parse(config);
    } catch (err) {
      logger.error(err);
      return next({ message: `Cannot parse config [${config}]`, stackTrace: err });
    }

    if (config.name === name) {
      return res.status(409).json(`Name [${name}] already exist for a key`);
    }
  }

  let apikey;

  try {
    apikey = await createApiKey(name, access, attributes, allowed);
  } catch (err) {
    logger.error(err);
    return next({ message: 'Cannot create apikey key', stackTrace: err });
  }

  let config;
  try {
    config = await redisClient.get(apikey);
    config = JSON.parse(config);
  } catch (err) {
    logger.error(err);
    return next({ message: `Cannot get apikey [${apikey}] on redis`, stackTrace: err });
  }

  return res.status(200).json({ apikey, config });
});

/**
 * Route that update existing apikey
 * Auth required
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following in error handler.
 *
 * @routeParams {string} Key of apikey.
 *
 * @routeBody {string} name - Name of apikey.
 * @routeBody {Array<string>} attributes - Names of the unpaywall attributes
 * to which the key has access.
 * Only accept attributes from ./attributes.js.
 * @routeBody {Array<string>} access - Names of the services to which the key has access.
 * Only accept graphql and enrich
 * @routeBody {boolean} allowed - Indicates if the key is authorized or not.
 *
 * @routeResponse {Object} Apikey config.
 *
 * @return {import('express').Response} HTTP response.
 */
router.put('/keys/:apikey', checkAuth, async (req, res, next) => {
  const checkParams = joi.string().trim().required().validate(req.params.apikey);

  if (checkParams?.error) {
    return res.status(400).json({ message: checkParams?.error?.details[0].message });
  }
  const apikey = checkParams?.value;

  const checkBody = joi.object({
    name: joi.string().trim(),
    attributes: joi.array().items(joi.string().trim().valid(...unpaywallAttrs)).default(['*']),
    access: joi.array().items(joi.string().trim().valid(...availableAccess)).default(['graphql', 'enrich']),
    allowed: joi.boolean().default(true),
  }).validate(req.body);

  if (checkBody?.error) {
    return res.status(400).json({ message: checkBody?.error?.details[0].message });
  }

  const {
    name, attributes, access, allowed,
  } = checkBody.value;

  // check if apikey exist
  let key;
  try {
    key = await redisClient.get(apikey);
  } catch (err) {
    logger.error(`Cannot get apikey [${apikey}] on redis`);
    logger.error(err);
    return next({ message: `Cannot get apikey [${apikey}] on redis`, stackTrace: err });
  }

  if (!key) {
    return res.status(404).json({ message: `Apikey [${apikey}] not found` });
  }

  // Check if name already exist
  let keys;

  try {
    keys = await redisClient.keys('*');
  } catch (err) {
    logger.error(err);
    return next({ message: 'Cannot get keys [*] on redis', stackTrace: err });
  }

  try {
    key = JSON.parse(key);
  } catch (err) {
    logger.error(err);
    return next({ message: `Cannot parse config [${key}]`, stackTrace: err });
  }

  // if name change
  if (key?.name !== name) {
    for (let i = 0; i < keys.length; i += 1) {
      let config;

      try {
        config = await redisClient.get(keys[i]);
      } catch (err) {
        logger.error(err);
        return next({ message: `Cannot get key [${keys[i]}] on redis`, stackTrace: err });
      }

      try {
        config = JSON.parse(config);
      } catch (err) {
        logger.error(err);
        return next({ message: `Cannot parse config [${config}]`, stackTrace: err });
      }

      if (config?.name === name) {
        return res.status(409).json(`Name [${name}] already exist for a key`);
      }
    }
  }

  // update
  try {
    await updateApiKey(apikey, name, access, attributes, allowed);
  } catch (err) {
    logger.error(`Cannot update apikey [${apikey}]`);
    logger.error(err);
    return next({ message: `Cannot update apikey [${apikey}]`, stackTrace: err });
  }

  // get new config of apikey
  let configApiKey;
  try {
    configApiKey = await redisClient.get(apikey);
  } catch (err) {
    logger.error(`Cannot get apikey [${apikey}] on redis`);
    logger.error(err);
    return next({ message: `Cannot get apikey [${apikey}] on redis`, stackTrace: err });
  }

  try {
    configApiKey = JSON.parse(configApiKey);
  } catch (err) {
    logger.error(`Cannot parse config [${configApiKey}]`);
    logger.error(err);
    return next({ message: `Cannot parse config [${configApiKey}]`, stackTrace: err });
  }

  const updateApikey = { apikey, ...configApiKey };

  return res.status(200).json(updateApikey);
});

/**
 * Route that delete existing apikey
 * Auth required
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following in error handler.
 *
 * @routeParams {string} Key of apikey.
 *
 * @return {import('express').Response} HTTP response.
 */
router.delete('/keys/:apikey', checkAuth, async (req, res, next) => {
  const { error, value } = joi.string().trim().required().validate(req.params.apikey);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const apikey = value;

  let key;
  try {
    key = await redisClient.get(apikey);
  } catch (err) {
    logger.error(`Cannot get [${apikey}] on redis`);
    logger.error(err);
    return next({ message: `Cannot get apikey [${apikey}] on redis`, stackTrace: err });
  }

  if (!key) {
    return res.status(404).json({ message: `Apikey: [${apikey}] not found` });
  }

  try {
    await deleteApiKey(apikey);
  } catch (err) {
    logger.error(`Cannot delete apikey [${apikey}]`);
    logger.error(err);
    return next({ message: `Cannot delete apikey [${apikey}]`, stackTrace: err });
  }

  return res.status(204).json();
});

/**
 * Route that delete all apikeys.
 * Using for test.
 * Auth required.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following in error handler.
 *
 * @return {import('express').Response} HTTP response.
 */
router.delete('/keys', checkAuth, async (req, res, next) => {
  try {
    await redisClient.flushall();
  } catch (err) {
    logger.error('Cannot delete all apikey');
    logger.error(err);
    return next({ message: 'Cannot delete all apikey', stackTrace: err });
  }
  return res.status(204).json();
});

/**
 * Route that load apikeys.
 * Using for test.
 * Auth required.
 *
 * @routeBody {Array<Object>} - Array of apikey (key + config)
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following in error handler.
 *
 * @return {import('express').Response} HTTP response.
 */
router.post('/keys/load', checkAuth, async (req, res, next) => {
  const { error, value } = joi.array().validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const loadKeys = value;

  for (let i = 0; i < loadKeys.length; i += 1) {
    const { apikey, config } = loadKeys[i];

    try {
      await redisClient.set(apikey, JSON.stringify(config));
      logger.info(`[load] ${config.name} loaded`);
    } catch (err) {
      logger.error(`Cannot load [${apikey}] with config [${JSON.stringify(config)}] on redis`);
      logger.error(err);
      return next({ message: `Cannot load [${apikey}] with config [${JSON.stringify(config)}] on redis`, stackTrace: err });
    }
  }

  return res.status(204).json();
});

/**
 * Route that load dev apikeys.
 * using for test.
 * auth required.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following in error handler.
 *
 * @return {import('express').Response} HTTP response.
 */
router.post('/keys/loadDev', checkAuth, async (req, res, next) => {
  try {
    await load();
  } catch (err) {
    logger.error('Cannot load apikeys');
    logger.error(err);
    return next({ message: 'Cannot load apikeys', stackTrace: err });
  }
  return res.status(204).json();
});

module.exports = router;
