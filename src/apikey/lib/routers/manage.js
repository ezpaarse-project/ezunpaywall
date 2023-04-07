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
 * Get config of apikey entered in parameter
 */
router.get('/keys/:apikey', async (req, res, next) => {
  const { apikey } = req.params;

  const { error } = joi.string().trim().required().validate(apikey);

  if (error) return res.status(400).json({ message: error.details[0].message });

  let apikeyConfig;
  try {
    apikeyConfig = await redisClient.get(apikey);
  } catch (err) {
    const message = `Cannot get config for apikey [${apikey}]`;
    logger.error(`[redis] ${message}`, err);
    return next({ message });
  }

  if (!apikeyConfig) {
    logger.error(`[redis] config [${apikeyConfig}] for [${apikey}] not found`);
    return res.status(404).json({ message: `config [${apikeyConfig}] for [${apikey}] not found` });
  }

  try {
    apikeyConfig = JSON.parse(apikeyConfig);
  } catch (err) {
    logger.error(`[redis] Cannot parse config [${apikeyConfig}] of apikey [${apikeyConfig}]`, err);
    return next({ message: `Cannot parse config [${apikeyConfig}] of apikey [${apikeyConfig}]` });
  }

  return res.status(200).json(apikeyConfig);
});

/**
 * Get list of all apikeys
 */
