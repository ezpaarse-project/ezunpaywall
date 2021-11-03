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
      .request(authURL)
      .put('/update')
      .send({
        apikey: 'user',
        config: {
          name: 'new-name',
        },
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').to.not.equal(undefined);
    expect(res.body.config).have.property('name').equal('new-name');
    expect(res.body.config).have.property('access').to.be.an('array');
    expect(res.body.config.access[0]).equal('graphql');
    expect(res.body.config.access[1]).equal('enrich');
    expect(res.body.config).have.property('attributes').equal('*');
    expect(res.body.config).have.property('allowed').equal(true);
  });

  it('Should update config.access of apikey', async () => {
    const res = await chai
      .request(authURL)
      .put('/update')
      .send({
        apikey: 'user',
        config: {
          access: ['update'],
        },
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').to.not.equal(undefined);
    expect(res.body.config).have.property('name').equal('user');
    expect(res.body.config).have.property('access').to.be.an('array');
    expect(res.body.config.access[0]).equal('update');
    expect(res.body.config).have.property('attributes').equal('*');
    expect(res.body.config).have.property('allowed').equal(true);
  });

  it('Should update config.attributes of apikey', async () => {
    const res = await chai
      .request(authURL)
      .put('/update')
      .send({
        apikey: 'user',
        config: {
          attributes: 'doi',
        },
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').to.not.equal(undefined);
    expect(res.body.config).have.property('name').equal('user');
    expect(res.body.config).have.property('access').to.be.an('array');
    expect(res.body.config.access[0]).equal('graphql');
    expect(res.body.config.access[1]).equal('enrich');
    expect(res.body.config).have.property('attributes').equal('doi');
    expect(res.body.config).have.property('allowed').equal(true);
  });

  it('Should update config.allowed of apikey', async () => {
    const res = await chai
      .request(authURL)
      .put('/update')
      .send({
        apikey: 'user',
        config: {
          allowed: false,
        },
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').to.not.equal(undefined);
    expect(res.body.config).have.property('name').equal('user');
    expect(res.body.config).have.property('access').to.be.an('array');
    expect(res.body.config.access[0]).equal('graphql');
    expect(res.body.config.access[1]).equal('enrich');
    expect(res.body.config).have.property('attributes').equal('*');
    expect(res.body.config).have.property('allowed').equal(false);
  });

  it('Should update config.name and config.access of apikey', async () => {
    const res = await chai
      .request(authURL)
      .put('/update')
      .send({
        apikey: 'user',
        config: {
          name: 'new-user',
          access: ['update'],
        },
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').to.not.equal(undefined);
    expect(res.body.config).have.property('name').equal('new-user');
    expect(res.body.config).have.property('access').to.be.an('array');
    expect(res.body.config.access[0]).equal('update');
    expect(res.body.config).have.property('attributes').equal('*');
    expect(res.body.config).have.property('allowed').equal(true);
  });

  it('Shouldn\'t update config.access because wrong format', async () => {
    const res = await chai
      .request(authURL)
      .put('/update')
      .send({
        apikey: 'user',
        config: {
          access: 'hello',
        },
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
    expect(res.body).have.property('message').equal('argument "access" [hello] is in wrong format');
  });

  it('Shouldn\'t update config.access because "hello" doesn\'t exist', async () => {
    const res = await chai
      .request(authURL)
      .put('/update')
      .send({
        apikey: 'user',
        config: {
          access: ['hello'],
        },
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
    expect(res.body).have.property('message').equal('argument "access" [hello] doesn\'t exist');
  });

  it('Shouldn\'t update config.attributes because wrong format', async () => {
    const res = await chai
      .request(authURL)
      .put('/update')
      .send({
        apikey: 'user',
        config: {
          attributes: 1,
        },
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
    expect(res.body).have.property('message').equal('argument "attributes" [1] is in wrong format');
  });

  it('Shouldn\'t update config.attributes because "hello" doesn\'t exist', async () => {
    const res = await chai
      .request(authURL)
      .put('/update')
      .send({
        apikey: 'user',
        config: {
          attributes: 'hello',
        },
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
    expect(res.body).have.property('message').equal('argument "attributes" [hello] doesn\'t exist');
  });

  it('Shouldn\'t update config.allowed because "1" doesn\'t exist', async () => {
    const res = await chai
      .request(authURL)
      .put('/update')
      .send({
        apikey: 'user',
        config: {
          allowed: 1,
        },
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
    expect(res.body).have.property('message').equal('argument "allowed" [1] is in wrong format');
  });

  after(async () => {
    await deleteAll();
    await load();
  });
});
