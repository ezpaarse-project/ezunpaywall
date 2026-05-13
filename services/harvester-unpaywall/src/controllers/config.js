const { getConfig } = require('../lib/config');

async function getConfigController(req, res, next) {
  const config = getConfig();
  return res.status(200).json(config);
}

module.exports = getConfigController;
