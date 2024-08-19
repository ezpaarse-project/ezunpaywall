const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');

const ping = require('./utils/ping');

const {
  loadDevAPIKey,
  deleteAllAPIKey,
} = require('./utils/apikey');

chai.use(chaiHttp);

const adminURL = process.env.ADMIN_URL || 'http://localhost:59703';

describe('Test: apikey service', () => {
  before(async () => {
    await ping();
  });

  before(async () => {
    await ping();
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });

  it('Should access apikey', async () => {
    const res = await chai
      .request(adminURL)
      .get('/apikeys')
      .set('x-api-key', 'changeme');

    expect(res).have.status(200);
  });

  it('Shouldn`t access apikey because wrong api key', async () => {
    const res = await chai
      .request(adminURL)
      .get('/apikeys')
      .set('x-api-key', 'hello');

    expect(res).have.status(401);
  });

  it('Shouldn`t access apikey because no api key', async () => {
    const res = await chai
      .request(adminURL)
      .get('/apikeys');

    expect(res).have.status(401);
  });

  after(async () => {
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });
});
