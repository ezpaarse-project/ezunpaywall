const { getState } = require('../models/state');

function getCurrentState(req, res, next) {
  let state = {};
  try {
    state = getState();
  } catch (err) {
    return next({ message: 'Cannot get state' });
  }
  return res.status(200).json(state);
}

module.exports = getCurrentState;
