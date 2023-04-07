const router = require('express').Router();

const {
  getState,
} = require('../models/state');

/**
 * Route that give the most recent state in JSON format.
 */
router.get('/states', async (req, res) => {
  const state = getState();
  return res.status(200).json(state);
});

module.exports = router;
