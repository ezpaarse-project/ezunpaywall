const router = require('express').Router();

const checkAuth = require('../middlewares/auth');
const {
  redisClient,
  load,
  pingRedis,
} = require('../lib/redis');
const logger = require('../lib/logger');

const {
  createAuth,
  updateAuth,
  deleteAuth,
} = require('../bin/manage');

const unpaywallAttrs = [
  '*',
  'data_standard',
  'doi',
  'doi_url',
  'genre',
  'is_paratext',
  'is_oa',
  'journal_is_in_doaj',
  'journal_is_oa',
  'journal_issns',
  'journal_issn_l',
  'journal_name',
  'oa_status',
  'published_date',
  'publisher',
  'title',
  'updated',
  'year',
  'best_oa_location.evidence',
  'best_oa_location.host_type',
  'best_oa_location.is_best',
  'best_oa_location.license',
  'best_oa_location.oa_date',
  'best_oa_location.pmh_id',
  'best_oa_location.updated',
  'best_oa_location.url',
  'best_oa_location.url_for_landing_page',
  'best_oa_location.url_for_pdf',
  'best_oa_location.version',
  'oa_locations.evidence',
  'oa_locations.host_type',
  'oa_locations.is_best',
  'oa_locations.license',
  'oa_locations.oa_date',
  'oa_locations.pmh_id',
  'oa_locations.updated',
  'oa_locations.url',
  'oa_locations.url_for_landing_page',
  'oa_locations.url_for_pdf',
  'oa_locations.version',
  'first_oa_location.evidence',
  'first_oa_location.host_type',
  'first_oa_location.is_best',
  'first_oa_location.license',
  'first_oa_location.oa_date',
  'first_oa_location.pmh_id',
  'first_oa_location.updated',
  'first_oa_location.url',
  'first_oa_location.url_for_landing_page',
  'first_oa_location.url_for_pdf',
  'first_oa_location.version',
  'z_authors.family',
  'z_authors.given',
  'z_authors.ORCID',
  'z_authors.authentificated-orcid',
  'z_authors.affiliation',
];

/**
 * get config of apikey
 */
router.get('/config', async (req, res) => {
  const apikey = req.get('x-api-key');

  if (!apikey) {
    return res.status(400).json({ message: 'id expected' });
  }

  let key;
  try {
    key = await redisClient.get(apikey);
  } catch (err) {
    logger.error(`Cannot get ${apikey} on redis`);
    logger.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }

  if (!key) {
    return res.status(404).json({ message: `[${apikey}] apikey doesn't exist` });
  }

  let config;
  try {
    config = JSON.parse(key);
  } catch (err) {
    logger.error(`Cannot parse ${key}`);
    logger.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }

  return res.status(200).json(config);
});

/**
 * get config of apikey
 */
router.get('/all', checkAuth, async (req, res) => {
  const keys = await redisClient.keys('*');

  const allKeys = {};

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    let config = await redisClient.get(key);
    config = JSON.parse(config);
    allKeys[key] = config;
  }

  return res.status(200).json({ keys: allKeys });
});

/**
 * create new apikey
 */
router.post('/create', checkAuth, async (req, res, next) => {
  const {
    name, attributes, access, allowed,
  } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name expected' });
  }

  const availableAccess = ['update', 'enrich', 'graphql', 'auth'];

  if (access) {
    if (!Array.isArray(access)) {
      return res.status(400).json({ message: `argument "access" [${access}] is in wrong format` });
    }
    if (access) {
      access.forEach((e) => {
        if (!availableAccess.includes(e)) {
          return res.status(400).json({ message: `argument "access" [${e}] doesn't exist` });
        }
      });
    }
  }

  if (allowed) {
    if (typeof allowed !== 'boolean') {
      return res.status(400).json({ message: `argument "allowed" [${allowed}] is in wrong format` });
    }
  }

  if (attributes) {
    if (typeof attributes !== 'string') {
      return res.status(400).json({ message: `argument "attributes" [${attributes}] is in wrong format` });
    }

    if (attributes) {
      const attrs = attributes.split(',');
      attrs.forEach((attr) => {
        if (!unpaywallAttrs.includes(attr)) {
          return res.status(400).json({ message: `argument "attributes" [${attr}] doesn't exist` });
        }
      });
    }
  }

  const keys = await redisClient.keys('*');

  keys.filter(async (key) => {
    let config = await redisClient.get(key);
    config = JSON.parse(config);
    if (config.name === name) {
      return res.status(400).json({ message: `Name [${name}] already exist` });
    }
  });

  let id;

  try {
    id = await createAuth(name, access, attributes, allowed);
  } catch (err) {
    return next(err);
  }

  let config = await redisClient.get(id);
  config = JSON.parse(config);

  return res.status(200).json({ apikey: id, config });
});

