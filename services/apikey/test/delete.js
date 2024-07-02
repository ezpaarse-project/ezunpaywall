const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');

const ping = require('./utils/ping');
const {
  loadDevAPIKey,
  deleteAllAPIKey,
} = require('./utils/apikey');

chai.use(chaiHttp);

const apikeyURL = process.env.APIKEY_HOST || 'http://localhost:59704';

describe('Test: Delete apikey', () => {
  before(async () => {
    await ping();
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });

  it('Should delete apikey', async () => {
    let res = await chai
      .request(apikeyURL)
      .delete('/keys/user')
      .set('x-api-key', 'changeme');

    expect(res).have.status(204);

    res = await chai
      .request(apikeyURL)
      .get('/keys/user');

    expect(res).have.status(404);
  });

  it('Shouldn\'t delete apikey because test apikey doesn\'t exist', async () => {
    const res = await chai
      .request(apikeyURL)
      .delete('/keys/test')
      .set('x-api-key', 'changeme');

    expect(res).have.status(404);
  });

  after(async () => {
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });
});
