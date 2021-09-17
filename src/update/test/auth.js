const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const {
  updateChangeFile,
} = require('./utils/snapshot');

const {
  ping,
} = require('./utils/ping');

const {
  checkIfInUpdate,
} = require('./utils/status');

chai.use(chaiHttp);

const updateURL = process.env.UPDATE_URL || 'http://localhost:4000';

describe('Test: auth service in update service', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
    await updateChangeFile('week');
  });

  describe('Test with update API key', () => {
    it('Should return a succes message', async () => {
      const res = await chai.request(updateURL)
        .post('/job')
        .send({
          index: 'unpaywall-test',
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('X-API-KEY', 'admin');

      // test insertion
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        isUpdate = await checkIfInUpdate();
      }
      expect(res).have.status(200);
      expect(res?.body).have.property('message').eq('Weekly update started');
    });
  });

  describe('Test without API key', () => {
    it('Should return a error message', async () => {
      const res = await chai.request(updateURL)
        .post('/job')
        .send({
          filename: 'fake1.jsonl.gz',
          index: 'unpaywall-test',
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');

      expect(res).have.status(401);
      expect(res?.body).have.property('message').eq('Not authorized');
    });
  });

  describe('Test with wrong API key', () => {
    it('Should return a error message', async () => {
      const res = await chai.request(updateURL)
        .post('/job')
        .send({
          filename: 'fake1.jsonl.gz',
          index: 'unpaywall-test',
        })
        .query({ index: 'unpaywall-test' })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('X-API-KEY', 'wrong apikey');

      expect(res).have.status(401);
      expect(res?.body).have.property('message').eq('Not authorized');
    });
  });

  describe('Test with enrich API key', () => {
    it('Should return a error message', async () => {
      const res = await chai.request(updateURL)
        .post('/job')
        .send({
          index: 'unpaywall-test',
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('X-API-KEY', 'enrich');

      expect(res).have.status(401);
      expect(res?.body).have.property('message').eq('Not authorized');
    });
  });

  describe('Test with graphql API key', () => {
    it('Should return a error message', async () => {
      const res = await chai.request(updateURL)
        .post('/job')
        .send({
          index: 'unpaywall-test',
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('X-API-KEY', 'graphql');

      expect(res).have.status(401);
      expect(res?.body).have.property('message').eq('Not authorized');
    });
  });

  describe('Test with notAllowed API key', () => {
    it('Should return a error message', async () => {
      const res = await chai.request(updateURL)
        .post('/job')
        .send({
          index: 'unpaywall-test',
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('X-API-KEY', 'notAllowed');

      expect(res).have.status(401);
      expect(res?.body).have.property('message').eq('Not authorized');
    });
  });
});
