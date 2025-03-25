/* eslint-disable global-require */
const config = require('config');
const appLogger = require('../logger/appLogger');
const getUnpaywallClient = require('./client');

const { apikey } = config.unpaywall;

const unpaywall = getUnpaywallClient();

/**
 * Ping unpaywall.
 *
 * @returns {Promise<boolean>} healthy or not.
 */
async function pingUnpaywall() {
  try {
    await unpaywall({
      method: 'GET',
      url: '/',
    });
    return true;
  } catch (err) {
    appLogger.error('[unpaywall] Cannot ping unpaywall', err);
    return false;
  }
}

/**
 * Get the current snapshot.
 *
 * @returns {Readable} Stream of snapshot.
 */
async function getSnapshot() {
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
    appLogger.error('[unpaywall]: Cannot get current snapshot');
    return false;
  }
  return res;
}

/**
 * Get the Unpaywall changefile registry with interval and between period.
 *
 * @param {string} interval Interval of changefile, day or week are available.
 * @param {string} startDate Start date for the changefile period.
 * @param {string} endDate End date for the changefile period.
 *
 * @returns {Promise<Object>} Unpaywall changefile registry in json format.
 */
async function getChangefiles(interval, startDate, endDate) {
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
    appLogger.error(`[unpaywall][${interval}]: Cannot get changefiles on interval between [${startDate}] end [${endDate}]`);
    return false;
  }

  let changefilesInfo = res.data.list;

  changefilesInfo = changefilesInfo
    .reverse()
    .filter((file) => file.filetype === 'jsonl');

  if (interval === 'week') {
    changefilesInfo = changefilesInfo
      .filter((file) => new Date(file.to_date).getTime() >= new Date(startDate).getTime())
      .filter((file) => new Date(file.to_date).getTime() <= new Date(endDate).getTime());
  }

  if (interval === 'day') {
    changefilesInfo = changefilesInfo
      .filter((file) => new Date(file.date).getTime() >= new Date(startDate).getTime())
      .filter((file) => new Date(file.date).getTime() <= new Date(endDate).getTime());
  }

  return changefilesInfo;
}

/**
 * Get changefile from unpaywall with his filename.
 *
 * @param {string} filename Filename of changefile.
 * @param {string} interval Type of changefile (day or week).
 *
 * @returns {Readable} Stream of changefile.
 */
async function getChangefile(filename, interval) {
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
    appLogger.error(`[unpaywall]: Cannot get /${feed}/changefile/${filename} - ${err}`);
    return false;
  }

  return res;
}

module.exports = {
  pingUnpaywall,
  getSnapshot,
  getChangefiles,
  getChangefile,
};
