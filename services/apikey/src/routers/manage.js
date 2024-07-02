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
} = require('../controllers/manage');

const dev = require('../middlewares/dev');

/**
 * Route that get config of apikey.
 * Auth required.
 */
router.get('/keys/:apikey', validateApikey, getApikey);

/**
 * Get list of all apikeys.
 * Auth required.
 */
router.get('/keys', checkAuth, getAllApikey);

/**
 * Route that create new apikey.
 * Auth required.
 */
router.post('/keys', checkAuth, validateCreateApikey, createApiKey);

/**
 * Route that update existing apikey.
 * Auth required.
 */
router.put('/keys/:apikey', checkAuth, validateUpdateApiKey, updateApiKey);

/**
 * Route that delete existing apikey.
 * Auth required.
 */
router.delete('/keys/:apikey', checkAuth, validateApikey, deleteApiKey);

/**
 * Route that delete all apikeys.
 * Using for test.
 * Auth required.
 */
router.delete('/keys', dev, checkAuth, deleteAllApikey);

/**
 * Route that load apikeys.
 * Auth required.
 */
router.post('/keys/load', checkAuth, validateLoadApikey, loadApikey);

/**
 * Route that load dev apikeys.
 * Using for test.
 * Auth required.
 */
router.post('/keys/loadDev', dev, checkAuth, loadDevApikey);

module.exports = router;
