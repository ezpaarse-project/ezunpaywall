const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');
const { format } = require('date-fns');

const ping = require('./utils/ping');

const {
  loadDevAPIKey,
  deleteAllAPIKey,
} = require('./utils/apikey');

chai.use(chaiHttp);

const apikeyURL = process.env.APIKEY_HOST || 'http://localhost:59704';

describe('Test: Create apikey', () => {
  before(async () => {
    await ping();
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });

  it('Should create apikey with all config', async () => {
    const res = await chai
      .request(apikeyURL)
      .post('/keys')
      .send({
        name: 'test-user1',
        owner: 'test',
        description: 'created by test program',
        access: ['graphql'],
        attributes: ['*'],
        allowed: true,
      })
      .set('x-api-key', 'changeme');
    expect(res).have.status(200);

    expect(res.body).have.property('apikey').to.not.equal(undefined);
    expect(res.body.config).have.property('name').equal('test-user1');
    expect(res.body.config).have.property('owner').equal('test');
    expect(res.body.config).have.property('description').equal('created by test program');
    expect(res.body.config).have.property('createAt').equal(format(new Date(), 'yyyy-MM-dd'));
    expect(res.body.config).have.property('access').to.be.an('array').eql(['graphql']);
    expect(res.body.config).have.property('attributes').to.be.an('array').eql(['*']);
    expect(res.body.config).have.property('allowed').equal(true);
  });

  it('Should create apikey with only name', async () => {
    const res = await chai
      .request(apikeyURL)
      .post('/keys')
      .send({
        name: 'test-user2',
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').to.not.equal(undefined);
    expect(res.body.config).have.property('name').equal('test-user2');
    expect(res.body.config).have.property('owner').equal('');
    expect(res.body.config).have.property('description').equal('');
    expect(res.body.config).have.property('createAt').equal(format(new Date(), 'yyyy-MM-dd'));
    expect(res.body.config).have.property('access').to.be.an('array').eql(['graphql']);
    expect(res.body.config).have.property('attributes').to.be.an('array').eql(['*']);
    expect(res.body.config).have.property('allowed').equal(true);
  });

  it('Shouldn\'t create apikey because it\'s already exist', async () => {
    const res = await chai
      .request(apikeyURL)
      .post('/keys')
      .send({
        name: 'test-user1',
        access: ['graphql'],
        attributes: ['*'],
        allowed: true,
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(409);
  });

  it('Shouldn\'t create apikey because config.access are in wrong format', async () => {
    const res = await chai
      .request(apikeyURL)
      .post('/keys')
      .send({
        name: 'test-user1',
        access: 'hello',
        attributes: ['*'],
        allowed: true,
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(400);
  });

  it('Shouldn\'t create apikey because config.access "test" doesn\'t exist', async () => {
    const res = await chai
      .request(apikeyURL)
      .post('/keys')
      .send({
        name: 'test-user1',
        access: ['test'],
        attributes: ['*'],
        allowed: true,
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(400);
  });

  it('Shouldn\'t create apikey because config.attributes are in wrong format', async () => {
    const res = await chai
      .request(apikeyURL)
      .post('/keys')
      .send({
        name: 'test-user1',
        access: ['graphql'],
        attributes: 1,
        allowed: true,
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(400);
  });

  it('Shouldn\'t create apikey because config.attributes "test" doesn\'t exist', async () => {
    const res = await chai
      .request(apikeyURL)
      .post('/keys')
      .send({
        name: 'test-user1',
        access: ['graphql'],
        attributes: 'test',
        allowed: true,
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(400);
  });

  it('Shouldn\'t create apikey because config.allowed are in wrong format', async () => {
    const res = await chai
      .request(apikeyURL)
      .post('/keys')
      .send({
        name: 'test-user1',
        access: ['graphql'],
        attributes: ['*'],
        allowed: 1,
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(400);
  });

  after(async () => {
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });
});
