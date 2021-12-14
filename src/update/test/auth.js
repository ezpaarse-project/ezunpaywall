const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const {
  deleteFile,
  updateChangeFile,
} = require('./utils/snapshot');

const {
  deleteIndex,
} = require('./utils/elastic');

const {
  ping,
} = require('./utils/ping');

const {
  checkIfInUpdate,
} = require('./utils/status');

const {
  loadDevAPIKey,
  deleteAllAPIKey,
} = require('./utils/apikey');

chai.use(chaiHttp);

const updateURL = process.env.UPDATE_URL || 'http://localhost:4000';

describe('Test: auth service in update service', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
    await deleteAllAPIKey();
    await loadDevAPIKey();
    await updateChangeFile('week');
    await deleteFile('fake1.jsonl.gz');
    await deleteFile('fake2.jsonl.gz');
    await deleteFile('fake3.jsonl.gz');
    await deleteIndex('unpaywall-test');
  });

  describe('Test with update API key', () => {
    it('Should return status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/period')
        .send({
          index: 'unpaywall-test',
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('x-api-key', 'admin');

      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        isUpdate = await checkIfInUpdate();
      }
      expect(res).have.status(202);
    });
  });

  describe('Test without API key', () => {
    it('Should return a status code 401', async () => {
      const res = await chai.request(updateURL)
        .post('/job/period')
        .send({
          index: 'unpaywall-test',
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');

      expect(res).have.status(401);
    });
  });

  describe('Test with wrong API key', () => {
    it('Should return a status code 401', async () => {
      const res = await chai.request(updateURL)
        .post('/job/period')
        .send({
          index: 'unpaywall-test',
        })
        .query({ index: 'unpaywall-test' })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('x-api-key', 'wrong apikey');

      expect(res).have.status(401);
    });
  });

  describe('Test with enrich API key', () => {
    it('Should return a status code 401', async () => {
      const res = await chai.request(updateURL)
        .post('/job/period')
        .send({
          index: 'unpaywall-test',
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('x-api-key', 'enrich');

      expect(res).have.status(401);
    });
  });

  describe('Test with graphql API key', () => {
    it('Should return a status code 401', async () => {
      const res = await chai.request(updateURL)
        .post('/job/period')
        .send({
          index: 'unpaywall-test',
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('x-api-key', 'graphql');

      expect(res).have.status(401);
    });
  });

  describe('Test with notAllowed API key', () => {
    it('Should return a status code 401', async () => {
      const res = await chai.request(updateURL)
        .post('/job/period')
        .send({
          index: 'unpaywall-test',
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('x-api-key', 'notAllowed');

      expect(res).have.status(401);
    });
  });
  after(async () => {
    await deleteIndex('unpaywall-test');
    await deleteFile('fake1.jsonl.gz');
    await deleteFile('fake2.jsonl.gz');
    await deleteFile('fake3.jsonl.gz');
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });
});
