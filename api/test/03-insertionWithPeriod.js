const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const api = require('../app');
//const fakeUnpaywall = require('../../fakeUnpaywall/app');

const client = require('../lib/client');
const {
  createIndexUnpaywall,
  createIndexTask,
  deleteIndexUnpaywall,
  deleteIndexTask,
  countIndexUnpaywall,
  isTaskEnd,
  getTask,
  deleteFile,
  initializeDate,
} = require('./utils');

chai.should();
chai.use(chaiHttp);

describe('test insertion with a file already installed in ez-unpaywall', () => {

  const now = Date.now();
  const oneDay = (1 * 24 * 60 * 60 * 1000);

  // create date in a format (YYYY-mm-dd) to be use by ezunpaywall
  const dateNow = new Date(now).toISOString().slice(0, 10);
  const date1 = new Date(now - (1 * oneDay)).toISOString().slice(0, 10);
  const date2 = new Date(now - (8 * oneDay)).toISOString().slice(0, 10);
  const date3 = new Date(now - (15 * oneDay)).toISOString().slice(0, 10);

  before(async () => {
    // wait elastic started
    let response;
    while (response?.statusCode !== 200) {
      try {
        response = await client.ping();
      } catch (err) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        processLogger.error(`Error in before: ${err}`);
      }
    }
    await createIndexUnpaywall();
    await createIndexTask();
    await deleteFile('fake1.jsonl.gz');
    await deleteFile('fake2.jsonl.gz')
    await deleteFile('fake3.jsonl.gz')
  });

  describe(`/update?startDate=${date2} insert a file already installed`, async () => {
    it('should return the process start', async () => {
      const server = 'http://localhost:8080';
      const response = await chai.request(server)
        .post('/update?startDate=${date2}')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
      response.should.have.status(200);
      response.body.should.have.property('message');
      response.body.message.should.be.equal(`insert snapshot beetween ${date2} and ${dateNow} has begun, list of task has been created on elastic`);
    });
  });
});