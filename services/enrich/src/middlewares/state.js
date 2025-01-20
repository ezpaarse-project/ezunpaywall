const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const { paths } = require('config');

async function upsertDirectoryOfUser(req, res, next) {
  const apikey = req.get('x-api-key');

  let dirExist = false;
  try {
    dirExist = await fs.existsSync(path.resolve(paths.data.statesDir, apikey));
  } catch (err) {
    return next({ message: err.message });
  }

  if (!dirExist) {
    try {
      await fsp.mkdir(path.resolve(paths.data.statesDir, apikey));
    } catch (err) {
      return next({ message: err.message });
    }
  }
  return next();
}

module.exports = upsertDirectoryOfUser;
