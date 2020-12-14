const { logger } = require('../../lib/logger');

const {
  insertDatasHLM,
} = require('./steps');

const insertionHLM = async (name) => {
  await insertDatasHLM(name);
};

module.exports = {
  insertionHLM,
}