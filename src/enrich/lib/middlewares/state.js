const path = require('path');
const fs = require('fs-extra');
const { paths } = require('config');

async function upsertDirectoryOfUser(req, res, next) {
  const apikey = req.get('x-api-key');

  let dirExist = false;
  try {
    dirExist = await fs.exists(path.resolve(paths.data.statesDir, apikey));
  } catch (err) {
    return next({ message: err.message });
  }

  if (!dirExist) {
    try {
      await fs.mkdir(path.resolve(paths.data.statesDir, apikey));
    } catch (err) {
      return next({ message: err.message });
    }
  }
  return next();
}

module.exports = upsertDirectoryOfUser;
