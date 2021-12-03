const router = require('express').Router();
const boom = require('@hapi/boom');
const joi = require('joi');

const checkAuth = require('../middlewares/auth');
const {
  redisClient,
  load,
  pingRedis,
} = require('../lib/redis');

const logger = require('../lib/logger');

const {
  createApiKey,
  updateApiKey,
  deleteApiKey,
} = require('../bin/manage');

const availableAccess = ['update', 'enrich', 'graphql'];

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
router.get('/config/:apikey', async (req, res, next) => {
  const { apikey } = req.params;
  const { error } = joi.string().trim().required().validate(apikey);

  if (error) return next(boom.badRequest(error.details[0].message));

  let key;
  try {
    key = await redisClient.get(apikey);
  } catch (err) {
    logger.error(`Cannot get ${apikey} on redis`);
    logger.error(err);
    return next(boom.boomify(err));
  }

  if (!key) {
    return next(boom.notFound(`"${key}" not found`));
  }

  let config;
  try {
    config = JSON.parse(key);
  } catch (err) {
    logger.error(`Cannot parse ${key}`);
    logger.error(err);
    return next(boom.boomify(err));
  }

  return res.status(200).json(config);
});

/**
 * get config of apikey
 */
router.get('/all', checkAuth, async (req, res, next) => {
  const keys = await redisClient.keys('*');

  const allKeys = {};

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];

    let config;

    try {
      config = await redisClient.get(key);
      config = JSON.parse(config);
    } catch (err) {
      return next(boom.boomify(err));
    }

    allKeys[key] = config;
  }

  return res.status(200).json({ keys: allKeys });
});

/**
 * create new apikey
 */
router.post('/create', checkAuth, async (req, res, next) => {
  const { error, value } = joi.object({
    name: joi.string().trim().required(),
    attributes: joi.string().trim().valid(...unpaywallAttrs).default('*'),
    access: joi.array().items(joi.string().trim().valid(...availableAccess)).default(['graphql']),
    allowed: joi.boolean().default(true),
  }).validate(req.body);

  if (error) return next(boom.badRequest(error.details[0].message));

  const {
    name, attributes, access, allowed,
  } = value;

  let keys;

  try {
    keys = await redisClient.keys('*');
  } catch (err) {
    return next(boom.boomify(err));
  }

  for (let i = 0; i < keys.length; i += 1) {
    let config;
    try {
      config = await redisClient.get(keys[i]);
      config = JSON.parse(config);
    } catch (err) {
      return next(boom.boomify(err));
    }
    if (config.name === name) {
      return next(boom.conflict(`Name [${name}] already exist`));
    }
  }

  let apikey;

  try {
    apikey = await createApiKey(name, access, attributes, allowed);
  } catch (err) {
    return next(boom.boomify(err));
  }

  let config;
  try {
    config = await redisClient.get(apikey);
    config = JSON.parse(config);
  } catch (err) {
    return next(boom.boomify(err));
  }

  return res.status(200).json({ apikey, config });
});

/**
 * update apikey
 */
router.put('/update', checkAuth, async (req, res, next) => {
  const { error, value } = joi.object({
    apikey: joi.string().required(),
    name: joi.string().trim(),
    attributes: joi.string().trim().valid(...unpaywallAttrs).default('*'),
    access: joi.array().items(joi.string().trim().valid(...availableAccess)).default(['graphql', 'enrich']),
    allowed: joi.boolean().default(true),
  }).validate(req.body);

  if (error) return next(boom.badRequest(error.details[0].message));

  const {
    apikey, name, attributes, access, allowed,
  } = value;

  let key;
  try {
    key = await redisClient.get(apikey);
  } catch (err) {
    logger.error(`Cannot get ${apikey} on redis`);
    logger.error(err);
    return next(boom.boomify(err));
  }

  if (!key) {
    return next(boom.notFound(`"${key}" not found`));
  }

  try {
    await updateApiKey(apikey, name, access, attributes, allowed);
  } catch (err) {
    return next(boom.boomify(err));
  }

  let configApiKey;
  try {
    configApiKey = await redisClient.get(apikey);
    configApiKey = JSON.parse(configApiKey);
  } catch (err) {
    return next(boom.boomify(err));
  }

  const updateApikey = { apikey, ...configApiKey };

  return res.status(200).json(updateApikey);
});

/**
 * delete apikey
 */
router.delete('/delete/:apikey', checkAuth, async (req, res, next) => {
  const { error, value } = joi.string().trim().required().validate(req.params.apikey);
  console.log(value);
  console.log(error);
  if (error) return next(boom.badRequest(error.details[0].message));

  const apikey = value;

  let key;
  try {
    key = await redisClient.get(apikey);
  } catch (err) {
    logger.error(`Cannot get ${apikey} on redis`);
    logger.error(err);
    return next(boom.boomify(err));
  }

  if (!key) {
    return next(boom.notFound(`"${apikey}" not found`));
  }

  try {
    await deleteApiKey(apikey);
  } catch (err) {
    return next(boom.boomify(err));
  }

  return res.status(204).json();
});

/**
 * delete all apikey
 */
router.delete('/all', checkAuth, async (req, res, next) => {
  try {
    await redisClient.flushall();
  } catch (err) {
    return next(boom.boomify(err));
  }
  return res.status(204).json();
});

/**
 * load apikey
 */
router.post('/load', checkAuth, async (req, res, next) => {
  const { dev } = req.query;
  const { keys } = req.body;
  if (dev) {
    try {
      await load();
    } catch (err) {
      return next(boom.boomify(err));
    }
    return res.status(204).json();
  }

  try {
    await Promise.all(
      Object.entries(keys).map(async ([keyId, keyValue]) => {
        try {
          await redisClient.set(keyId, `${JSON.stringify(keyValue)}`);
        } catch (err) {
          logger.error(`Cannot load ${keyId} with ${JSON.stringify(keyValue)} on redis`);
          logger.error(err);
        }
      }),
    );
  } catch (err) {
    return next(boom.boomify(err));
  }

  return res.status(204).json();
});

/**
 * ping redis
 */
router.get('/ping', async (req, res, next) => {
  let ping;
  try {
    ping = await pingRedis();
  } catch (err) {
    return next(boom.boomify(err));
  }
  if (ping) {
    return res.status(200).json('OK');
  }
  return next(boom.serverUnavailable());
});

module.exports = router;
