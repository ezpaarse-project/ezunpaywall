const isEqual = require('lodash.isequal');
const path = require('path');
const chai = require('chai');
const fs = require('fs-extra');
const { expect } = require('chai');
const chaiHttp = require('chai-http');

const ping = require('./utils/ping');
const {
  load,
  deleteAll,
} = require('./utils/redis');

chai.use(chaiHttp);

const authURL = process.env.AUTH_URL || 'http://localhost:7000';

describe('Test: Get config of apikey', () => {
  before(async () => {
    await ping();
    await deleteAll();
    await load();
  });

  it('Should get config of apikey', async () => {
    const res = await chai
      .request(authURL)
      .get('/config')
      .set('x-api-key', 'user');

    expect(res).have.status(200);
    expect(res.body).have.property('name').equal('user');
    expect(res.body).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
    expect(res.body).have.property('attributes').equal('*');
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Should get all apikey', async () => {
    const res = await chai
      .request(authURL)
      .get('/all')
      .set('redis-password', 'changeme');

    expect(res).have.status(200);

    const { keys } = res.body;
    let apikeyDev = await fs.readFile(path.resolve(__dirname, '..', 'apikey-dev.json'));
    apikeyDev = JSON.parse(apikeyDev);

    const equal = isEqual(keys, apikeyDev);

    expect(equal).equal(true);
  });

  it('Shouldn\'t get config of apikey because this apikey doesn\'t exist', async () => {
    const res = await chai
      .request(authURL)
      .get('/config')
      .set('x-api-key', 'hello');

    expect(res).have.status(404);
    expect(res.body).have.property('message').equal('[hello] apikey doesn\'t exist');
  });

  it('Shouldn\'t get config of apikey because no apikey are send', async () => {
    const res = await chai
      .request(authURL)
      .get('/config');

    expect(res).have.status(400);
    expect(res.body).have.property('message').equal('apikey expected');
  });
});
