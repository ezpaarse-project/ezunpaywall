/* eslint-disable no-restricted-syntax */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Client } = require('@elastic/elasticsearch');
const { URL } = require('url');

const client = new Client({
  node: {
    url: new URL('http://localhost:9200'),
    auth: {
      username: 'elastic',
      password: 'changeme',
    },
  },
});

/**
 * Check if index exit.
 *
 * @param {string} name Name of index.
 *
 * @returns {Promise<boolean>} isExist
 */
async function checkIfIndexExist(name) {
  let res;
  try {
    res = await client.indices.exists({
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
 * @param {Object} index mapping in JSON format.
 *
 * @returns {Promise<void>}
 */
async function createIndex(name, index) {
  const exist = await checkIfIndexExist(name);
  if (!exist) {
    try {
      await client.indices.create({
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
 * @param {<string>} name Name of index.
 *
 * @returns {Promise<void>}
 */
async function deleteIndex(name) {
  const exist = await checkIfIndexExist(name);
  if (exist) {
    try {
      await client.indices.delete({
        index: name,
      });
    } catch (err) {
      console.error(`deleteIndex: ${err}`);
    }
  }
}

/**
 * Insert the content of fake1.jsonl in elastic.
 *
 * @returns {Promise<void>}
 */
async function insertDataUnpaywall() {
  const filepath = path.resolve(__dirname, '..', 'sources', 'unpaywall', 'fake1.jsonl');
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
    await client.bulk({ refresh: true, body });
  } catch (err) {
    console.error(`insertDataUnpaywall: ${err}`);
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
      data = await client.count({
        index: name,
      });
    } catch (err) {
      console.error(`countDocuments: ${err}`);
    }
  }
  return data.body.count ? data.body.count : 0;
}

module.exports = {
  client,
  createIndex,
  deleteIndex,
  checkIfIndexExist,
  insertDataUnpaywall,
  countDocuments,
};
