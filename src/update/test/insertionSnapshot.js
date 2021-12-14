/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { format } = require('date-fns');

const {
  countDocuments,
  deleteIndex,
} = require('./utils/elastic');

const {
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

describe('Test: download and insert snapshot from unpaywall', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
  });

  describe('Do a download and a insertion of snapshot', () => {
    before(async () => {
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await deleteSnapshot('snapshot.jsonl.gz');
      await deleteIndex('unpaywall-test');
    });

    // test return message
    it('Should return the process start', async () => {
      const res = await chai.request(updateURL)
        .post('/job')
        .send({
          index: 'unpaywall-test',
          snapshot: true,
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('x-api-key', 'admin');

      expect(res).have.status(200);
      expect(res.body.message).be.equal('Big update started');
    });

    // test insertion
    it('Should insert 2150 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      do {
        isUpdate = await checkIfInUpdate();
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (isUpdate);

      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(2150);
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

      expect(state.steps[0]).have.property('task').equal('download');
      expect(state.steps[0]).have.property('percent').equal(100);
      expect(state.steps[1]).have.property('took').to.not.equal(undefined);
      expect(state.steps[1]).have.property('status').equal('success');
      expect(state.steps[1]).have.property('file').equal(`unpaywall-${format(new Date(), 'yyyy-MM-dd')}.jsonl.gz`);

      expect(state.steps[1]).have.property('task').equal('insert');
      expect(state.steps[1]).have.property('index').equal('unpaywall-test');
      expect(state.steps[1]).have.property('file').equal(`unpaywall-${format(new Date(), 'yyyy-MM-dd')}.jsonl.gz`);
      expect(state.steps[1]).have.property('percent').equal(100);
      expect(state.steps[1]).have.property('linesRead').equal(2150);
      expect(state.steps[1]).have.property('insertedDocs').equal(2150);
      expect(state.steps[1]).have.property('updatedDocs').equal(0);
      expect(state.steps[1]).have.property('failedDocs').equal(0);
      expect(state.steps[1]).have.property('took').to.not.equal(undefined);
      expect(state.steps[1]).have.property('status').equal('success');
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

      expect(report.steps[0]).have.property('task').equal('download');
      expect(report.steps[0]).have.property('percent').equal(100);
      expect(report.steps[1]).have.property('took').to.not.equal(undefined);
      expect(report.steps[1]).have.property('status').equal('success');
      expect(report.steps[1]).have.property('file').equal(`unpaywall-${format(new Date(), 'yyyy-MM-dd')}.jsonl.gz`);

      expect(report.steps[1]).have.property('task').equal('insert');
      expect(report.steps[1]).have.property('index').equal('unpaywall-test');
      expect(report.steps[1]).have.property('file').equal(`unpaywall-${format(new Date(), 'yyyy-MM-dd')}.jsonl.gz`);
      expect(report.steps[1]).have.property('percent').equal(100);
      expect(report.steps[1]).have.property('linesRead').equal(2150);
      expect(report.steps[1]).have.property('insertedDocs').equal(2150);
      expect(report.steps[1]).have.property('updatedDocs').equal(0);
      expect(report.steps[1]).have.property('failedDocs').equal(0);
      expect(report.steps[1]).have.property('took').to.not.equal(undefined);
      expect(report.steps[1]).have.property('status').equal('success');
    });

    after(async () => {
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await deleteSnapshot('snapshot.jsonl.gz');
      await deleteIndex('unpaywall-test');
    });
  });
});
