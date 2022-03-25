const router = require('express').Router();

const {
  getState,
} = require('../bin/state');

/**
 * get the most recent state in JSON format
 * @return state
 */
router.get('/states', async (req, res, next) => {
  const state = getState();
  return res.status(200).json(state);
});

module.exports = router;
