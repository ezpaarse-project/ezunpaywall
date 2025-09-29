const router = require('express').Router();

const checkAdmin = require('../middlewares/admin');

const {
  validateApikey,
  validateCreateApikey,
  validateUpdateApiKey,
  validateLoadApikey,
} = require('../middlewares/apikey');

const {
  getApikeyController,
  getAllApikeyController,
  createApiKeyController,
  updateApiKeyController,
  deleteApiKeyController,
  deleteAllApikeyController,
  loadApikeyController,
  loadDevApikeyController,
} = require('../controllers/apikey');

const dev = require('../middlewares/dev');

/**
 * Route that get config of API key.
 * Auth required.
 */
router.get('/apikeys/:apikey', validateApikey, getApikeyController);

/**
 * Get list of all API keys.
 * Auth required.
 */
router.get('/apikeys', checkAdmin, getAllApikeyController);

/**
 * Route that create new API key.
 * Auth required.
 */
router.post('/apikeys', checkAdmin, validateCreateApikey, createApiKeyController);

/**
 * Route that update existing API key.
 * Auth required.
 */
router.put('/apikeys/:apikey', checkAdmin, validateUpdateApiKey, updateApiKeyController);

/**
 * Route that delete existing API key.
 * Auth required.
 */
router.delete('/apikeys/:apikey', checkAdmin, validateApikey, deleteApiKeyController);

/**
 * Route that load API keys.
 * Auth required.
 */
router.post('/apikeys/load', checkAdmin, validateLoadApikey, loadApikeyController);

module.exports = router;
