const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');

const ping = require('./utils/ping');
const {
  load,
  deleteAll,
} = require('./utils/redis');

chai.use(chaiHttp);

const authURL = process.env.AUTH_URL || 'http://localhost:7000';

describe('Test: auth service', () => {
  before(async () => {
    await ping();
  });

  before(async () => {
    await ping();
    await deleteAll();
    await load();
  });

  it('Should access apikey', async () => {
    const res = await chai
      .request(authURL)
      .get('/all')
      .set('redis-password', 'changeme');

    expect(res).have.status(200);
  });

  it('Shouldn`t access apikey because wrong api key', async () => {
    const res = await chai
      .request(authURL)
      .get('/all')
      .set('redis-password', 'hello');

    expect(res).have.status(401);
  });

  it('Shouldn`t access apikey because no api key', async () => {
    const res = await chai
      .request(authURL)
      .get('/all');

    expect(res).have.status(401);
  });

  after(async () => {
    await deleteAll();
  });
});
