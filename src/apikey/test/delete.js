const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');

const ping = require('./utils/ping');
const {
  loadDevAPIKey,
  deleteAllAPIKey,
} = require('./utils/apikey');

chai.use(chaiHttp);

const apikeyURL = process.env.AUTH_URL || 'http://localhost:7000';

describe('Test: Delete apikey', () => {
  before(async () => {
    await ping();
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });

  it('Should delete apikey', async () => {
    const res = await chai
      .request(apikeyURL)
      .delete('/keys/user')
      .set('redis-password', 'changeme');

    expect(res).have.status(204);
  });

  it('Shouldn\'t delete apikey because test apikey doesn\'t exist', async () => {
    const res = await chai
      .request(apikeyURL)
      .delete('/keys/test')
      .set('redis-password', 'changeme');

    expect(res).have.status(404);
  });

  after(async () => {
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });
});
