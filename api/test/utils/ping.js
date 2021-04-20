/* eslint-disable no-await-in-loop */
const chai = require('chai');

const client = require('../../lib/client');
const { logger } = require('../../lib/logger');

const api = require('../../app');
const fakeUnpaywall = require('../../../fakeUnpaywall/app');

const ezunpaywallURL = 'http://localhost:8080';
const fakeUnpaywallURL = 'http://localhost:12000';

const ping = async () => {
  let res1;
  while (res1?.status !== 200 && res1?.body?.data !== 'pong') {
    try {
      res1 = await chai.request(ezunpaywallURL).get('/ping');
    } catch (err) {
      logger.error(`ezunpaywall ping : ${err}`);
    }
    await new Promise((resolve) => setTimeout(resolve(), 1000));
  }
  // wait fakeUnpaywall
  let res2;
  while (res2?.body?.data !== 'pong') {
    try {
      res2 = await chai.request(fakeUnpaywallURL).get('/ping');
    } catch (err) {
      logger.error(`fakeUnpaywall ping : ${err}`);
    }
    await new Promise((resolve) => setTimeout(resolve(), 1000));
  }
  // wait elastic started
  let res3;
  while (res3?.statusCode !== 200) {
    try {
      res3 = await client.ping();
    } catch (err) {
      logger.error(`elastic ping : ${err}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

module.exports = {
  ping,
};
