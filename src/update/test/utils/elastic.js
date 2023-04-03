/* eslint-disable no-restricted-syntax */
const fs = require('fs-extra');
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

const insertDataUnpaywall = async () => {
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
};

/**
 * Check if index exit.
 *
 * @param {string} name - Name of index.
 * @returns {boolean} is exist.
 */
const checkIfIndexExist = async (name) => {
  let res;
  try {
    res = await elasticClient.indices.exists({
      index: name,
    });
  } catch (err) {
    console.error(`indices.exists in checkIfIndexExist: ${err}`);
  }
  return res.body;
};

/**
 * Create index if it doesn't exist.
 *
 * @param {string} name - Name of index.
 * @param {Object} index - Index in JSON format.
 */
const createIndex = async (name, index) => {
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
};

/**
 * Delete index if it exist.
 *
 * @param {string} name - Name of index.
 */
const deleteIndex = async (name) => {
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
};

/**
 * Count how many documents there are in an index.
 *
 * @param {string} name - Name of index.
 * @returns {number} number of document.
 */
const countDocuments = async (name) => {
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
};

module.exports = {
  elasticClient,
  createIndex,
  deleteIndex,
  checkIfIndexExist,
  insertDataUnpaywall,
  countDocuments,
};
