const router = require('express').Router();

const { getState } = require('../../lib/update/state');

/**
 * Route that give the most recent state in JSON format.
 */
router.get('/states', async (req, res, next) => {
  let state = {};
  try {
    state = getState();
  } catch (err) {
    return next({ message: 'Cannot get state' });
  }
  return res.status(200).json(state);
});

module.exports = router;
