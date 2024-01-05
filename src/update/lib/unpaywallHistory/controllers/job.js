const { format } = require('date-fns');

const {
  insertWithOaHistoryJob,
} = require('../job');

const {
  rollBack,
} = require('../history');
/**
 * Controller to start job that download ans insert changefiles on period.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function insertWithOaHistory(req, res, next) {
  const {
    startDate,
    endDate,
    index,
    interval,
  } = req.data;

  if (new Date(startDate).getTime() > Date.now()) {
    return res.status(400).json({ message: 'startDate cannot be in the future' });
  }

  if (startDate && endDate) {
    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      return res.status(400).json({ message: 'endDate cannot be lower than startDate' });
    }
  }

  const jobConfig = {
    index,
    interval,
    startDate,
    endDate,
    offset: 0,
    limit: -1,
  };

  if (!startDate && !endDate) {
    jobConfig.endDate = format(new Date(), 'yyyy-MM-dd');
    if (interval === 'week') jobConfig.startDate = format(new Date() - (7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    if (interval === 'day') jobConfig.startDate = format(new Date(), 'yyyy-MM-dd');

    insertWithOaHistoryJob(jobConfig);
    return res.status(202).json();
  }

  if (startDate && !endDate) jobConfig.endDate = format(new Date(), 'yyyy-MM-dd');

  insertWithOaHistoryJob(jobConfig);
  return res.status(202).json();
}

/**
 * Controller to start job that download ans insert changefiles on period.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function historyRollBack(req, res, next) {
  const {
    startDate,
    index,
  } = req.data;

  await rollBack(startDate, index);
  return res.status(202).json();
}

module.exports = {
  insertWithOaHistory,
  historyRollBack,
};
