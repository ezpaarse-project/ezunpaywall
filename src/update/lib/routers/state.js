const router = require('express').Router();

const {
  getState,
} = require('../models/state');

/**
 * Route that give the most recent state in JSON format.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * *
 * @routeResponse {Object} The content of latest report.
 *
 * @return {import('express').Response} HTTP response.
 */
router.get('/states', async (req, res) => {
  const state = getState();
  return res.status(200).json(state);
});

module.exports = router;
