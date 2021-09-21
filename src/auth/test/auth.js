const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');
const ping = require('./utils/ping');

chai.use(chaiHttp);

const {
  redisClient,
  pingRedis,
  load,
} = require('./utils/redis');

const authURL = process.env.AUTH_URL || 'http://localhost:7000';

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
    before(async () => {
      // TODO
    });
    it('Should create apikey', async () => {
      await chai
        .request(authURL)
        .post('/key/create')
        .set('X-API-KEY', 'admin');

      // TODO

      // expect(res).have.status(200);
    });

    it('Shouldn\'t create apikey because it\'s already exist', async () => {
      // TODO
    });
    after(async () => {
      // await redisClient.del('id');
    });
  });

  describe('Test: Update apikey', () => {
    it('Should update config.name of apikey', async () => {
      // TODO
    });

    it('Should update config.access of apikey', async () => {
      // TODO
    });

    it('Should update config.attributes of apikey', async () => {
      // TODO
    });

    it('Should update config.allowed of apikey', async () => {
      // TODO
    });

    it('Shouldn\'t update config.access because wrong format', async () => {
      // TODO
    });

    it('Shouldn\'t update config.access because wrong service', async () => {
      // TODO
    });

    it('Shouldn\'t update config.attributes because wrong format', async () => {
      // TODO
    });

    it('Shouldn\'t update config.attributes because wrong attributes', async () => {
      // TODO
    });

    it('Shouldn\'t update config.allowed because wrong format', async () => {
      // TODO
    });
  });

  describe('Test: Delete apikey', () => {
    it('Should delete apikey', async () => {
      // TODO
    });

    it('Shouldn\'t delete apikey because it\'s doesn\'t exist', async () => {
      // TODO
    });

    it('Shouldn\'t delete apikey because it\'s the super user', async () => {
      // TODO
    });
  });

  describe('Test: access to auth service', () => {
    it('Should access apikey', async () => {
      // TODO
    });

    it('Shouldn`t access apikey because wrong api key', async () => {
      // TODO
    });

    it('Shouldn`t access apikey because no api key', async () => {
      // TODO
    });
  });
});
