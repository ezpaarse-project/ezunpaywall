const path = require('path');
const fs = require('fs-extra');
const client = require('../../client/client');
const { processLogger } = require('../../logger/logger');

const reportDir = path.resolve(__dirname, '..', '..', 'out', 'reports');
const createReport = async (status, route) => {
  try {
    await fs.writeFileSync(`${reportDir}/${route}-${new Date().toISOString().slice(0, 16)}.json`, JSON.stringify(status, null, 2));
  } catch (error) {
    processLogger.error(error);
  }
};

/**
 * @param {*} data array of unpaywall datas
 */
const insertUPW = async (data) => {
  const body = data.flatMap((doc) => [{ index: { _index: 'unpaywall' } }, doc]);
  await client.bulk({ refresh: true, body });
};

module.exports = {
  insertUPW,
  createReport,
};
