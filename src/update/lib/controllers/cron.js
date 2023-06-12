const cron = require('../cron/update');

function startUpdateCron(req, res, next) {
  cron.updateCron.start();

  return res.status(202).json();
}

function stopUpdateCron(req, res, next) {
  try {
    cron.updateCron.stop();
  } catch (err) {
    return next(err);
  }

  return res.status(202).json();
}

function patchUpdateCron(req, res, next) {
  const value = req.data;
  const { time, index, interval } = value;
  try {
    cron.update({ time, index, interval });
  } catch (err) {
    return next(err);
  }

  const config = cron.getGlobalConfig();

  return res.status(200).json(config);
}

function getConfigOfUpdateCron(req, res) {
  const config = cron.getGlobalConfig();

  return res.status(200).json(config);
}
module.exports = {
  startUpdateCron,
  stopUpdateCron,
  patchUpdateCron,
  getConfigOfUpdateCron,
};
