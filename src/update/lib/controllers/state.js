const { getState } = require('../state');

/**
 * Controller to get the state of update.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
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
