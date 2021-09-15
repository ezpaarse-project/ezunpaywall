const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');
const ping = require('./utils/ping');
const {
  redisClient,
  pingRedis,
  load,
} = require('./utils/redis');

const authURL = process.env.AUTH_URL || 'http://localhost:6000';

describe('Test: auth service', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
  });

  describe('Test: Get config of apikey', () => {
    it('Should get config of apikey', async () => {
      const res = await chai
        .request(authURL)
        .get('/config')
        .set('X-API-KEY', 'user');

      expect(res).have.status(200);
      expect(res.body).have.property('name').equal('user');
      expect(res.body).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
      expect(res.body).have.property('attributes').equal('*');
      expect(res.body).have.property('allowed').equal(true);
    });

    it('Shouldn\'t get config of apikey because this apikey doesn\'t exist', async () => {
      const res = await chai
        .request(authURL)
        .get('/config')
        .set('X-API-KEY', 'doen\'t exist');

      expect(res).have.status(404);
    });

    it('Shouldn\'t get config of apikey because no apikey send', async () => {
      const res = await chai
        .request(authURL)
        .get('/config');

      expect(res).have.status(400);
    });
  });

  describe('Test: Create apikey', () => {
    let id;
    before(async () => {

    });
    it('Should create apikey', async () => {
      const res = await chai
        .request(authURL)
        .post('/key/create')
        .set('X-API-KEY', 'admin');

      console.log(res.status);
      console.lob(res.body);
      expect(res).have.status(200);
      id = res.body;
      console.log(res.body);
    });

    it('Shouldn\'t create apikey because it\'s already exist', async () => {

    });
    after(async () => {
      await redisClient.del('id');
    });
  });

  describe('Test: Update apikey', () => {
    it('Should update config.name of apikey', async () => {

    });

    it('Should update config.access of apikey', async () => {

    });

    it('Should update config.attributes of apikey', async () => {

    });

    it('Should update config.allowed of apikey', async () => {

    });

    it('Shouldn\'t update config.access because wrong format', async () => {

    });

    it('Shouldn\'t update config.access because wrong service', async () => {

    });

    it('Shouldn\'t update config.attributes because wrong format', async () => {

    });

    it('Shouldn\'t update config.attributes because wrong attributes', async () => {

    });

    it('Shouldn\'t update config.allowed because wrong format', async () => {

    });
  });

  describe('Test: Delete apikey', () => {
    it('Should delete apikey', async () => {

    });

    it('Shouldn\'t delete apikey because it\'s doesn\'t exist', async () => {

    });

    it('Shouldn\'t delete apikey because it\'s the super user', async () => {

    });
  });

  describe('Test: access to auth service', () => {
    it('Should access apikey', async () => {

    });

    it('Shouldn`t access apikey because wrong api key', async () => {

    });

    it('Shouldn`t access apikey because no api key', async () => {

    });
  });
});
