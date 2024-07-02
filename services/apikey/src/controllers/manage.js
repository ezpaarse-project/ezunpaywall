const apikeyService = require('../services/apikeys');

const { redisClient, load } = require('../services/redis');
const logger = require('../logger/appLogger');

/**
 * Controller to get config of apikey.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function getApikey(req, res, next) {
  const apikey = req.data;

  let config;
  try {
    config = await apikeyService.get(apikey);
  } catch (err) {
    const message = `Cannot get config for apikey [${apikey}]`;
    return next({ message });
  }

  if (!config) {
    logger.error(`[redis] config [${config}] for [${config}] not found`);
    return res.status(404).json({ message: `config [${config}] for [${apikey}] not found` });
  }

  return res.status(200).json(config);
}

/**
 * Controller to get all config of apikeys.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function getAllApikey(req, res, next) {
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
}

/**
 * Controller to create new apikey.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function createApiKey(req, res, next) {
  const apikeyConfig = req.data;

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
    apikey = await apikeyService.create(apikeyConfig);
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
}

/**
 * Controller to update config of apikey.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function updateApiKey(req, res, next) {
  const { apikey, apikeyConfig } = req.data;
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
    await apikeyService.update(apikey, apikeyConfig);
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
}

/**
 * Controller to delete apikey.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function deleteApiKey(req, res, next) {
  const apikey = req.data;

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
    await apikeyService.remove(apikey);
  } catch (err) {
    logger.error(`[redis] Cannot delete apikey [${apikey}]`, err);
    return next({ message: `Cannot delete apikey [${apikey}]` });
  }

  return res.status(204).json();
}

/**
 * Controller to delete all apikeys.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function deleteAllApikey(req, res, next) {
  try {
    await redisClient.flushall();
  } catch (err) {
    logger.error('[redis] Cannot delete all apikey', err);
    return next({ message: 'Cannot delete all apikey' });
  }
  return res.status(204).json();
}

/**
 * Controller to load apikeys.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function loadApikey(req, res, next) {
  const loadKeys = req.data;

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
}

/**
 * Controller to load dev apikeys.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function loadDevApikey(req, res, next) {
  try {
    await load();
  } catch (err) {
    logger.error('[apikeys] Cannot load dev apikeys', err);
    return next({ message: 'Cannot load dev apikeys' });
  }
  return res.status(204).json();
}

module.exports = {
  getApikey,
  getAllApikey,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  deleteAllApikey,
  loadApikey,
  loadDevApikey,
};
