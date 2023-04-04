const axios = require('axios');
const config = require('config');
const logger = require('../logger');

const unpaywall = axios.create({
  baseURL: config.get('unpaywall.host'),
});
unpaywall.baseURL = config.get('unpaywall.host');

const apikey = config.get('unpaywall.apikey');
/**
 * get the latest snapshot
 * @returns {Readable}
 */
const getSnapshot = async () => {
  let res;
  try {
    res = await unpaywall({
      method: 'get',
      url: '/feed/snapshot',
      responseType: 'stream',
      params: {
        api_key: apikey,
      },
    });
  } catch (err) {
    logger.errorRequest(err);
    return false;
  }
  return res;
};

/**
 * get list of changefiles with interval and between period
 * @param {String} interval
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Object}
 */
const getChangefiles = async (interval, startDate, endDate) => {
  let res;
  try {
    res = await unpaywall({
      method: 'get',
      url: '/feed/changefiles',
      params: {
        interval,
        api_key: apikey,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    logger.errorRequest(err);
    return false;
  }

  let snapshotsInfo = res.data.list;
  snapshotsInfo = snapshotsInfo
    .reverse()
    .filter((file) => file.filetype === 'jsonl');

  if (interval === 'week') {
    snapshotsInfo = snapshotsInfo
      .filter((file) => new Date(file.to_date).getTime() >= new Date(startDate).getTime())
      .filter((file) => new Date(file.to_date).getTime() <= new Date(endDate).getTime());
  }

  if (interval === 'day') {
    snapshotsInfo = snapshotsInfo
      .filter((file) => new Date(file.date).getTime() >= new Date(startDate).getTime())
      .filter((file) => new Date(file.date).getTime() <= new Date(endDate).getTime());
  }

  return snapshotsInfo;
};

/**
 * get changefile from unpaywall with his filename
 * @param {String} filename filename of changefile
 * @param {String} interval type of changefile (day or week)
 * @returns Readable
 */
const getChangefile = async (filename, interval) => {
  let res;

  let feed = 'feed';

  if (interval === 'day') {
    feed = 'daily-feed';
  }

  try {
    res = await unpaywall({
      method: 'get',
      url: `/${feed}/changefile/${filename}`,
      responseType: 'stream',
      params: {
        api_key: apikey,
      },
    });
  } catch (err) {
    logger.errorRequest(err);
    return false;
  }
  return res;
};

module.exports = {
  getSnapshot,
  getChangefiles,
  getChangefile,
};
