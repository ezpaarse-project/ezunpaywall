/* eslint-disable no-restricted-syntax */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Client } = require('@elastic/elasticsearch');
const { URL } = require('url');

const elasticClient = new Client({
  node: {
    url: new URL('http://localhost:9200'),
    auth: {
      username: 'elastic',
      password: 'changeme',
    },
  },
});

/**
 * Insert the content of fake1.jsonl in elastic.
 *
 * @returns {Promise<void>}
 */
async function insertDataUnpaywall() {
  const filepath = path.resolve(__dirname, '..', 'sources', 'fake1.jsonl');
  let readStream;
  try {
    readStream = await fs.createReadStream(filepath);
  } catch (err) {
    console.error(`fs.createReadStream in insertDataUnpaywall: ${err}`);
  }

  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });

  const data = [];

  for await (const line of rl) {
    data.push(JSON.parse(line));
  }

  const body = data.flatMap((doc) => [{ index: { _index: 'unpaywall-test', _id: doc.doi } }, doc]);

  try {
    await elasticClient.bulk({ refresh: true, body });
  } catch (err) {
    console.error(err);
  }
}

async function insertHistoryDataUnpaywall() {
  const filepath1 = path.resolve(__dirname, '..', 'sources', 'unpaywall-history.jsonl');
  let readStream1;
  try {
    readStream1 = await fs.createReadStream(filepath1);
  } catch (err) {
    console.error(`fs.createReadStream in insertDataUnpaywall: ${err}`);
  }

  const rl1 = readline.createInterface({
    input: readStream1,
    crlfDelay: Infinity,
  });

  const data1 = [];

  for await (const line of rl1) {
    data1.push(JSON.parse(line));
  }

  const body1 = data1.flatMap((doc) => [{ index: { _index: 'unpaywall-history' } }, doc]);

  try {
    await elasticClient.bulk({ refresh: true, body: body1 });
  } catch (err) {
    console.error(err);
  }

  const filepath2 = path.resolve(__dirname, '..', 'sources', 'unpaywall.jsonl');
  let readStream2;
  try {
    readStream2 = await fs.createReadStream(filepath2);
  } catch (err) {
    console.error(`fs.createReadStream in insertDataUnpaywall: ${err}`);
  }

  const rl2 = readline.createInterface({
    input: readStream2,
    crlfDelay: Infinity,
  });

  const data2 = [];

  for await (const line of rl2) {
    data2.push(JSON.parse(line));
  }

  const body2 = data2.flatMap((doc) => [{ index: { _index: 'unpaywall-base', _id: doc.doi } }, doc]);

  try {
    await elasticClient.bulk({ refresh: true, body: body2 });
  } catch (err) {
    console.error(err);
  }
}

/**
 * Check if index exit.
 *
 * @param {string} name Name of index.
 *
 * @returns {Promise<boolean>} is exist.
 */
async function checkIfIndexExist(name) {
  let res;
  try {
    res = await elasticClient.indices.exists({
      index: name,
    });
  } catch (err) {
    console.error(`indices.exists in checkIfIndexExist: ${err}`);
  }
  return res.body;
}

/**
 * Create index if it doesn't exist.
 *
 * @param {string} name Name of index.
 * @param {Object} index Index in JSON format.
 *
 * @returns {Promise<void>}
 */
async function createIndex(name, index) {
  const exist = await checkIfIndexExist(name);
  if (!exist) {
    try {
      await elasticClient.indices.create({
        index: name,
        body: index,
      });
    } catch (err) {
      console.error(`indices.create in createIndex: ${err}`);
    }
  }
}

/**
 * Delete index if it exist.
 *
 * @param {string} name Name of index.
 *
 * @returns {Promise<void>}
 */
async function deleteIndex(name) {
  const exist = await checkIfIndexExist(name);
  if (exist) {
    try {
      await elasticClient.indices.delete({
        index: name,
      });
    } catch (err) {
      console.error(`deleteIndex: ${err}`);
    }
  }
}

/**
 * Count how many documents there are in an index.
 *
 * @param {string} name Name of index.
 *
 * @returns {Promise<number>} number of document.
 */
async function countDocuments(name) {
  const exist = await checkIfIndexExist(name);
  let data;
  if (exist) {
    try {
      data = await elasticClient.count({
        index: name,
      });
    } catch (err) {
      console.error(`countDocuments: ${err}`);
    }
  }
  return data?.body?.count ? data?.body?.count : 0;
}

async function getAllData(index) {
  let res;
  try {
    res = await elasticClient.search({
      index,
      body: {
        query: {
          match_all: { },
        },
      },

    });
  } catch (err) {
    console.error('[elastic]: Cannot request elastic', err);
    return null;
  }
  // eslint-disable-next-line no-underscore-dangle
  return res.body.hits.hits.map((hit) => hit._source);
}

async function searchByDOI(dois, index) {
  if (!dois) { return []; }
  // Normalize request
  const normalizeDOI = dois.map((doi) => doi.toLowerCase());

  const filter = [{ terms: { doi: normalizeDOI } }];

  const query = {
    bool: {
      filter,
    },
  };

  let res;
  try {
    res = await elasticClient.search({
      index,
      size: 1000,
      body: {
        query,
      },

    });
  } catch (err) {
    console.error('[elastic]: Cannot search documents with DOI as ID', err);
    return [];
  }
  // eslint-disable-next-line no-underscore-dangle
  return res.body.hits.hits.map((hit) => hit._source);
}

module.exports = {
  elasticClient,
  createIndex,
  deleteIndex,
  checkIfIndexExist,
  insertDataUnpaywall,
  insertHistoryDataUnpaywall,
  countDocuments,
  getAllData,
  searchByDOI,
};
