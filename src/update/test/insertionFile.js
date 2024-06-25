/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const { countDocuments } = require('./utils/elastic');
const { addChangefile } = require('./utils/changefile');
const { getState } = require('./utils/state');
const getReport = require('./utils/report');
const checkIfInUpdate = require('./utils/status');

const ping = require('./utils/ping');
const reset = require('./utils/reset');

chai.use(chaiHttp);

const updateURL = process.env.UPDATE_HOST || 'http://localhost:59702';

describe('Test: insert the content of a file already installed on ezunpaywall', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
  });

  describe('Do insertion of a file already installed', () => {
    before(async () => {
      await reset();
      await addChangefile('fake1.jsonl.gz');
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/insert/changefile/fake1.jsonl.gz')
        .send({
          index: 'unpaywall-test',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should insert 50 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      do {
        isUpdate = await checkIfInUpdate();
        await new Promise((resolve) => { setTimeout(resolve, 100); });
      } while (isUpdate);

      const count = await countDocuments('unpaywall-test');

      expect(count).to.equal(50);
    });

    function testResult(result) {
      expect(result).have.property('done').equal(true);
      expect(result).have.property('createdAt').to.not.equal(undefined);
      expect(result).have.property('endAt').to.not.equal(undefined);
      expect(result).have.property('steps').to.be.an('array');
      expect(result).have.property('error').equal(false);
      expect(result).have.property('took').to.not.equal(undefined);

      const { indices } = result;
      expect(indices[0]).have.property('index').equal('unpaywall-test');
      expect(indices[0]).have.property('added').equal(50);
      expect(indices[0]).have.property('updated').equal(0);

      expect(result.steps[0]).have.property('task').equal('insert');
      expect(result.steps[0]).have.property('index').equal('unpaywall-test');
      expect(result.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(result.steps[0]).have.property('linesRead').equal(50);
      expect(result.steps[0]).have.property('addedDocs').equal(50);
      expect(result.steps[0]).have.property('updatedDocs').equal(0);
      expect(result.steps[0]).have.property('failedDocs').equal(0);
      expect(result.steps[0]).have.property('percent').equal(100);
      expect(result.steps[0]).have.property('took').to.not.equal(undefined);
      expect(result.steps[0]).have.property('status').equal('success');
    }

    it('Should get state with all information from the insertion', async () => {
      const state = await getState();
      testResult(state);
    });

    it('Should get report with all information from the insertion', async () => {
      const report = await getReport('unpaywall');
      testResult(report);
    });

    after(async () => {
      await reset();
    });
  });

  describe('Do insertion of a file already installed with parameter limit=10', () => {
    before(async () => {
      await reset();
      await addChangefile('fake1.jsonl.gz');
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/insert/changefile/fake1.jsonl.gz')
        .send({
          index: 'unpaywall-test',
          limit: 10,
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should insert 10 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      do {
        isUpdate = await checkIfInUpdate();
        await new Promise((resolve) => { setTimeout(resolve, 100); });
      } while (isUpdate);

      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(10);
    });

    function testResult(result) {
      expect(result).have.property('done').equal(true);
      expect(result).have.property('createdAt').to.not.equal(undefined);
      expect(result).have.property('endAt').to.not.equal(undefined);
      expect(result).have.property('steps').to.be.an('array');
      expect(result).have.property('error').equal(false);
      expect(result).have.property('took').to.not.equal(undefined);

      const { indices } = result;
      expect(indices[0]).have.property('index').equal('unpaywall-test');
      expect(indices[0]).have.property('added').equal(10);
      expect(indices[0]).have.property('updated').equal(0);

      expect(result.steps[0]).have.property('task').equal('insert');
      expect(result.steps[0]).have.property('index').equal('unpaywall-test');
      expect(result.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(result.steps[0]).have.property('percent').equal(100);
      expect(result.steps[0]).have.property('linesRead').equal(10);
      expect(result.steps[0]).have.property('addedDocs').equal(10);
      expect(result.steps[0]).have.property('updatedDocs').equal(0);
      expect(result.steps[0]).have.property('failedDocs').equal(0);
      expect(result.steps[0]).have.property('took').to.not.equal(undefined);
      expect(result.steps[0]).have.property('status').equal('success');
    }

    it('Should get state with all information from the insertion', async () => {
      const state = await getState();
      testResult(state);
    });

    it('Should get report with all information from the insertion', async () => {
      const report = await getReport('unpaywall');
      testResult(report);
    });

    after(async () => {
      await reset();
    });
  });

  describe('Do insertion of a file already installed with parameter offset=40', () => {
    before(async () => {
      await reset();
      await addChangefile('fake1.jsonl.gz');
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/insert/changefile/fake1.jsonl.gz')
        .send({
          index: 'unpaywall-test',
          offset: 40,
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should insert 10 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      do {
        isUpdate = await checkIfInUpdate();
        await new Promise((resolve) => { setTimeout(resolve, 100); });
      } while (isUpdate);

      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(10);
    });

    function testResult(result) {
      expect(result).have.property('done').equal(true);
      expect(result).have.property('createdAt').to.not.equal(undefined);
      expect(result).have.property('endAt').to.not.equal(undefined);
      expect(result).have.property('steps').to.be.an('array');
      expect(result).have.property('error').equal(false);
      expect(result).have.property('took').to.not.equal(undefined);

      const { indices } = result;
      expect(indices[0]).have.property('index').equal('unpaywall-test');
      expect(indices[0]).have.property('added').equal(10);
      expect(indices[0]).have.property('updated').equal(0);

      expect(result.steps[0]).have.property('task').equal('insert');
      expect(result.steps[0]).have.property('index').equal('unpaywall-test');
      expect(result.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(result.steps[0]).have.property('percent').equal(100);
      expect(result.steps[0]).have.property('linesRead').equal(50);
      expect(result.steps[0]).have.property('addedDocs').equal(10);
      expect(result.steps[0]).have.property('updatedDocs').equal(0);
      expect(result.steps[0]).have.property('failedDocs').equal(0);
      expect(result.steps[0]).have.property('took').to.not.equal(undefined);
      expect(result.steps[0]).have.property('status').equal('success');
    }

    it('Should get state with all information from the insertion', async () => {
      const state = await getState();
      testResult(state);
    });

    it('Should get report with all information from the insertion', async () => {
      const report = await getReport('unpaywall');
      testResult(report);
    });

    after(async () => {
      await reset();
    });
  });

  describe('Do insertion of a file already installed with parameter offset=10 and limit=20', () => {
    before(async () => {
      await reset();
      await addChangefile('fake1.jsonl.gz');
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/insert/changefile/fake1.jsonl.gz')
        .send({
          index: 'unpaywall-test',
          offset: 10,
          limit: 20,
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should insert 10 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      do {
        isUpdate = await checkIfInUpdate();
        await new Promise((resolve) => { setTimeout(resolve, 100); });
      } while (isUpdate);

      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(10);
    });

    function testResult(result) {
      expect(result).have.property('done').equal(true);
      expect(result).have.property('createdAt').to.not.equal(undefined);
      expect(result).have.property('endAt').to.not.equal(undefined);
      expect(result).have.property('steps').to.be.an('array');
      expect(result).have.property('error').equal(false);
      expect(result).have.property('took').to.not.equal(undefined);

      const { indices } = result;
      expect(indices[0]).have.property('index').equal('unpaywall-test');
      expect(indices[0]).have.property('added').equal(10);
      expect(indices[0]).have.property('updated').equal(0);

      expect(result.steps[0]).have.property('task').equal('insert');
      expect(result.steps[0]).have.property('index').equal('unpaywall-test');
      expect(result.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(result.steps[0]).have.property('percent').equal(100);
      expect(result.steps[0]).have.property('linesRead').equal(20);
      expect(result.steps[0]).have.property('addedDocs').equal(10);
      expect(result.steps[0]).have.property('updatedDocs').equal(0);
      expect(result.steps[0]).have.property('failedDocs').equal(0);
      expect(result.steps[0]).have.property('took').to.not.equal(undefined);
      expect(result.steps[0]).have.property('status').equal('success');
    }

    it('Should get state with all information from the insertion', async () => {
      const state = await getState();
      testResult(state);
    });

    it('Should get report with all information from the insertion', async () => {
      const report = await getReport('unpaywall');
      testResult(report);
    });

    after(async () => {
      await reset();
    });
  });

  describe('Don\'t do a insertion of a file already installed because the file is in the wrong format', () => {
    it('Should return a status code 400', async () => {
      const res = await chai.request(updateURL)
        .post('/job/insert/changefile/fake1.jsonl')
        .send({
          index: 'unpaywall-test',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(400);
    });
  });

  describe('Don\'t do a insertion of a file already installed because the File not found on ezunpaywall', () => {
    it('Should return a status code 404', async () => {
      const res = await chai.request(updateURL)
        .post('/job/insert/changefile/fake1.jsonl.gz')
        .send({
          index: 'unpaywall-test',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(404);
    });
  });

  describe('Don\'t do a insertion of a file already installed because the parameter limit can\t be lower than offset', () => {
    before(async () => {
      await reset();
      await addChangefile('fake1.jsonl.gz');
    });

    it('Should return a status code 400', async () => {
      const res = await chai.request(updateURL)
        .post('/job/insert/changefile/fake1.jsonl.gz')
        .send({
          index: 'unpaywall-test',
          offset: 100,
          limit: 50,
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(400);
    });

    after(async () => {
      await reset();
    });
  });

  after(async () => {
    await reset();
  });
});
