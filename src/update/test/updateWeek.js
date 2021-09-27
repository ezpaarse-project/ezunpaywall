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
  updateChangeFile,
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

const updateURL = process.env.UPDATE_URL || 'http://localhost:4000';

describe('Week: Test: weekly update route test', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
    await updateChangeFile('week');
  });

  describe('Do weekly update', () => {
    before(async () => {
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await deleteIndex('unpaywall-test');
    });

    // test response
    it('Should return the process start', async () => {
      const res = await chai.request(updateURL)
        .post('/job')
        .send({
          index: 'unpaywall-test',
          interval: 'week',
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('X-API-KEY', 'admin');

      expect(res).have.status(200);
      expect(res.body.message).be.equal('Weekly update started');
    });

    // test insertion
    it('Should insert 50 data', async () => {
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(50);
    });

    // test state
    it('Should get state with all informations from the weekly update', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').be.equal('askUnpaywall');
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').be.equal('success');

      expect(state.steps[1]).have.property('task').be.equal('download');
      expect(state.steps[1]).have.property('file').be.equal('fake1.jsonl.gz');
      expect(state.steps[1]).have.property('percent').be.equal(100);
      expect(state.steps[1]).have.property('took').to.not.equal(undefined);
      expect(state.steps[1]).have.property('status').be.equal('success');

      expect(state.steps[2]).have.property('task').be.equal('insert');
      expect(state.steps[2]).have.property('index').equal('unpaywall-test');
      expect(state.steps[2]).have.property('file').be.equal('fake1.jsonl.gz');
      expect(state.steps[2]).have.property('percent').be.equal(100);
      expect(state.steps[2]).have.property('linesRead').be.equal(50);
      expect(state.steps[2]).have.property('insertedDocs').equal(50);
      expect(state.steps[2]).have.property('updatedDocs').equal(0);
      expect(state.steps[2]).have.property('failedDocs').equal(0);
      expect(state.steps[2]).have.property('took').to.not.equal(undefined);
      expect(state.steps[2]).have.property('status').be.equal('success');

      expect(state.done).be.equal(true);
    });

    // test report
    it('Should get report with all informations from the weekly update', async () => {
      const report = await getReport();

      expect(report).have.property('done');
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').be.equal('askUnpaywall');
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').be.equal('success');

      expect(report.steps[1]).have.property('task').be.equal('download');
      expect(report.steps[1]).have.property('file').be.equal('fake1.jsonl.gz');
      expect(report.steps[1]).have.property('percent').be.equal(100);
      expect(report.steps[1]).have.property('took').to.not.equal(undefined);
      expect(report.steps[1]).have.property('status').be.equal('success');

      expect(report.steps[2]).have.property('task').be.equal('insert');
      expect(report.steps[2]).have.property('index').equal('unpaywall-test');
      expect(report.steps[2]).have.property('file').be.equal('fake1.jsonl.gz');
      expect(report.steps[2]).have.property('percent').be.equal(100);
      expect(report.steps[2]).have.property('linesRead').be.equal(50);
      expect(report.steps[2]).have.property('insertedDocs').equal(50);
      expect(report.steps[2]).have.property('updatedDocs').equal(0);
      expect(report.steps[2]).have.property('failedDocs').equal(0);
      expect(report.steps[2]).have.property('took').to.not.equal(undefined);
      expect(report.steps[2]).have.property('status').be.equal('success');
    });

    after(async () => {
      await deleteIndex('unpaywall-test');
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
    });
  });

  describe('Week: Do a weekly update but the file is already installed', () => {
    before(async () => {
      await deleteIndex('unpaywall-test');
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await addSnapshot('fake1.jsonl.gz');
    });

    // test return message
    it('Should return the process start', async () => {
      const res = await chai.request(updateURL)
        .post('/job')
        .send({
          index: 'unpaywall-test',
          interval: 'week',
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('X-API-KEY', 'admin');

      // test response
      expect(res).have.status(200);
      expect(res.body).have.property('message').equal('Weekly update started');
    });

    // test insertion
    it('should insert 50 data', async () => {
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(50);
    });

    // test state
    it('Should get state with all informations from the weekly update', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').equal('askUnpaywall');
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('success');

      expect(state.steps[1]).have.property('task').equal('insert');
      expect(state.steps[1]).have.property('file').equal('fake1.jsonl.gz');
      expect(state.steps[1]).have.property('percent').equal(100);
      expect(state.steps[1]).have.property('linesRead').equal(50);
      expect(state.steps[1]).have.property('insertedDocs').equal(50);
      expect(state.steps[1]).have.property('updatedDocs').equal(0);
      expect(state.steps[1]).have.property('failedDocs').equal(0);
      expect(state.steps[1]).have.property('took').to.not.equal(undefined);
      expect(state.steps[1]).have.property('status').equal('success');
    });

    // test Report
    it('Should get report with all informations from the weekly update', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('askUnpaywall');
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('success');

      expect(report.steps[1]).have.property('task').equal('insert');
      expect(report.steps[1]).have.property('index').equal('unpaywall-test');
      expect(report.steps[1]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[1]).have.property('percent').equal(100);
      expect(report.steps[1]).have.property('linesRead').equal(50);
      expect(report.steps[1]).have.property('insertedDocs').equal(50);
      expect(report.steps[1]).have.property('updatedDocs').equal(0);
      expect(report.steps[1]).have.property('failedDocs').equal(0);
      expect(report.steps[1]).have.property('took').to.not.equal(undefined);
      expect(report.steps[1]).have.property('status').equal('success');
    });

    after(async () => {
      await deleteIndex('unpaywall-test');
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
    });
  });

  after(async () => {
    await deleteIndex('unpaywall-test');
    await deleteSnapshot('fake1.jsonl.gz');
    await deleteSnapshot('fake2.jsonl.gz');
    await deleteSnapshot('fake3.jsonl.gz');
  });
});
