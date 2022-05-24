const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');

const ping = require('./utils/ping');

const {
  loadDevAPIKey,
  deleteAllAPIKey,
} = require('./utils/apikey');

chai.use(chaiHttp);

const apikeyURL = process.env.APIKEY_URL || 'http://localhost:7000';

describe('Test: Create apikey', () => {
  before(async () => {
    await ping();
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });

  it('Should create apikey with all config', async () => {
    const res = await chai
      .request(apikeyURL)
      .post('/create')
      .send({
        name: 'test-user1',
        access: ['graphql'],
        attributes: ['*'],
        allowed: true,
      })
      .set('redis-password', 'changeme');
    expect(res).have.status(200);

    expect(res.body).have.property('apikey').to.not.equal(undefined);
    expect(res.body.config).have.property('name').equal('test-user1');
    expect(res.body.config).have.property('access').to.be.an('array').eql(['graphql']);
    expect(res.body.config).have.property('attributes').to.be.an('array').eql(['*']);
    expect(res.body.config).have.property('allowed').equal(true);
  });

  it('Should create apikey with only name', async () => {
    const res = await chai
      .request(apikeyURL)
      .post('/create')
      .send({
        name: 'test-user2',
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').to.not.equal(undefined);
    expect(res.body.config).have.property('name').equal('test-user2');
    expect(res.body.config).have.property('access').to.be.an('array').eql(['graphql']);
    expect(res.body.config).have.property('attributes').to.be.an('array').eql(['*']);
    expect(res.body.config).have.property('allowed').equal(true);
  });

  it('Shouldn\'t create apikey because it\'s already exist', async () => {
    const res = await chai
      .request(apikeyURL)
      .post('/create')
      .send({
        name: 'test-user1',
        access: ['graphql'],
        attributes: ['*'],
        allowed: true,
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(409);
  });

  it('Shouldn\'t create apikey because config.access are in wrong format', async () => {
    const res = await chai
      .request(apikeyURL)
      .post('/create')
      .send({
        name: 'test-user1',
        access: 'hello',
        attributes: ['*'],
        allowed: true,
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
  });

  it('Shouldn\'t create apikey because config.access "test" doesn\'t exist', async () => {
    const res = await chai
      .request(apikeyURL)
      .post('/create')
      .send({
        name: 'test-user1',
        access: ['test'],
        attributes: ['*'],
        allowed: true,
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
  });

  it('Shouldn\'t create apikey because config.attributes are in wrong format', async () => {
    const res = await chai
      .request(apikeyURL)
      .post('/create')
      .send({
        name: 'test-user1',
        access: ['graphql'],
        attributes: 1,
        allowed: true,
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
  });

  it('Shouldn\'t create apikey because config.attributes "test" doesn\'t exist', async () => {
    const res = await chai
      .request(apikeyURL)
      .post('/create')
      .send({
        name: 'test-user1',
        access: ['graphql'],
        attributes: 'test',
        allowed: true,
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
  });

  it('Shouldn\'t create apikey because config.allowed are in wrong format', async () => {
    const res = await chai
      .request(apikeyURL)
      .post('/create')
      .send({
        name: 'test-user1',
        access: ['graphql'],
        attributes: ['*'],
        allowed: 1,
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
  });

  after(async () => {
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });
});
