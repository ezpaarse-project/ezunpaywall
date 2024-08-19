const router = require('express').Router();

const checkAuth = require('../middlewares/auth');

const {
  validateApikey,
  validateCreateApikey,
  validateUpdateApiKey,
  validateLoadApikey,
} = require('../middlewares/apikey');

const {
  getApikey,
  getAllApikey,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  deleteAllApikey,
  loadApikey,
  loadDevApikey,
} = require('../controllers/apikey');

const dev = require('../middlewares/dev');

/**
 * Route that get config of API key.
 * Auth required.
 */
router.get('/apikeys/:apikey', validateApikey, getApikey);

/**
 * Get list of all API keys.
 * Auth required.
 */
router.get('/apikeys', checkAuth, getAllApikey);

/**
 * Route that create new API key.
 * Auth required.
 */
router.post('/apikeys', checkAuth, validateCreateApikey, createApiKey);

/**
 * Route that update existing API key.
 * Auth required.
 */
router.put('/apikeys/:apikey', checkAuth, validateUpdateApiKey, updateApiKey);

/**
 * Route that delete existing API key.
 * Auth required.
 */
router.delete('/apikeys/:apikey', checkAuth, validateApikey, deleteApiKey);

/**
 * Route that delete all API keys.
 * Using for test.
 * Auth required.
 */
router.delete('/apikeys', dev, checkAuth, deleteAllApikey);

/**
 * Route that load API keys.
 * Auth required.
 */
router.post('/apikeys/load', checkAuth, validateLoadApikey, loadApikey);

/**
 * Route that load dev API keys.
 * Using for test.
 * Auth required.
 */
router.post('/apikeys/loadDev', dev, checkAuth, loadDevApikey);

module.exports = router;
