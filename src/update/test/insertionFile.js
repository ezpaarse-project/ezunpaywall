/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const {
  countDocuments,
  deleteIndex,
} = require('./utils/elastic');

const {
  addSnapshot,
  deleteSnapshot,
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

chai.use(chaiHttp);

const updateURL = process.env.EZUNPAYWALL_URL || 'http://localhost:4000';

describe('Test: insert the content of a file already installed on ezunpaywall', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
  });

  describe('Do insertion of a file already installed', () => {
    before(async () => {
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await addSnapshot('fake1.jsonl.gz');
      await deleteIndex('unpaywall-test');
    });

    // test return message
    it('Should return the process start', async () => {
      const res = await chai.request(updateURL)
        .post('/job')
        .send({
          index: 'unpaywall-test',
          filename: 'fake1.jsonl.gz',
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('X-API-KEY', 'admin');

      expect(res).have.status(200);
      expect(res.body.message).be.equal('Update with fake1.jsonl.gz');
    });

    // test insertion
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

    // test state
    it('Should get state with all informations from the insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').equal('insert');
      expect(state.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(state.steps[0]).have.property('linesRead').equal(50);
      expect(state.steps[0]).have.property('insertedDocs').equal(50);
      expect(state.steps[0]).have.property('updatedDocs').equal(0);
      expect(state.steps[0]).have.property('failedDocs').equal(0);
      expect(state.steps[0]).have.property('percent').equal(100);
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('success');
    });

    // test Report
    it('Should get report with all informations from the insertion', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('insert');
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
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await deleteIndex('unpaywall-test');
    });
  });

  describe('Do insertion of a file already installed with parameter limit=10', () => {
    before(async () => {
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await addSnapshot('fake1.jsonl.gz');
      await deleteIndex('unpaywall-test');
    });

    // test return message
    it('Should return the process start', async () => {
      const res = await chai.request(updateURL)
        .post('/job')
        .send({
          filename: 'fake1.jsonl.gz',
          index: 'unpaywall-test',
          limit: 10,
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('X-API-KEY', 'admin');

      expect(res).have.status(200);
      expect(res.body.message).be.equal('Update with fake1.jsonl.gz');
    });

    // test insertion
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

    // test state
    it('Should get state with all informations from the insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').equal('insert');
      expect(state.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(state.steps[0]).have.property('percent').equal(100);
      expect(state.steps[0]).have.property('linesRead').equal(10);
      expect(state.steps[0]).have.property('insertedDocs').equal(10);
      expect(state.steps[0]).have.property('updatedDocs').equal(0);
      expect(state.steps[0]).have.property('failedDocs').equal(0);
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('success');
    });

    // test report
    it('Should get report with all informations from the insertion', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('insert');
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
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await deleteIndex('unpaywall-test');
    });
  });

  describe('Do insertion of a file already installed with parameter offset=40', () => {
    before(async () => {
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await addSnapshot('fake1.jsonl.gz');
      await deleteIndex('unpaywall-test');
    });
    // test return message
    it('should return the process start', async () => {
      const res = await chai.request(updateURL)
        .post('/job')
        .send({
          filename: 'fake1.jsonl.gz',
          index: 'unpaywall-test',
          offset: 40,
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('X-API-KEY', 'admin');

      expect(res).have.status(200);
      expect(res.body.message).be.equal('Update with fake1.jsonl.gz');
    });

    // test insertion
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

    // test state
    it('Should get state with all informations from the insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').equal('insert');
      expect(state.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(state.steps[0]).have.property('percent').equal(100);
      expect(state.steps[0]).have.property('linesRead').equal(50);
      expect(state.steps[0]).have.property('insertedDocs').equal(10);
      expect(state.steps[0]).have.property('updatedDocs').equal(0);
      expect(state.steps[0]).have.property('failedDocs').equal(0);
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('success');
    });

    // test report
    it('Should get report with all informations from the insertion', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('insert');
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
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await deleteIndex('unpaywall-test');
    });
  });

  describe('Do insertion of a file already installed with parameter offset=10 and limit=20', () => {
    before(async () => {
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await addSnapshot('fake1.jsonl.gz');
      await deleteIndex('unpaywall-test');
    });
    // test return message
    it('Should return the process start', async () => {
      const res = await chai.request(updateURL)
        .post('/job')
        .send({
          filename: 'fake1.jsonl.gz',
          index: 'unpaywall-test',
          offset: 10,
          limit: 20,
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('X-API-KEY', 'admin');

      expect(res).have.status(200);
      expect(res.body.message).be.equal('Update with fake1.jsonl.gz');
    });

    // test insertion
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

    // test state
    it('Should get state with all informations from the insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').equal('insert');
      expect(state.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(state.steps[0]).have.property('percent').equal(100);
      expect(state.steps[0]).have.property('linesRead').equal(20);
      expect(state.steps[0]).have.property('insertedDocs').equal(10);
      expect(state.steps[0]).have.property('updatedDocs').equal(0);
      expect(state.steps[0]).have.property('failedDocs').equal(0);
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('success');
    });

    // test report
    it('Should get report with all informations from the insertion', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('insert');
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
      await deleteIndex('unpaywall-test');
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
    });
  });

  describe('Don\'t do a insertion of a file already installed because the file is in the wrong format', () => {
    // test return message
    it('Should return a error message', async () => {
      const res = await chai.request(updateURL)
        .post('/job')
        .send({
          filename: 'fake1.jsonl',
          index: 'unpaywall-test',
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('X-API-KEY', 'admin');

      expect(res).have.status(400);
      expect(res.body.message).be.equal('Only ".gz" files are accepted');
    });
  });

  describe('Don\'t do a insertion of a file already installed because the File not found on ezunpaywall', () => {
    // test return message
    it('Should return a error message', async () => {
      const res = await chai.request(updateURL)
        .post('/job')
        .send({
          filename: 'fileDoesntExist.jsonl.gz',
          index: 'unpaywall-test',
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('X-API-KEY', 'admin');

      expect(res).have.status(404);
      expect(res.body.message).be.equal('File not found');
    });
  });

  describe('Don\'t do a insertion of a file already installed because the parameter limit can\t be lower than offset', () => {
    before(async () => {
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await addSnapshot('fake1.jsonl.gz');
      await deleteIndex('unpaywall-test');
    });

    // test return message
    it('Should return a error message', async () => {
      const res = await chai.request(updateURL)
        .post('/job')
        .send({
          filename: 'fake1.jsonl.gz',
          index: 'unpaywall-test',
          offset: 100,
          limit: 50,
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('X-API-KEY', 'admin');

      expect(res).have.status(400);
      expect(res.body.message).be.equal('Limit cannot be low than offset or 0');
    });

    after(async () => {
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await deleteIndex('unpaywall-test');
    });
  });

  after(async () => {
    await deleteSnapshot('fake1.jsonl.gz');
    await deleteSnapshot('fake2.jsonl.gz');
    await deleteSnapshot('fake3.jsonl.gz');
    await deleteIndex('unpaywall-test');
  });
});
