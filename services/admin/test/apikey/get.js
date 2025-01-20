const isEqual = require('lodash.isequal');
const path = require('path');
const chai = require('chai');
const fsp = require('fs/promises');
const { expect } = require('chai');
const chaiHttp = require('chai-http');

const ping = require('./utils/ping');
const {
  loadDevAPIKey,
  deleteAllAPIKey,
} = require('./utils/apikey');

chai.use(chaiHttp);

const adminURL = process.env.ADMIN_URL || 'http://localhost:59703';

describe('Test: Get config of apikey', () => {
  before(async () => {
    await ping();
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });

  it('Should get config of apikey', async () => {
    const res = await chai
      .request(adminURL)
      .get('/apikeys/user');

    expect(res).have.status(200);
    expect(res.body).have.property('name').equal('user');
    expect(res.body).have.property('owner').equal('dev');
    expect(res.body).have.property('description').equal('user dev apikey');
    expect(res.body).have.property('createdAt').equal('2021-06-01');
    expect(res.body).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
    expect(res.body).have.property('attributes').eql(['*']);
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Should get all apikey', async () => {
    const res = await chai
      .request(adminURL)
      .get('/apikeys')
      .set('x-api-key', 'changeme');

    expect(res).have.status(200);

    const apikeys = res.body;
    let apikeyDev = await fsp.readFile(path.resolve(__dirname, '..', '..', 'apikey-dev.json'));
    apikeyDev = JSON.parse(apikeyDev);

    function sortApikey(a, b) {
      if (a.config.name < b.config.name) { return -1; }
      if (a.config.name > b.config.name) { return 1; }
      return 0;
    }

    apikeyDev.sort(sortApikey);
    apikeys.sort(sortApikey);

    const equal = isEqual(apikeys, apikeyDev);

    expect(equal).equal(true);
  });

  it('Shouldn\'t get config of apikey because apikey "test" doesn\'t exist', async () => {
    const res = await chai
      .request(adminURL)
      .get('/apikeys/test');

    expect(res).have.status(404);
  });
});
