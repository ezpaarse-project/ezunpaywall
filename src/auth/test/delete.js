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

describe('Test: Delete apikey', () => {
  before(async () => {
    await ping();
    await deleteAll();
    await load();
  });

  it('Should delete apikey', async () => {
    const res = await chai
      .request(authURL)
      .delete('/delete')
      .send({
        apikey: 'user',
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(200);
    expect(res.body).have.property('apikey').equal('user');
  });

  it('Shouldn\'t delete apikey because it\'s doesn\'t exist', async () => {
    const res = await chai
      .request(authURL)
      .delete('/delete')
      .send({
        apikey: 'user-test',
      })
      .set('redis-password', 'changeme');

    expect(res).have.status(404);
    expect(res.body).have.property('message').equal('[user-test] apikey doesn\'t exist');
  });

  it('Shouldn\'t delete apikey because are not send', async () => {
    const res = await chai
      .request(authURL)
      .delete('/delete')
      .set('redis-password', 'changeme');

    expect(res).have.status(400);
    expect(res.body).have.property('message').equal('apikey expected');
  });

  after(async () => {
    await deleteAll();
    await load();
  });
});