router.get('/keys', checkAuth, async (req, res, next) => {
  let keys;
  try {
    keys = await redisClient.keys('*');
  } catch (err) {
    logger.error('[redis] Cannot get all keys on redis', err);
    return next({ message: 'Cannot get all keys on redis' });
  }

  if (!Array.isArray(keys)) {
    logger.error(`[redis] [${keys}] is not an array`);
    return next({ message: `[${keys}] is not an array` });
  }

  const allKeys = [];

  for (let i = 0; i < keys.length; i += 1) {
    const apikey = keys[i];

    let config;

    try {
      config = await redisClient.get(apikey);
    } catch (err) {
      logger.error(`[redis] Cannot get key [${apikey}]`, err);
      return next({ message: `Cannot get key [${apikey}]` });
    }

    try {
      config = JSON.parse(config);
    } catch (err) {
      logger.error(`[redis] Cannot parse config [${config}]`, err);
      return next({ message: `Cannot parse config [${config}]` });
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
 * Create new apikey with config in body
 */
router.post('/keys', checkAuth, async (req, res, next) => {
  const { error, value: apikeyConfig } = joi.object({
    name: joi.string().trim().required(),
    attributes: joi.array().items(joi.string().trim().valid(...unpaywallAttrs)).default(['*']),
    access: joi.array().items(joi.string().trim().valid(...availableAccess)).default(['graphql']),
    owner: joi.string().trim().optional().allow(''),
    description: joi.string().trim().optional().allow(''),
    allowed: joi.boolean().default(true),
  }).validate(req?.body);

  if (error) return res.status(400).json({ message: error?.details?.[0]?.message });

  const {
    name, attributes, access, owner, description, allowed,
  } = apikeyConfig;

  let keys;

  try {
    keys = await redisClient.keys('*');
  } catch (err) {
    logger.error('[redis] Cannot get all keys', err);
    return next({ message: 'Cannot get all keys' });
  }

  for (let i = 0; i < keys.length; i += 1) {
    let config;

    try {
      config = await redisClient.get(keys[i]);
    } catch (err) {
      logger.error(`[redis] Cannot get key [${keys[i]}]`, err);
      return next({ message: `Cannot get key [${keys[i]}]` });
    }

    try {
      config = JSON.parse(config);
    } catch (err) {
      logger.error(`[redis] Cannot parse config [${config}]`, err);
      return next({ message: `Cannot parse config [${config}]` });
    }

    if (config.name === name) {
      return res.status(409).json(`Name [${name}] already exist for a key`);
    }
  }

  let apikey;

  try {
    apikey = await createApiKey(apikeyConfig);
  } catch (err) {
    logger.error(`[apikey] Cannot create apikey with config [${{
      name, access, attributes, owner, description, allowed,
    }}]`, err);
    return next({ message: 'Cannot create apikey key' });
  }

  let config;
  try {
    config = await redisClient.get(apikey);
    config = JSON.parse(config);
  } catch (err) {
    logger.error(`[redis] Cannot get key [${apikey}]`, err);
    return next({ message: `Cannot get apikey [${apikey}]` });
  }

  return res.status(200).json({ apikey, config });
});

/**
 * Update apikey entered in parameter with new config in body
 */
router.put('/keys/:apikey', checkAuth, async (req, res, next) => {
  const checkParams = joi.string().trim().required().validate(req.params.apikey);

  if (checkParams?.error) {
    return res.status(400).json({ message: checkParams?.error?.details[0].message });
  }
  const apikey = checkParams?.value;

  const { error, value: apikeyConfig } = joi.object({
    name: joi.string().trim(),
    attributes: joi.array().items(joi.string().trim().valid(...unpaywallAttrs)).default(['*']),
    access: joi.array().items(joi.string().trim().valid(...availableAccess)).default(['graphql', 'enrich']),
    owner: joi.string().trim().optional().allow(''),
    description: joi.string().trim().optional().allow(''),
    allowed: joi.boolean().default(true),
  }).validate(req.body);

  if (error) {
    return res.status(400).json({ message: error?.details[0].message });
  }

  const { name } = apikeyConfig;

  // check if apikey exist
  let configApikey;
  try {
    configApikey = await redisClient.get(apikey);
  } catch (err) {
    logger.error(`[redis] Cannot get apikey [${apikey}]`, err);
    return next({ message: `Cannot get apikey [${apikey}]` });
  }

  if (!configApikey) {
    return res.status(404).json({ message: `Apikey [${apikey}] not found` });
  }

  // Check if name already exist
  let keys;

  try {
    keys = await redisClient.keys('*');
  } catch (err) {
    logger.error('[redis] Cannot get all keys', err);
    return next({ message: 'Cannot get all keys' });
  }

  try {
    configApikey = JSON.parse(configApikey);
  } catch (err) {
    logger.error(`[redis] Cannot parse config [${configApikey}]`, err);
    return next({ message: `Cannot parse config [${configApikey}]` });
  }

  // if name change
  if (configApikey?.name !== name) {
    for (let i = 0; i < keys.length; i += 1) {
      let config;

      try {
        config = await redisClient.get(keys[i]);
      } catch (err) {
        logger.error(`[redis] Cannot get apikey [${keys[i]}]`, err);
        return next({ message: `Cannot get key [${keys[i]}] on redis` });
      }

      try {
        config = JSON.parse(config);
      } catch (err) {
        logger.error(`[router] Cannot parse config [${config}]`, err);
        return next({ message: `Cannot parse config [${config}]` });
      }

      if (config?.name === name) {
        return res.status(409).json(`Name [${name}] already exist for a key`);
      }
    }
  }

  // update
  try {
    await updateApiKey(apikey, apikeyConfig);
  } catch (err) {
    logger.error(`[router] Cannot update apikey [${apikey}]`, err);
    return next({ message: `Cannot update apikey [${apikey}]` });
  }

  // get new config of apikey
  let configApiKey;
  try {
    configApiKey = await redisClient.get(apikey);
  } catch (err) {
    logger.error(`[redis] Cannot get apikey [${apikey}] on redis`, err);
    return next({ message: `Cannot get apikey [${apikey}] on redis` });
  }

  try {
    configApiKey = JSON.parse(configApiKey);
  } catch (err) {
    logger.error(`[router] Cannot parse config [${configApiKey}]`, err);
    return next({ message: `Cannot parse config [${configApiKey}]` });
  }

  const updateApikey = { apikey, ...configApiKey };

  return res.status(200).json(updateApikey);
});

/**
 * Delete the apikey entered in parameter
 */
router.delete('/keys/:apikey', checkAuth, async (req, res, next) => {
  const { error, value } = joi.string().trim().required().validate(req.params.apikey);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const apikey = value;

  let key;
  try {
    key = await redisClient.get(apikey);
  } catch (err) {
    logger.error(`[redis] Cannot get [${apikey}] on redis`, err);
    return next({ message: `Cannot get apikey [${apikey}] on redis` });
  }

  if (!key) {
    return res.status(404).json({ message: `Apikey: [${apikey}] not found` });
  }

  try {
    await deleteApiKey(apikey);
  } catch (err) {
    logger.error(`[redis] Cannot delete apikey [${apikey}]`, err);
    return next({ message: `Cannot delete apikey [${apikey}]` });
  }

  return res.status(204).json();
});

/**
 * Delete all apikeys
 */
router.delete('/keys', checkAuth, async (req, res, next) => {
  try {
    await redisClient.flushall();
  } catch (err) {
    logger.error('[redis] Cannot delete all apikey', err);
    return next({ message: 'Cannot delete all apikey' });
  }
  return res.status(204).json();
});

/**
 * Load apikeys entered in body
 */
router.post('/keys/load', checkAuth, async (req, res, next) => {
  const { error, value } = joi.array().validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const loadKeys = value;

  for (let i = 0; i < loadKeys.length; i += 1) {
    const { apikey, config } = loadKeys[i];

    try {
      await redisClient.set(apikey, JSON.stringify(config));
      logger.info(`[redis] ${config.name} is loaded`);
    } catch (err) {
      logger.error(`[redis] Cannot load [${apikey}] with config [${JSON.stringify(config)}]`, err);
      return next({ message: `Cannot load [${apikey}] with config [${JSON.stringify(config)}]` });
    }
  }

  return res.status(204).json();
});

/**
 * Load dev apikeys for development or test
 */
router.post('/keys/loadDev', checkAuth, async (req, res, next) => {
  try {
    await load();
  } catch (err) {
    logger.error('[apikeys] Cannot load dev apikeys', err);
    return next({ message: 'Cannot load dev apikeys' });
  }
  return res.status(204).json();
});

module.exports = router;
