const request = require('supertest');
const { apikey, cron } = require('config');
const app = require('../../src/app');

const { dataUpdate, dataUpdateHistory } = cron;

async function resetDataUpdateCron() {
  const body = {
    schedule: dataUpdate.schedule,
    index: dataUpdate.index,
    interval: dataUpdate.interval,
  };

  let response;

  try {
    response = await request(app)
      .patch('/cron/dataUpdate')
      .send(body)
      .set('x-api-key', apikey);
  } catch (err) {
    console.error('[test][utils][cron]: Cannot reset data update cron');
    console.error(err);
  }
  return response.body;
}

async function stopDataUpdateCron() {
  let response;

  try {
    response = await request(app)
      .post('/cron/dataUpdate/stop')
      .set('x-api-key', apikey);
  } catch (err) {
    console.error('[test][utils][cron]: Cannot stop data update cron');
    console.error(err);
  }
  return response.body;
}

async function resetDataUpdateHistoryCron() {
  const body = {
    schedule: dataUpdateHistory.schedule,
    index: dataUpdateHistory.index,
    indexHistory: dataUpdateHistory.indexHistory,
    interval: dataUpdateHistory.interval,
  };

  let response;

  try {
    response = await request(app)
      .patch('/cron/dataUpdateHistory')
      .send(body)
      .set('x-api-key', apikey);
  } catch (err) {
    console.error('[test][utils][cron]: Cannot reset data update history cron');
    console.error(err);
  }
  return response.body;
}

async function stopDataUpdateHistoryCron() {
  let response;

  try {
    response = await request(app)
      .post('/cron/dataUpdateHistory/stop')
      .set('x-api-key', apikey);
  } catch (err) {
    console.error('[test][utils][cron]: Cannot stop data update history cron');
    console.error(err);
  }
  return response.body;
}

module.exports = {
  resetDataUpdateCron,
  stopDataUpdateCron,
  resetDataUpdateHistoryCron,
  stopDataUpdateHistoryCron,
};
