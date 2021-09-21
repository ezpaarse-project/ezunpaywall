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

const updateURL = process.env.EZUNPAYWALL_URL || 'http://localhost:4000';

describe('Test: insert the content of a file already installed on ezunpaywall', () => {
  const now = Date.now();
  const oneDay = (1 * 24 * 60 * 60 * 1000);

  // create date in a format (YYYY-mm-dd) to be use by ezunpaywall
  const dateNow = new Date(now).toISOString().slice(0, 10);
  const oneYear = 1 * 24 * 60 * 60 * 1000 * 365;

  // yersterday
  const date1 = new Date(now - oneYear - (8 * oneDay)).toISOString().slice(0, 10);

  before(async function () {
    this.timeout(30000);
    await ping();
    await updateChangeFile('week');
  });

  describe('Do insertion of a corrupted file already installed', () => {
    before(async () => {
      await addSnapshot('fake1-error.jsonl.gz');
      await deleteIndex('unpaywall-test');
    });

    // test return message
    it('Should return the process start', async () => {
      const res = await chai.request(updateURL)
        .post('/job')
        .send({
          index: 'unpaywall-test',
          filename: 'fake1-error.jsonl.gz',
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('X-API-KEY', 'admin');

      expect(res).have.status(200);
      expect(res.body.message).be.equal('Update with fake1-error.jsonl.gz');
    });

    // test insertion
    it('Should insert 0 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      do {
        isUpdate = await checkIfInUpdate();
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (isUpdate);

      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(0);
    });

    // test state
    it('Should get state with all informations from the insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(true);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').equal('insert');
      expect(state.steps[0]).have.property('file').equal('fake1-error.jsonl.gz');
      expect(state.steps[0]).have.property('linesRead').equal(50);
      expect(state.steps[0]).have.property('percent').equal(0);
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('error');
    });

    // test Report
    it('Should get report with all informations from the insertion', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(true);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('insert');
      expect(report.steps[0]).have.property('file').equal('fake1-error.jsonl.gz');
      expect(report.steps[0]).have.property('linesRead').equal(50);
      expect(report.steps[0]).have.property('percent').equal(0);
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('error');
    });

    after(async () => {
      await deleteSnapshot('fake1-error.jsonl.gz');
      await deleteIndex('unpaywall-test');
    });
  });

  describe(`Do a download and insert between ${date1} and now`, async () => {
    before(async () => {
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await deleteSnapshot('fake1-error.jsonl.gz');
      await deleteIndex('unpaywall-test');
    });

    // test return message
    it('Should return the process start', async () => {
      const res = await chai.request(updateURL)
        .post('/job')
        .send({
          index: 'unpaywall-test',
          startDate: date1,
          interval: 'day',
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('X-API-KEY', 'admin');

      expect(res).have.status(200);
      expect(res.body.message).be.equal(`Download and insert snapshot from unpaywall from ${date1} and ${dateNow}`);
    });

    // test insertion
    it('Should insert 50 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(50);
    });

    // test state
    it('Should get state with all informations from the download and insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(true);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').equal('askUnpaywall');
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('success');

      expect(state.steps[1]).have.property('task').equal('download');
      expect(state.steps[1]).have.property('file').equal('fake1.jsonl.gz');
      expect(state.steps[1]).have.property('percent').equal(100);
      expect(state.steps[1]).have.property('took').to.not.equal(undefined);
      expect(state.steps[1]).have.property('status').equal('success');

      expect(state.steps[2]).have.property('task').equal('insert');
      expect(state.steps[2]).have.property('file').equal('fake1.jsonl.gz');
      expect(state.steps[2]).have.property('percent').equal(100);
      expect(state.steps[2]).have.property('linesRead').equal(50);
      expect(state.steps[2]).have.property('took').to.not.equal(undefined);
      expect(state.steps[2]).have.property('status').equal('success');

      expect(state.steps[3]).have.property('task').equal('download');
      expect(state.steps[3]).have.property('file').equal('fake1-error.jsonl.gz');
      expect(state.steps[3]).have.property('percent').equal(100);
      expect(state.steps[3]).have.property('took').to.not.equal(undefined);
      expect(state.steps[3]).have.property('status').equal('success');

      expect(state.steps[4]).have.property('task').equal('insert');
      expect(state.steps[4]).have.property('file').equal('fake1-error.jsonl.gz');
      expect(state.steps[4]).have.property('percent').equal(0);
      expect(state.steps[4]).have.property('linesRead').equal(50);
      expect(state.steps[4]).have.property('took').to.not.equal(undefined);
      expect(state.steps[4]).have.property('status').equal('error');
    });

    // test report
    it('Should get report with all informations from the download and insertion', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(true);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('askUnpaywall');
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('success');

      expect(report.steps[1]).have.property('task').equal('download');
      expect(report.steps[1]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[1]).have.property('percent').equal(100);
      expect(report.steps[1]).have.property('took').to.not.equal(undefined);
      expect(report.steps[1]).have.property('status').equal('success');

      expect(report.steps[2]).have.property('task').equal('insert');
      expect(report.steps[2]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[2]).have.property('percent').equal(100);
      expect(report.steps[2]).have.property('linesRead').equal(50);
      expect(report.steps[2]).have.property('took').to.not.equal(undefined);
      expect(report.steps[2]).have.property('status').equal('success');

      expect(report.steps[3]).have.property('task').equal('download');
      expect(report.steps[3]).have.property('file').equal('fake1-error.jsonl.gz');
      expect(report.steps[3]).have.property('percent').equal(100);
      expect(report.steps[3]).have.property('took').to.not.equal(undefined);
      expect(report.steps[3]).have.property('status').equal('success');

      expect(report.steps[4]).have.property('task').equal('insert');
      expect(report.steps[4]).have.property('file').equal('fake1-error.jsonl.gz');
      expect(report.steps[4]).have.property('percent').equal(0);
      expect(report.steps[4]).have.property('linesRead').equal(50);
      expect(report.steps[4]).have.property('took').to.not.equal(undefined);
      expect(report.steps[4]).have.property('status').equal('error');
    });

    after(async () => {
      await deleteIndex('unpaywall-test');
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
    });
  });

  after(async () => {
    await deleteSnapshot('fake1-error.jsonl.gz');
    await deleteIndex('unpaywall-test');
  });
});
