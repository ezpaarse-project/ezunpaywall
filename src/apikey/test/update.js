const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');

const ping = require('./utils/ping');
const {
  load,
  deleteAll,
} = require('./utils/redis');

chai.use(chaiHttp);

const apikeyURL = process.env.AUTH_URL || 'http://localhost:7000';

describe('Test: Update apikey', () => {
  before(async () => {
    await ping();
  });

  beforeEach(async () => {
    await deleteAll();
    await load();
  });

  it('Should update config.name of apikey', async () => {
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
    expect(res.body).have.property('attributes').equal('*');
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Should update config.access of apikey', async () => {
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
    expect(res.body.access[0]).equal('update');
    expect(res.body).have.property('attributes').equal('*');
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Should update config.attributes of apikey', async () => {
    const res = await chai
      .request(apikeyURL)
      .put('/update')
      .send({
        apikey: 'user',
        attributes: 'doi',
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').equal('user');
    expect(res.body).have.property('name').equal('user');
    expect(res.body).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
    expect(res.body).have.property('attributes').equal('doi');
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Should update config.allowed to false of apikey', async () => {
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
    expect(res.body).have.property('attributes').equal('*');
    expect(res.body).have.property('allowed').equal(false);
  });

  it('Should update config.allowed to true of apikey', async () => {
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
    expect(res.body).have.property('attributes').equal('*');
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Should update config.name and config.access of apikey', async () => {
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
    expect(res.body).have.property('attributes').equal('*');
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Shouldn\'t update config.access because wrong format', async () => {
    const res = await chai
      .request(apikeyURL)
      .put('/update')
      .send({
        apikey: 'user',
        access: 'hello',
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
  });

  it('Shouldn\'t update config.access because "hello" doesn\'t exist', async () => {
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

  it('Shouldn\'t update config.attributes because wrong format', async () => {
    const res = await chai
      .request(apikeyURL)
      .put('/update')
      .send({
        apikey: 'user',
        attributes: 1,
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
  });

  it('Shouldn\'t update config.attributes because "hello" doesn\'t exist', async () => {
    const res = await chai
      .request(apikeyURL)
      .put('/update')
      .send({
        apikey: 'user',
        attributes: 'hello',
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
  });

  it('Shouldn\'t update config.allowed because "1" doesn\'t exist', async () => {
    const res = await chai
      .request(apikeyURL)
      .put('/update')
      .send({
        apikey: 'user',
        allowed: 1,
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
  });

  after(async () => {
    await deleteAll();
    await load();
  });
});
