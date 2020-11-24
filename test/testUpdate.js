const chai = require('chai');
const chaiHttp = require('chai-http');

const app = require('../app');
const client = require('../lib/client');

chai.should();
chai.use(chaiHttp);

describe('test API', () => {
  before(async () => {
    await new Promise((resolve) => app.on('ready', resolve));

    // TODO date des fichier à jour
    // wait elastic started
    let response;
    while (response?.statusCode !== 200) {
      try {
        // eslint-disable-next-line no-await-in-loop
        response = await client.ping();
      } catch (error) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  });

  describe('Do weekly update', async () => {
    it('should return the process start', async () => {
      const server = 'http://localhost:8080';
      const response = await chai.request(server)
        .post('/update')
        .set('Access-Control-Allow-Origin : *',
          'Content-Type: application/json');
      response.data.should.have.status(200);
    });

    let data;
    while (!Number.isNaN(data?.body?.count) || data?.body?.count < 2000) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // eslint-disable-next-line no-await-in-loop
        data = await client.count({
          index: 'unpaywall',
        });
        // eslint-disable-next-line no-await-in-loop
      } catch (err) { }
    }
  });
});
