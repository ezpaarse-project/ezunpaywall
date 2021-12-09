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

describe('Test: Update apikey', () => {
  before(async () => {
    await ping();
  });

  beforeEach(async () => {
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });

  it('Should update config.name to "new-name" for the apikey "user"', async () => {
    const res = await chai
      .request(apikeyURL)
      .put('/update')
      .send({
        apikey: 'user',
        name: 'new-name',
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').equal('user');
    expect(res.body).have.property('name').equal('new-name');
    expect(res.body).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
    expect(res.body).have.property('attributes').to.be.an('array').eql(['*']);
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Should update config.access to "update" for the apikey "user"', async () => {
    const res = await chai
      .request(apikeyURL)
      .put('/update')
      .send({
        apikey: 'user',
        access: ['update'],
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').equal('user');
    expect(res.body).have.property('name').equal('user');
    expect(res.body).have.property('access').to.be.an('array').eql(['update']);
    expect(res.body).have.property('attributes').to.be.an('array').eql(['*']);
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Should update config.attributes to "doi" for the apikey "user"', async () => {
    const res = await chai
      .request(apikeyURL)
      .put('/update')
      .send({
        apikey: 'user',
        attributes: ['doi'],
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').equal('user');
    expect(res.body).have.property('name').equal('user');
    expect(res.body).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
    expect(res.body).have.property('attributes').to.be.an('array').eql(['doi']);
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Should update config.attributes to "doi,is_oa" for the apikey "user"', async () => {
    const res = await chai
      .request(apikeyURL)
      .put('/update')
      .send({
        apikey: 'user',
        attributes: ['doi', 'is_oa'],
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').equal('user');
    expect(res.body).have.property('name').equal('user');
    expect(res.body).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
    expect(res.body).have.property('attributes').to.be.an('array').eql(['doi', 'is_oa']);
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Should update config.allowed to "false" for the apikey "user"', async () => {
    const res = await chai
      .request(apikeyURL)
      .put('/update')
      .send({
        apikey: 'user',
        allowed: false,
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').equal('user');
    expect(res.body).have.property('name').equal('user');
    expect(res.body).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
    expect(res.body).have.property('attributes').to.be.an('array').eql(['*']);
    expect(res.body).have.property('allowed').equal(false);
  });

  it('Should update config.allowed to "true" for the apikey "notAllowed"', async () => {
    const res = await chai
      .request(apikeyURL)
      .put('/update')
      .send({
        apikey: 'notAllowed',
        allowed: true,
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').equal('notAllowed');
    expect(res.body).have.property('name').equal('notAllowed');
    expect(res.body).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
    expect(res.body).have.property('attributes').to.be.an('array').eql(['*']);
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Should update config.name to "new-user" and config.access to "update" for the apikey "user"', async () => {
    const res = await chai
      .request(apikeyURL)
      .put('/update')
      .send({
        apikey: 'user',
        name: 'new-user',
        access: ['update'],
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').equal('user');
    expect(res.body).have.property('name').equal('new-user');
    expect(res.body).have.property('access').to.be.an('array').eql(['update']);
    expect(res.body).have.property('attributes').to.be.an('array').eql(['*']);
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Shouldn\'t update config.access for the apikey "user" because "hello" doesn\'t exist', async () => {
    const res = await chai
      .request(apikeyURL)
      .put('/update')
      .send({
        apikey: 'user',
        access: ['hello'],
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
  });

  it('Shouldn\'t update config.attributes for the apikey "user" because "hello" doesn\'t exist', async () => {
    const res = await chai
      .request(apikeyURL)
      .put('/update')
      .send({
        apikey: 'user',
        attributes: ['hello'],
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
  });

  it('Shouldn\'t update config.allowed for the apikey "user" because "maybe" doesn\'t exist', async () => {
    const res = await chai
      .request(apikeyURL)
      .put('/update')
      .send({
        apikey: 'user',
        allowed: 'maybe',
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
  });

  after(async () => {
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });
});
