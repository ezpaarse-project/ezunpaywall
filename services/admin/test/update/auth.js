const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const {
  deleteChangefile,
  updateChangefile,
} = require('./utils/changefile');

const {
  deleteIndex,
} = require('./utils/elastic');

const ping = require('./utils/ping');

const checkStatus = require('./utils/status');

chai.use(chaiHttp);

const adminURL = process.env.ADMIN_URL || 'http://localhost:59703';

describe('Test: auth service in update service', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
    await updateChangefile('week');
    await deleteChangefile('fake1.jsonl.gz');
    await deleteChangefile('fake2.jsonl.gz');
    await deleteChangefile('fake3.jsonl.gz');
    await deleteIndex('unpaywall-test');
  });

  describe('Test with admin API key', () => {
    it('Should return status code 202', async () => {
      const res = await chai.request(adminURL)
        .post('/job/changefile/download/insert')
        .send({
          index: 'unpaywall-test',
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('x-api-key', 'changeme');

      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => { setTimeout(resolve, 100); });
        isUpdate = await checkStatus();
      }
      expect(res).have.status(202);
    });
  });

  describe('Test without API key', () => {
    it('Should return a status code 401', async () => {
      const res = await chai.request(adminURL)
        .post('/job/changefile/download/insert')
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
      const res = await chai.request(adminURL)
        .post('/job/changefile/download/insert')
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

  after(async () => {
    await deleteIndex('unpaywall-test');
    await deleteChangefile('fake1.jsonl.gz');
    await deleteChangefile('fake2.jsonl.gz');
    await deleteChangefile('fake3.jsonl.gz');
  });
});
