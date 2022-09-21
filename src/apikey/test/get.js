const isEqual = require('lodash.isequal');
const path = require('path');
const chai = require('chai');
const fs = require('fs-extra');
const { expect } = require('chai');
const chaiHttp = require('chai-http');

const ping = require('./utils/ping');
const {
  loadDevAPIKey,
  deleteAllAPIKey,
} = require('./utils/apikey');

chai.use(chaiHttp);

const apikeyURL = process.env.APIKEY_HOST || 'http://localhost:59704';

describe('Test: Get config of apikey', () => {
  before(async () => {
    await ping();
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });

  it('Should get config of apikey', async () => {
    const res = await chai
      .request(apikeyURL)
      .get('/keys/user');

    expect(res).have.status(200);
    expect(res.body).have.property('name').equal('user');
    expect(res.body).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
    expect(res.body).have.property('attributes').eql(['*']);
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Should get all apikey', async () => {
    const res = await chai
      .request(apikeyURL)
      .get('/keys')
      .set('redis-password', 'changeme');

    expect(res).have.status(200);

    const keys = res.body;
    let apikeyDev = await fs.readFile(path.resolve(__dirname, '..', 'apikey-dev.json'));
    apikeyDev = JSON.parse(apikeyDev);

    const equal = isEqual(keys, apikeyDev);

    expect(equal).equal(true);
  });

  it('Shouldn\'t get config of apikey because apikey "test" doesn\'t exist', async () => {
    const res = await chai
      .request(apikeyURL)
      .get('/keys/test');

    expect(res).have.status(404);
  });
});
