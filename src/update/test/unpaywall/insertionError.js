/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const { countDocuments } = require('../utils/elastic');
const { addSnapshot, updateChangeFile } = require('../utils/snapshot');
const { getState } = require('../utils/state');
const getReport = require('../utils/report');
const checkIfInUpdate = require('../utils/status');

const ping = require('../utils/ping');
const reset = require('../utils/reset');

chai.use(chaiHttp);

const updateURL = process.env.UPDATE_HOST || 'http://localhost:59702';

describe('Test: insert the content of a file already installed on ezunpaywall', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
    await updateChangeFile('week');
  });

  describe('Do insertion of a corrupted file already installed', () => {
    before(async () => {
      await reset();
      await addSnapshot('unpaywall', 'fake1-error.jsonl.gz');
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/changefile/fake1-error.jsonl.gz')
        .send({
          index: 'unpaywall-test',
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should insert 0 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      do {
        isUpdate = await checkIfInUpdate();
        await new Promise((resolve) => { setTimeout(resolve, 100); });
      } while (isUpdate);

      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(0);
    });

    it('Should get state with all information from the insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(true);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').equal('insert');
      expect(state.steps[0]).have.property('index').equal('unpaywall-test');
      expect(state.steps[0]).have.property('file').equal('fake1-error.jsonl.gz');
      expect(state.steps[0]).have.property('linesRead').equal(50);
      expect(state.steps[0]).have.property('insertedDocs').equal(49);
      expect(state.steps[0]).have.property('updatedDocs').equal(0);
      expect(state.steps[0]).have.property('failedDocs').equal(1);
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('error');
    });

    it('Should get report with all information from the insertion', async () => {
      const report = await getReport('unpaywall');

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(true);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('insert');
      expect(report.steps[0]).have.property('index').equal('unpaywall-test');
      expect(report.steps[0]).have.property('file').equal('fake1-error.jsonl.gz');
      expect(report.steps[0]).have.property('linesRead').equal(50);
      expect(report.steps[0]).have.property('insertedDocs').equal(49);
      expect(report.steps[0]).have.property('updatedDocs').equal(0);
      expect(report.steps[0]).have.property('failedDocs').equal(1);
      expect(report.steps[0]).have.property('percent').equal(0);
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('error');
    });

    after(async () => {
      await reset();
    });
  });

  after(async () => {
    await reset();
  });
});
