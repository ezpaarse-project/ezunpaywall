const path = require('path');
const fs = require('fs-extra');
const uuid = require('uuid');

const { logger } = require('../../lib/logger');

const statusDir = path.resolve(__dirname, '..', '..', 'out', 'status');

const createState = async () => {
  const state = {
    loaded: 0,
    linesRead: 0,
    enrichedLines: 0,
    startDate: Date.now(),
    endDate: null,
    status: 'enrich',
  };
  const id = uuid.v4();
  const filename = `${id}.json`;

  try {
    await fs.writeFileSync(path.resolve(statusDir, filename), JSON.stringify(state, null, 2));
  } catch (err) {
    logger.error(`createState: ${err}`);
  }
  return `${filename}`;
};

const updateState = async (file, state) => {
  try {
    await fs.writeFileSync(path.resolve(statusDir, file), JSON.stringify(state, null, 2));
  } catch (err) {
    logger.error(`updateState: ${err}`);
  }
};

const incrementlinesRead = async (file, linesRead) => {
  let state;
  try {
    state = await fs.readFile(path.resolve(statusDir, file), 'utf-8');
  } catch (err) {
    logger.error(`incrementlinesRead: ${err}`);
  }
  const stateParsed = JSON.parse(state);
  stateParsed.linesRead += linesRead;
  updateState(file, stateParsed);
};

const incrementenrichedLines = async (file, enrichedLines) => {
  let state;
  try {
    state = await fs.readFile(path.resolve(statusDir, file), 'utf-8');
  } catch (err) {
    logger.error(`incrementenrichedLines: ${err}`);
  }
  const stateParsed = JSON.parse(state);
  stateParsed.enrichedLines += enrichedLines;
  updateState(file, stateParsed);
};

const incrementLoaded = async (file, loaded) => {
  let state;
  try {
    state = await fs.readFile(path.resolve(statusDir, file), 'utf-8');
  } catch (err) {
    logger.error(`incrementLoaded: ${err}`);
  }
  const stateParsed = JSON.parse(state);
  stateParsed.loaded = loaded;
  updateState(file, stateParsed);
};

const updateStatus = async (file, status) => {
  let state;
  try {
    state = await fs.readFile(path.resolve(statusDir, file), 'utf-8');
  } catch (err) {
    logger.error(`updateStatus: ${err}`);
  }
  const stateParsed = JSON.parse(state);
  stateParsed.status = status;
  updateState(file, stateParsed);
};

const endState = async (file) => {
  let state;
  try {
    state = await fs.readFile(path.resolve(statusDir, file), 'utf-8');
  } catch (err) {
    logger.error(`endState: ${err}`);
  }
  const stateParsed = JSON.parse(state);
  stateParsed.endDate = Date.now();
  stateParsed.status = 'done';
  updateState(file, stateParsed);
};

const getState = async (file) => {
  let state;
  try {
    state = await fs.readFile(path.resolve(statusDir, file), 'utf-8');
  } catch (err) {
    logger.error(`getState: ${err}`);
  }
  return JSON.parse(state);
};

module.exports = {
  createState,
  incrementlinesRead,
  incrementenrichedLines,
  incrementLoaded,
  updateStatus,
  endState,
  getState,
};