/**
 * update apikey
 */
router.put('/update', checkAuth, async (req, res, next) => {
  const { config, id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'id expected' });
  }

  const availableAccess = ['update', 'enrich', 'graphql', 'auth'];

  if (config.access) {
    if (!Array.isArray(config.access)) {
      return res.status(400).json({ message: `argument "access" [${config.access}] is in wrong format` });
    }
    if (config?.access) {
      config.access.forEach((e) => {
        if (!availableAccess.includes(e)) {
          return res.status(400).json({ message: `argument "access" [${e}] doesn't exist` });
        }
      });
    }
  }

  if (config.allowed) {
    if (typeof config.allowed !== 'boolean') {
      return res.status(400).json({ message: `argument "allowed" [${config.allowed}] is in wrong format` });
    }
  }

  if (config.attributes) {
    if (typeof config.attributes !== 'string') {
      return res.status(400).json({ message: `argument "attributes" [${config.attributes}] is in wrong format` });
    }

    if (config.attributes) {
      const attrs = config.attributes.split(',');
      attrs.forEach((attr) => {
        if (!unpaywallAttrs.includes(attr)) {
          return res.status(400).json({ message: `argument "attributes" [${attr}] doesn't exist` });
        }
      });
    }
  }

  let key;
  try {
    key = await redisClient.get(id);
  } catch (err) {
    logger.error(`Cannot get ${id} on redis`);
    logger.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }

  if (!key) {
    return res.status(404).json({ message: `[${id}] apikey doesn't exist` });
  }

  try {
    await updateAuth(id, config.name, config.access, config.attributes, config.allowed);
  } catch (err) {
    return next(err);
  }

  let configApiKey = await redisClient.get(id);
  configApiKey = JSON.parse(configApiKey);

  return res.status(200).json({ apikey: id, config: configApiKey });
});

/**
 * delete apikey
 */
router.delete('/delete', checkAuth, async (req, res, next) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'id expected' });
  }

  let key;
  try {
    key = await redisClient.get(id);
  } catch (err) {
    logger.error(`Cannot get ${id} on redis`);
    logger.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }

  if (!key) {
    return res.status(404).json({ message: `[${id}] apikey doesn't exist` });
  }

  try {
    await deleteAuth(id);
  } catch (err) {
    return next(err);
  }

  return res.status(200).json({ id });
});

/**
 * delete all apikey
 */
router.delete('/all', checkAuth, async (req, res, next) => {
  try {
    await redisClient.flushall();
  } catch (err) {
    return next(err);
  }
  return res.status(200).json({ message: 'flushall' });
});

/**
 * load apikey
 */
router.post('/load', checkAuth, async (req, res, next) => {
  try {
    await load();
  } catch (err) {
    return next(err);
  }
  return res.status(200).json({ message: 'load' });
});

/**
 * ping redis
 */
router.get('/ping', async (req, res, next) => {
  let ping;
  try {
    ping = await pingRedis();
  } catch (err) {
    return next(err);
  }
  if (ping) {
    return res.status(200).json({ message: 'OK' });
  }
  return res.status(400).json({ message: 'Cannot ping Redis' });
});

module.exports = router;
