/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const {
  countDocuments,
} = require('./utils/elastic');

const {
  addSnapshot,
} = require('./utils/snapshot');

const {
  getState,
} = require('./utils/state');

const {
  getReport,
} = require('./utils/report');

const {
  checkIfInUpdate,
} = require('./utils/status');

const {
  ping,
} = require('./utils/ping');

const {
  loadDevAPIKey,
  deleteAllAPIKey,
} = require('./utils/apikey');

const reset = require('./utils/reset');

chai.use(chaiHttp);

const updateURL = process.env.EZUNPAYWALL_URL || 'http://localhost:4000';

describe('Test: insert the content of a file already installed on ezunpaywall', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });

  describe('Do insertion of a file already installed', () => {
    before(async () => {
      await reset();
      await addSnapshot('fake1.jsonl.gz');
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/changefile/fake1.jsonl.gz')
        .send({
          index: 'unpaywall-test',
        })
        .set('x-api-key', 'admin');

      expect(res).have.status(202);
    });

    it('Should insert 50 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      do {
        isUpdate = await checkIfInUpdate();
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (isUpdate);

      const count = await countDocuments('unpaywall-test');

      expect(count).to.equal(50);
    });

    it('Should get state with all informations from the insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').equal('insert');
      expect(state.steps[0]).have.property('index').equal('unpaywall-test');
      expect(state.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(state.steps[0]).have.property('linesRead').equal(50);
      expect(state.steps[0]).have.property('insertedDocs').equal(50);
      expect(state.steps[0]).have.property('updatedDocs').equal(0);
      expect(state.steps[0]).have.property('failedDocs').equal(0);
      expect(state.steps[0]).have.property('percent').equal(100);
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('success');
    });

    it('Should get report with all informations from the insertion', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('insert');
      expect(report.steps[0]).have.property('index').equal('unpaywall-test');
      expect(report.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[0]).have.property('percent').equal(100);
      expect(report.steps[0]).have.property('linesRead').equal(50);
      expect(report.steps[0]).have.property('insertedDocs').equal(50);
      expect(report.steps[0]).have.property('updatedDocs').equal(0);
      expect(report.steps[0]).have.property('failedDocs').equal(0);
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('success');
    });

    after(async () => {
      await reset();
    });
  });

  describe('Do insertion of a file already installed with parameter limit=10', () => {
    before(async () => {
      await reset();
      await addSnapshot('fake1.jsonl.gz');
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/changefile/fake1.jsonl.gz')
        .send({
          index: 'unpaywall-test',
          limit: 10,
        })
        .set('x-api-key', 'admin');

      expect(res).have.status(202);
    });

    it('Should insert 10 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      do {
        isUpdate = await checkIfInUpdate();
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (isUpdate);

      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(10);
    });

    it('Should get state with all informations from the insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').equal('insert');
      expect(state.steps[0]).have.property('index').equal('unpaywall-test');
      expect(state.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(state.steps[0]).have.property('percent').equal(100);
      expect(state.steps[0]).have.property('linesRead').equal(10);
      expect(state.steps[0]).have.property('insertedDocs').equal(10);
      expect(state.steps[0]).have.property('updatedDocs').equal(0);
      expect(state.steps[0]).have.property('failedDocs').equal(0);
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('success');
    });

    it('Should get report with all informations from the insertion', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('insert');
      expect(report.steps[0]).have.property('index').equal('unpaywall-test');
      expect(report.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[0]).have.property('percent').equal(100);
      expect(report.steps[0]).have.property('linesRead').equal(10);
      expect(report.steps[0]).have.property('insertedDocs').equal(10);
      expect(report.steps[0]).have.property('updatedDocs').equal(0);
      expect(report.steps[0]).have.property('failedDocs').equal(0);
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('success');
    });

    after(async () => {
      await reset();
    });
  });

  describe('Do insertion of a file already installed with parameter offset=40', () => {
    before(async () => {
      await reset();
      await addSnapshot('fake1.jsonl.gz');
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/changefile/fake1.jsonl.gz')
        .send({
          index: 'unpaywall-test',
          offset: 40,
        })
        .set('x-api-key', 'admin');

      expect(res).have.status(202);
    });

    it('Should insert 10 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      do {
        isUpdate = await checkIfInUpdate();
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (isUpdate);

      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(10);
    });

    it('Should get state with all informations from the insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').equal('insert');
      expect(state.steps[0]).have.property('index').equal('unpaywall-test');
      expect(state.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(state.steps[0]).have.property('percent').equal(100);
      expect(state.steps[0]).have.property('linesRead').equal(50);
      expect(state.steps[0]).have.property('insertedDocs').equal(10);
      expect(state.steps[0]).have.property('updatedDocs').equal(0);
      expect(state.steps[0]).have.property('failedDocs').equal(0);
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('success');
    });

    it('Should get report with all informations from the insertion', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('insert');
      expect(report.steps[0]).have.property('index').equal('unpaywall-test');
      expect(report.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[0]).have.property('percent').equal(100);
      expect(report.steps[0]).have.property('linesRead').equal(50);
      expect(report.steps[0]).have.property('insertedDocs').equal(10);
      expect(report.steps[0]).have.property('updatedDocs').equal(0);
      expect(report.steps[0]).have.property('failedDocs').equal(0);
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('success');
    });

    after(async () => {
      await reset();
    });
  });

  describe('Do insertion of a file already installed with parameter offset=10 and limit=20', () => {
    before(async () => {
      await reset();
      await addSnapshot('fake1.jsonl.gz');
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/changefile/fake1.jsonl.gz')
        .send({
          index: 'unpaywall-test',
          offset: 10,
          limit: 20,
        })
        .set('x-api-key', 'admin');

      expect(res).have.status(202);
    });

    it('Should insert 10 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      do {
        isUpdate = await checkIfInUpdate();
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (isUpdate);

      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(10);
    });

    it('Should get state with all informations from the insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').equal('insert');
      expect(state.steps[0]).have.property('index').equal('unpaywall-test');
      expect(state.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(state.steps[0]).have.property('percent').equal(100);
      expect(state.steps[0]).have.property('linesRead').equal(20);
      expect(state.steps[0]).have.property('insertedDocs').equal(10);
      expect(state.steps[0]).have.property('updatedDocs').equal(0);
      expect(state.steps[0]).have.property('failedDocs').equal(0);
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('success');
    });

    it('Should get report with all informations from the insertion', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('insert');
      expect(report.steps[0]).have.property('index').equal('unpaywall-test');
      expect(report.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[0]).have.property('percent').equal(100);
      expect(report.steps[0]).have.property('linesRead').equal(20);
      expect(report.steps[0]).have.property('insertedDocs').equal(10);
      expect(report.steps[0]).have.property('updatedDocs').equal(0);
      expect(report.steps[0]).have.property('failedDocs').equal(0);
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('success');
    });

    after(async () => {
      await reset();
    });
  });

  describe('Don\'t do a insertion of a file already installed because the file is in the wrong format', () => {
    it('Should return a status code 400', async () => {
      const res = await chai.request(updateURL)
        .post('/job/changefile/fake1.jsonl')
        .send({
          index: 'unpaywall-test',
        })
        .set('x-api-key', 'admin');

      expect(res).have.status(400);
    });
  });

  describe('Don\'t do a insertion of a file already installed because the File not found on ezunpaywall', () => {
    it('Should return a status code 404', async () => {
      const res = await chai.request(updateURL)
        .post('/job/changefile/fake1.jsonl.gz')
        .send({
          index: 'unpaywall-test',
        })
        .set('x-api-key', 'admin');

      expect(res).have.status(404);
    });
  });

  describe('Don\'t do a insertion of a file already installed because the parameter limit can\t be lower than offset', () => {
    before(async () => {
      await reset();
      await addSnapshot('fake1.jsonl.gz');
    });

    it('Should return a status code 400', async () => {
      const res = await chai.request(updateURL)
        .post('/job/changefile/fake1.jsonl.gz')
        .send({
          index: 'unpaywall-test',
          offset: 100,
          limit: 50,
        })
        .set('x-api-key', 'admin');

      expect(res).have.status(400);
    });

    after(async () => {
      await reset();
    });
  });

  after(async () => {
    await reset();
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });
});
