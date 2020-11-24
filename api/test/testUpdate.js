const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const api = require('../app');
// const fakeUnpaywall = require('../../fakeUnpaywall/app');
const client = require('../lib/client');

chai.should();
chai.use(chaiHttp);
// TODO date des fichier à jour

describe('test API', () => {

  before(async () => {
    // wait ezunpaywall
    await new Promise((resolve) => api.on('ready', resolve()));
    // wait fakeUnpaywall
    // await new Promise((resolve) => fakeUnpaywall.on('ready', resolve()));
    // wait elastic started
    let response;
    while (response?.statusCode !== 200) {
      try {
        response = await client.ping();
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve(), 1000));
      }
    }
  });

  describe('Do weekly update', async () => {
    it('should return the process start', async () => {
      const server = 'http://localhost:8080';
      const response = await chai.request(server)
        .post('/update')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
      response.should.have.status(200);
    });

    it('2000 document inserted', async () => {
      let data;
      while (data?.body?.count !== 2000) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        try {
          data = await client.count({
            index: 'unpaywall',
          });
        } catch (err) { 
          console.log(err);
        }
      }
      await expect(data.body.count).to.equal(2000)
    });
  });

  after(async () => {
    await client.indices.delete({
      index: 'unpaywall',
    });

    const res2 = await client.indices.exists({
      index: 'unpaywall',
    });

    if (res2.body != false) {
      console.log('Index wasn\'t deleted, the next tests will lapse')
    }
  });

});
