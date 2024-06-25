/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const { countDocuments } = require('./utils/elastic');
const { addChangefile, updateChangefile } = require('./utils/changefile');
const { getState } = require('./utils/state');
const getReport = require('./utils/report');
const checkIfInUpdate = require('./utils/status');

const ping = require('./utils/ping');
const reset = require('./utils/reset');

chai.use(chaiHttp);

const updateURL = process.env.UPDATE_HOST || 'http://localhost:59702';

describe('Week: Test: weekly update route test', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
    await updateChangefile('week');
  });

  describe('Do weekly update', () => {
    before(async () => {
      await reset();
    });

    // test response
    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/download/insert/changefile/period')
        .send({
          index: 'unpaywall-test',
          interval: 'week',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should insert 50 data', async () => {
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => { setTimeout(resolve, 100); });
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(50);
    });

    function testResult(result) {
      expect(result).have.property('done');
      expect(result).have.property('steps').to.be.an('array');
      expect(result).have.property('createdAt').to.not.equal(undefined);
      expect(result).have.property('endAt').to.not.equal(undefined);
      expect(result).have.property('error').equal(false);
      expect(result).have.property('took').to.not.equal(undefined);

      const { indices } = result;
      expect(indices[0]).have.property('index').equal('unpaywall-test');
      expect(indices[0]).have.property('added').equal(50);
      expect(indices[0]).have.property('updated').equal(0);

      expect(result.steps[0]).have.property('task').be.equal('getChangefiles');
      expect(result.steps[0]).have.property('took').to.not.equal(undefined);
      expect(result.steps[0]).have.property('status').be.equal('success');

      expect(result.steps[1]).have.property('task').be.equal('download');
      expect(result.steps[1]).have.property('file').be.equal('fake1.jsonl.gz');
      expect(result.steps[1]).have.property('percent').be.equal(100);
      expect(result.steps[1]).have.property('took').to.not.equal(undefined);
      expect(result.steps[1]).have.property('status').be.equal('success');

      expect(result.steps[2]).have.property('task').be.equal('insert');
      expect(result.steps[2]).have.property('index').equal('unpaywall-test');
      expect(result.steps[2]).have.property('file').be.equal('fake1.jsonl.gz');
      expect(result.steps[2]).have.property('percent').be.equal(100);
      expect(result.steps[2]).have.property('linesRead').be.equal(50);
      expect(result.steps[2]).have.property('addedDocs').equal(50);
      expect(result.steps[2]).have.property('updatedDocs').equal(0);
      expect(result.steps[2]).have.property('failedDocs').equal(0);
      expect(result.steps[2]).have.property('took').to.not.equal(undefined);
      expect(result.steps[2]).have.property('status').be.equal('success');
    }

    it('Should get state with all information from the weekly update', async () => {
      const state = await getState();
      testResult(state);
    });

    it('Should get report with all information from the weekly update', async () => {
      const report = await getReport('unpaywall');
      testResult(report);
    });

    after(async () => {
      await reset();
    });
  });

  describe('Week: Do a weekly update but the file is already installed', () => {
    before(async () => {
      await reset();
      await addChangefile('fake1.jsonl.gz');
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/download/insert/changefile/period')
        .send({
          index: 'unpaywall-test',
          interval: 'week',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('should insert 50 data', async () => {
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => { setTimeout(resolve, 100); });
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(50);
    });

    function testResult(result) {
      expect(result).have.property('done').equal(true);
      expect(result).have.property('steps').to.be.an('array');
      expect(result).have.property('createdAt').to.not.equal(undefined);
      expect(result).have.property('endAt').to.not.equal(undefined);
      expect(result).have.property('error').equal(false);
      expect(result).have.property('took').to.not.equal(undefined);

      const { indices } = result;
      expect(indices[0]).have.property('index').equal('unpaywall-test');
      expect(indices[0]).have.property('added').equal(50);
      expect(indices[0]).have.property('updated').equal(0);

      expect(result.steps[0]).have.property('task').equal('getChangefiles');
      expect(result.steps[0]).have.property('took').to.not.equal(undefined);
      expect(result.steps[0]).have.property('status').equal('success');

      expect(result.steps[1]).have.property('task').equal('insert');
      expect(result.steps[1]).have.property('index').equal('unpaywall-test');
      expect(result.steps[1]).have.property('file').equal('fake1.jsonl.gz');
      expect(result.steps[1]).have.property('percent').equal(100);
      expect(result.steps[1]).have.property('linesRead').equal(50);
      expect(result.steps[1]).have.property('addedDocs').equal(50);
      expect(result.steps[1]).have.property('updatedDocs').equal(0);
      expect(result.steps[1]).have.property('failedDocs').equal(0);
      expect(result.steps[1]).have.property('took').to.not.equal(undefined);
      expect(result.steps[1]).have.property('status').equal('success');
    }

    it('Should get state with all information from the weekly update', async () => {
      const state = await getState();
      testResult(state);
    });

    it('Should get report with all information from the weekly update', async () => {
      const report = await getReport('unpaywall');
      testResult(report);
    });

    after(async () => {
      await reset();
    });
  });

  after(async () => {
    await reset();
  });
});
