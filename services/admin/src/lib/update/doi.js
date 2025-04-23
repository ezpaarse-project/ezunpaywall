const appLogger = require('../logger/appLogger');

const config = require('config');

const { getDocumentByDOI } = require('../unpaywall/api');
const { updateDocument } = require('../elastic');

const { limit } = config.cron.doiUpdate;
let count = 0;

let cachedDOI = [];

async function getCount() {
  return count;
}

async function setCount(value) {
  count = value;
}

async function getCachedDOI() {
  return cachedDOI;
}

async function setCachedDOI(value) {
  cachedDOI = value;
}

/* eslint-disable no-restricted-syntax */
async function updateDOI(dois, index = 'unpaywall') {
  for await (const doi of dois) {
    if (cachedDOI.includes(doi)) {
      continue;
    }
    let data;
    try {
      data = await getDocumentByDOI(doi);
    } catch (err) {
      appLogger.error(`[update][doi]: Cannot get document ${doi} from unpaywall`, err);
    }
    if (data && count < limit) {
      cachedDOI.push(doi);
      try {
        await updateDocument(index, doi, data);
        count += 1;
      } catch (err) {
        appLogger.error(`[update][doi]: Cannot update document ${doi} on ezunpaywall`, err);
      }
    }
  }
}

module.exports = {
  getCount,
  setCount,
  getCachedDOI,
  setCachedDOI,
  updateDOI,
};
