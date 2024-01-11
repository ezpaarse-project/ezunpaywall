/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const reset = require('./utils/reset');

const ping = require('./utils/ping');

chai.use(chaiHttp);

const updateURL = process.env.UPDATE_HOST || 'http://localhost:59702';

describe('Test: cron manage', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
  });

  describe('Test: get config of cron', () => {
    before(async () => {
      await reset();
    });

    it('Should return config of cron', async () => {
      const res = await chai.request(updateURL)
        .get('/cron/unpaywall');

      expect(res).have.status(200);

      expect(res.body).have.property('schedule').equal('0 0 0 * * *');
      expect(res.body).have.property('active').equal(false);
      expect(res.body).have.property('index').equal('unpaywall');
      expect(res.body).have.property('interval').equal('day');
    });
  });

  describe('Test: update time config of cron', () => {
    before(async () => {
      await reset();
    });

    it('Should return updated config of cron', async () => {
      const res = await chai.request(updateURL)
        .patch('/cron/unpaywall')
        .send({ time: '0 0 0 1 * *' })
        .set('x-api-key', 'changeme');

      expect(res).have.status(200);

      expect(res.body).have.property('schedule').equal('0 0 0 1 * *');
      expect(res.body).have.property('active').equal(false);
      expect(res.body).have.property('index').equal('unpaywall');
      expect(res.body).have.property('interval').equal('day');
    });
  });

  describe('Test: update status config of cron', () => {
    before(async () => {
      await reset();
    });

    it('Should return updated config of cron', async () => {
      const res = await chai.request(updateURL)
        .patch('/cron/unpaywall')
        .send({ index: 'unpaywall2' })
        .set('x-api-key', 'changeme');

      expect(res).have.status(200);

      expect(res.body).have.property('schedule').equal('0 0 0 * * *');
      expect(res.body).have.property('active').equal(false);
      expect(res.body).have.property('index').equal('unpaywall2');
      expect(res.body).have.property('interval').equal('day');
    });
  });

  describe('Test: update status config of cron', () => {
    before(async () => {
      await reset();
    });

    it('Should return updated config of cron', async () => {
      const res = await chai.request(updateURL)
        .patch('/cron/unpaywall')
        .send({ interval: 'week' })
        .set('x-api-key', 'changeme');

      expect(res).have.status(200);

      expect(res.body).have.property('schedule').equal('0 0 0 * * *');
      expect(res.body).have.property('active').equal(false);
      expect(res.body).have.property('index').equal('unpaywall');
      expect(res.body).have.property('interval').equal('week');
    });
  });

  describe('Test: update time config of cron without admin apikey', () => {
    before(async () => {
      await reset();
    });

    it('Should return a status code 401', async () => {
      const res = await chai.request(updateURL)
        .patch('/cron/unpaywall')
        .send({ interval: 'week' });

      expect(res).have.status(401);
    });
  });

  describe('Test: update time config of cron with wrong admin apikey', () => {
    before(async function () {
      this.timeout(30000);
      await reset();
    });

    it('Should return a status code 401', async () => {
      const res = await chai.request(updateURL)
        .patch('/cron/unpaywall')
        .send({ interval: 'week' })
        .set('x-api-key', 'wrong apikey');

      expect(res).have.status(401);
    });
  });

  describe('Test: update start update cron', () => {
    before(async () => {
      await reset();
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/cron/unpaywall/start')
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should return updated config of cron', async () => {
      const res = await chai.request(updateURL)
        .get('/cron/unpaywall');

      expect(res).have.status(200);

      expect(res.body).have.property('schedule').equal('0 0 0 * * *');
      expect(res.body).have.property('active').equal(true);
      expect(res.body).have.property('index').equal('unpaywall');
      expect(res.body).have.property('interval').equal('day');
    });
  });

  describe('Test: update start update cron', () => {
    before(async () => {
      await reset();
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/cron/unpaywall/stop')
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should return updated config of cron', async () => {
      const res = await chai.request(updateURL)
        .get('/cron/unpaywall');

      expect(res).have.status(200);

      expect(res.body).have.property('schedule').equal('0 0 0 * * *');
      expect(res.body).have.property('active').equal(false);
      expect(res.body).have.property('index').equal('unpaywall');
      expect(res.body).have.property('interval').equal('day');
    });
  });
});
