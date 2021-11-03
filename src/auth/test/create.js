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

describe('Test: Create apikey', () => {
  before(async () => {
    await ping();
    await deleteAll();
    await load();
  });

  it('Should create apikey with all config', async () => {
    const res = await chai
      .request(authURL)
      .post('/create')
      .send({
        name: 'test-user1',
        access: ['graphql'],
        attributes: '*',
        allowed: true,
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').to.not.equal(undefined);
    expect(res.body.config).have.property('name').equal('test-user1');
    expect(res.body.config).have.property('access').to.be.an('array');
    expect(res.body.config.access[0]).equal('graphql');
    expect(res.body.config).have.property('attributes').equal('*');
    expect(res.body.config).have.property('allowed').equal(true);
  });

  it('Should create apikey with only name', async () => {
    const res = await chai
      .request(authURL)
      .post('/create')
      .send({
        name: 'test-user2',
      })
      .set('redis-password', 'changeme');

    console.log(res.body)
    expect(res).have.status(200);

    expect(res.body).have.property('apikey').to.not.equal(undefined);
    expect(res.body.config).have.property('name').equal('test-user2');
    expect(res.body.config).have.property('access').to.be.an('array');
    expect(res.body.config.access[0]).equal('graphql');
    expect(res.body.config).have.property('attributes').equal('*');
    expect(res.body.config).have.property('allowed').equal(true);
  });

  it('Shouldn\'t create apikey because it\'s already exist', async () => {
    const res = await chai
      .request(authURL)
      .post('/create')
      .send({
        name: 'test-user1',
        access: ['graphql'],
        attributes: '*',
        allowed: true,
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
    expect(res.body).have.property('message').equal('Name [test-user1] already exist');
  });

  it('Shouldn\'t create apikey because config.access are in wrong format', async () => {
    const res = await chai
      .request(authURL)
      .post('/create')
      .send({
        name: 'test-user1',
        access: 'hello',
        attributes: '*',
        allowed: true,
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
    expect(res.body).have.property('message').equal('argument "access" [hello] is in wrong format');
  });

  it('Shouldn\'t create apikey because config.access "hello" doesn\'t exist', async () => {
    const res = await chai
      .request(authURL)
      .post('/create')
      .send({
        name: 'test-user1',
        access: ['hello'],
        attributes: '*',
        allowed: true,
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
    expect(res.body).have.property('message').equal('argument "access" [hello] doesn\'t exist');
  });

  it('Shouldn\'t create apikey because config.attributes are in wrong format', async () => {
    const res = await chai
      .request(authURL)
      .post('/create')
      .send({
        name: 'test-user1',
        access: ['graphql'],
        attributes: 1,
        allowed: true,
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
    expect(res.body).have.property('message').equal('argument "attributes" [1] is in wrong format');
  });

  it('Shouldn\'t create apikey because config.attributes "hello" doesn\'t exist', async () => {
    const res = await chai
      .request(authURL)
      .post('/create')
      .send({
        name: 'test-user1',
        access: ['graphql'],
        attributes: 'test',
        allowed: true,
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
    expect(res.body).have.property('message').equal('argument "attributes" [test] doesn\'t exist');
  });

  it('Shouldn\'t create apikey because config.allowed are in wrong format', async () => {
    const res = await chai
      .request(authURL)
      .post('/create')
      .send({
        name: 'test-user1',
        access: ['graphql'],
        attributes: '*',
        allowed: 1,
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
    expect(res.body).have.property('message').equal('argument "allowed" [1] is in wrong format');
  });
});
