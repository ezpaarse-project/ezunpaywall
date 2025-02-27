const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');

const ping = require('./utils/ping');
const {
  loadDevAPIKey,
  deleteAllAPIKey,
} = require('./utils/apikey');

chai.use(chaiHttp);

const adminURL = process.env.ADMIN_URL || 'http://localhost:59703';

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
      .request(adminURL)
      .put('/apikeys/user')
      .send({
        name: 'new-name',
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').equal('user');
    expect(res.body).have.property('name').equal('new-name');
    expect(res.body).have.property('owner').equal('dev');
    expect(res.body).have.property('description').equal('user dev apikey');
    expect(res.body).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
    expect(res.body).have.property('attributes').to.be.an('array').eql(['*']);
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Should update config.access to "graphql" for the apikey "user"', async () => {
    const res = await chai
      .request(adminURL)
      .put('/apikeys/user')
      .send({
        access: ['graphql'],
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').equal('user');
    expect(res.body).have.property('name').equal('user');
    expect(res.body).have.property('owner').equal('dev');
    expect(res.body).have.property('description').equal('user dev apikey');
    expect(res.body).have.property('access').to.be.an('array').eql(['graphql']);
    expect(res.body).have.property('attributes').to.be.an('array').eql(['*']);
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Should update config.attributes to "doi" for the apikey "user"', async () => {
    const res = await chai
      .request(adminURL)
      .put('/apikeys/user')
      .send({
        attributes: ['doi'],
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').equal('user');
    expect(res.body).have.property('name').equal('user');
    expect(res.body).have.property('owner').equal('dev');
    expect(res.body).have.property('description').equal('user dev apikey');
    expect(res.body).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
    expect(res.body).have.property('attributes').to.be.an('array').eql(['doi']);
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Should update config.attributes to "doi,is_oa" for the apikey "user"', async () => {
    const res = await chai
      .request(adminURL)
      .put('/apikeys/user')
      .send({
        attributes: ['doi', 'is_oa'],
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').equal('user');
    expect(res.body).have.property('name').equal('user');
    expect(res.body).have.property('owner').equal('dev');
    expect(res.body).have.property('description').equal('user dev apikey');
    expect(res.body).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
    expect(res.body).have.property('attributes').to.be.an('array').eql(['doi', 'is_oa']);
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Should update config.allowed to "false" for the apikey "user"', async () => {
    const res = await chai
      .request(adminURL)
      .put('/apikeys/user')
      .send({
        allowed: false,
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').equal('user');
    expect(res.body).have.property('name').equal('user');
    expect(res.body).have.property('owner').equal('dev');
    expect(res.body).have.property('description').equal('user dev apikey');
    expect(res.body).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
    expect(res.body).have.property('attributes').to.be.an('array').eql(['*']);
    expect(res.body).have.property('allowed').equal(false);
  });

  it('Should update config.owner to "new-owner"', async () => {
    const res = await chai
      .request(adminURL)
      .put('/apikeys/user')
      .send({
        owner: 'new-owner',
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').equal('user');
    expect(res.body).have.property('name').equal('user');
    expect(res.body).have.property('owner').equal('new-owner');
    expect(res.body).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
    expect(res.body).have.property('attributes').to.be.an('array').eql(['*']);
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Should update config.owner to empty string', async () => {
    const res = await chai
      .request(adminURL)
      .put('/apikeys/user')
      .send({
        owner: '',
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').equal('user');
    expect(res.body).have.property('name').equal('user');
    expect(res.body).have.property('owner').equal('');
    expect(res.body).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
    expect(res.body).have.property('attributes').to.be.an('array').eql(['*']);
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Should update config.description to "new-description"', async () => {
    const res = await chai
      .request(adminURL)
      .put('/apikeys/user')
      .send({
        description: 'new-description',
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').equal('user');
    expect(res.body).have.property('name').equal('user');
    expect(res.body).have.property('owner').equal('dev');
    expect(res.body).have.property('description').equal('new-description');
    expect(res.body).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
    expect(res.body).have.property('attributes').to.be.an('array').eql(['*']);
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Should update config.allowed to "true" for the apikey "notAllowed"', async () => {
    const res = await chai
      .request(adminURL)
      .put('/apikeys/notAllowed')
      .send({
        allowed: true,
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').equal('notAllowed');
    expect(res.body).have.property('name').equal('notAllowed');
    expect(res.body).have.property('owner').equal('dev');
    expect(res.body).have.property('description').equal('notAllowed dev apikey');
    expect(res.body).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
    expect(res.body).have.property('attributes').to.be.an('array').eql(['*']);
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Should update config.name to "new-user" and config.access to "graphql" for the apikey "user"', async () => {
    const res = await chai
      .request(adminURL)
      .put('/apikeys/user')
      .send({
        name: 'new-user',
        access: ['graphql'],
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(200);

    expect(res.body).have.property('apikey').equal('user');
    expect(res.body).have.property('name').equal('new-user');
    expect(res.body).have.property('owner').equal('dev');
    expect(res.body).have.property('description').equal('user dev apikey');
    expect(res.body).have.property('access').to.be.an('array').eql(['graphql']);
    expect(res.body).have.property('attributes').to.be.an('array').eql(['*']);
    expect(res.body).have.property('allowed').equal(true);
  });

  it('Shouldn\'t update config.access for the apikey "user" because "hello" doesn\'t exist', async () => {
    const res = await chai
      .request(adminURL)
      .put('/apikeys/user')
      .send({
        access: ['hello'],
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(400);
  });

  it('Shouldn\'t update config.attributes for the apikey "user" because "hello" doesn\'t exist', async () => {
    const res = await chai
      .request(adminURL)
      .put('/apikeys/user')
      .send({
        attributes: ['hello'],
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(400);
  });

  it('Shouldn\'t update config.allowed for the apikey "user" because "maybe" doesn\'t exist', async () => {
    const res = await chai
      .request(adminURL)
      .put('/apikeys/user')
      .send({
        allowed: 'maybe',
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(400);
  });

  after(async () => {
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });
});
