const router = require('express').Router();

const {
  getState,
} = require('../models/state');

/**
 * Route that give the most recent state in JSON format.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 * *
 * @routeResponse {Object} The content of latest report.
 *
 * @returns {Object} HTTP response.
 */
router.get('/states', async (req, res) => {
  const state = getState();
  return res.status(200).json(state);
});

module.exports = router;
