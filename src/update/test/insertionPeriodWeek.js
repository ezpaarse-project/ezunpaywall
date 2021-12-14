/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const {
  updateChangeFile,
} = require('./utils/snapshot');

const {
  getState,
} = require('./utils/state');

const {
  getReport,
} = require('./utils/report');

const {
  countDocuments,
} = require('./utils/elastic');

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

const updateURL = process.env.UPDATE_URL || 'http://localhost:4000';

chai.use(chaiHttp);

describe('Week: Test: download and insert file from unpaywall between a period', () => {
  const now = Date.now();
  const oneDay = (1 * 24 * 60 * 60 * 1000);

  // create date in a format (YYYY-mm-dd) to be use by ezunpaywall
  // yersterday
  const date1 = new Date(now - (1 * oneDay)).toISOString().slice(0, 10);
  // yersterday - one week
  const date2 = new Date(now - (8 * oneDay)).toISOString().slice(0, 10);
  // yersterday - two weeks
  const date3 = new Date(now - (15 * oneDay)).toISOString().slice(0, 10);
  // these dates are for test between a short period
  const date4 = new Date(now - (4 * oneDay)).toISOString().slice(0, 10);
  const date5 = new Date(now - (5 * oneDay)).toISOString().slice(0, 10);
  const tomorrow = new Date(now + (1 * oneDay)).toISOString().slice(0, 10);

  before(async function () {
    this.timeout(30000);
    await ping();
    await updateChangeFile('week');
  });

  describe(`Week: Do a download and insert between ${date2} and now`, async () => {
    before(async () => {
      await reset();
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/period')
        .send({
          index: 'unpaywall-test',
          startDate: date2,
          interval: 'week',
        })
        .set('x-api-key', 'admin');

      expect(res).have.status(202);
    });

    it('Should insert 150 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(150);
    });

    it('Should get state with all informations from the download and insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').equal('getChangefiles');
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('success');

      expect(state.steps[1]).have.property('task').equal('download');
      expect(state.steps[1]).have.property('file').equal('fake2.jsonl.gz');
      expect(state.steps[1]).have.property('percent').equal(100);
      expect(state.steps[1]).have.property('took').to.not.equal(undefined);
      expect(state.steps[1]).have.property('status').equal('success');

      expect(state.steps[2]).have.property('task').equal('insert');
      expect(state.steps[2]).have.property('index').equal('unpaywall-test');
      expect(state.steps[2]).have.property('file').equal('fake2.jsonl.gz');
      expect(state.steps[2]).have.property('percent').equal(100);
      expect(state.steps[2]).have.property('linesRead').equal(100);
      expect(state.steps[2]).have.property('insertedDocs').equal(100);
      expect(state.steps[2]).have.property('updatedDocs').equal(0);
      expect(state.steps[2]).have.property('failedDocs').equal(0);
      expect(state.steps[2]).have.property('took').to.not.equal(undefined);
      expect(state.steps[2]).have.property('status').equal('success');

      expect(state.steps[3]).have.property('task').equal('download');
      expect(state.steps[3]).have.property('file').equal('fake1.jsonl.gz');
      expect(state.steps[3]).have.property('percent').equal(100);
      expect(state.steps[3]).have.property('took').to.not.equal(undefined);
      expect(state.steps[3]).have.property('status').equal('success');

      expect(state.steps[4]).have.property('task').equal('insert');
      expect(state.steps[4]).have.property('index').equal('unpaywall-test');
      expect(state.steps[4]).have.property('file').equal('fake1.jsonl.gz');
      expect(state.steps[4]).have.property('percent').equal(100);
      expect(state.steps[4]).have.property('linesRead').equal(50);
      expect(state.steps[4]).have.property('insertedDocs').equal(50);
      expect(state.steps[4]).have.property('updatedDocs').equal(0);
      expect(state.steps[4]).have.property('failedDocs').equal(0);
      expect(state.steps[4]).have.property('took').to.not.equal(undefined);
      expect(state.steps[4]).have.property('status').equal('success');
    });

    it('Should get report with all informations from the download and insertion', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('getChangefiles');
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('success');

      expect(report.steps[1]).have.property('task').equal('download');
      expect(report.steps[1]).have.property('file').equal('fake2.jsonl.gz');
      expect(report.steps[1]).have.property('percent').equal(100);
      expect(report.steps[1]).have.property('took').to.not.equal(undefined);
      expect(report.steps[1]).have.property('status').equal('success');

      expect(report.steps[2]).have.property('task').equal('insert');
      expect(report.steps[2]).have.property('index').equal('unpaywall-test');
      expect(report.steps[2]).have.property('file').equal('fake2.jsonl.gz');
      expect(report.steps[2]).have.property('percent').equal(100);
      expect(report.steps[2]).have.property('linesRead').equal(100);
      expect(report.steps[2]).have.property('insertedDocs').equal(100);
      expect(report.steps[2]).have.property('updatedDocs').equal(0);
      expect(report.steps[2]).have.property('failedDocs').equal(0);
      expect(report.steps[2]).have.property('took').to.not.equal(undefined);
      expect(report.steps[2]).have.property('status').equal('success');

      expect(report.steps[3]).have.property('task').equal('download');
      expect(report.steps[3]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[3]).have.property('percent').equal(100);
      expect(report.steps[3]).have.property('took').to.not.equal(undefined);
      expect(report.steps[3]).have.property('status').equal('success');

      expect(report.steps[4]).have.property('task').equal('insert');
      expect(report.steps[4]).have.property('index').equal('unpaywall-test');
      expect(report.steps[4]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[4]).have.property('percent').equal(100);
      expect(report.steps[4]).have.property('linesRead').equal(50);
      expect(report.steps[4]).have.property('took').to.not.equal(undefined);
      expect(report.steps[4]).have.property('status').equal('success');
    });

    after(async () => {
      await reset();
    });
  });

  describe(`Week: Do a download and insert between ${date3} and ${date2}`, () => {
    before(async () => {
      await reset();
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/period')
        .send({
          index: 'unpaywall-test',
          startDate: date3,
          endDate: date2,
          interval: 'week',
        })
        .set('x-api-key', 'admin');

      expect(res).have.status(202);
    });

    it('Should insert 2100 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(2100);
    });

    it('Should get state with all informations from the download and insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').equal('getChangefiles');
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('success');

      expect(state.steps[1]).have.property('task').equal('download');
      expect(state.steps[1]).have.property('file').equal('fake3.jsonl.gz');
      expect(state.steps[1]).have.property('percent').equal(100);
      expect(state.steps[1]).have.property('took').to.not.equal(undefined);
      expect(state.steps[1]).have.property('status').equal('success');

      expect(state.steps[2]).have.property('task').equal('insert');
      expect(state.steps[2]).have.property('index').equal('unpaywall-test');
      expect(state.steps[2]).have.property('file').equal('fake3.jsonl.gz');
      expect(state.steps[2]).have.property('percent').equal(100);
      expect(state.steps[2]).have.property('linesRead').equal(2000);
      expect(state.steps[2]).have.property('insertedDocs').equal(2000);
      expect(state.steps[2]).have.property('updatedDocs').equal(0);
      expect(state.steps[2]).have.property('failedDocs').equal(0);
      expect(state.steps[2]).have.property('took').to.not.equal(undefined);
      expect(state.steps[2]).have.property('status').equal('success');

      expect(state.steps[3]).have.property('task').equal('download');
      expect(state.steps[3]).have.property('file').equal('fake2.jsonl.gz');
      expect(state.steps[3]).have.property('percent').equal(100);
      expect(state.steps[3]).have.property('took').to.not.equal(undefined);
      expect(state.steps[3]).have.property('status').equal('success');

      expect(state.steps[4]).have.property('task').equal('insert');
      expect(state.steps[4]).have.property('index').equal('unpaywall-test');
      expect(state.steps[4]).have.property('file').equal('fake2.jsonl.gz');
      expect(state.steps[4]).have.property('percent').equal(100);
      expect(state.steps[4]).have.property('linesRead').equal(100);
      expect(state.steps[4]).have.property('insertedDocs').equal(100);
      expect(state.steps[4]).have.property('updatedDocs').equal(0);
      expect(state.steps[4]).have.property('failedDocs').equal(0);
      expect(state.steps[4]).have.property('took').to.not.equal(undefined);
      expect(state.steps[4]).have.property('status').equal('success');
    });

    it('Should get report with all informations from the download and insertion', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('getChangefiles');
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('success');

      expect(report.steps[1]).have.property('task').equal('download');
      expect(report.steps[1]).have.property('file').equal('fake3.jsonl.gz');
      expect(report.steps[1]).have.property('percent').equal(100);
      expect(report.steps[1]).have.property('took').to.not.equal(undefined);
      expect(report.steps[1]).have.property('status').equal('success');

      expect(report.steps[2]).have.property('task').equal('insert');
      expect(report.steps[2]).have.property('index').equal('unpaywall-test');
      expect(report.steps[2]).have.property('file').equal('fake3.jsonl.gz');
      expect(report.steps[2]).have.property('percent').equal(100);
      expect(report.steps[2]).have.property('linesRead').equal(2000);
      expect(report.steps[2]).have.property('insertedDocs').equal(2000);
      expect(report.steps[2]).have.property('updatedDocs').equal(0);
      expect(report.steps[2]).have.property('failedDocs').equal(0);
      expect(report.steps[2]).have.property('took').to.not.equal(undefined);
      expect(report.steps[2]).have.property('status').equal('success');

      expect(report.steps[3]).have.property('task').equal('download');
      expect(report.steps[3]).have.property('file').equal('fake2.jsonl.gz');
      expect(report.steps[3]).have.property('percent').equal(100);
      expect(report.steps[3]).have.property('took').to.not.equal(undefined);
      expect(report.steps[3]).have.property('status').equal('success');

      expect(report.steps[4]).have.property('task').equal('insert');
      expect(report.steps[4]).have.property('index').equal('unpaywall-test');
      expect(report.steps[4]).have.property('file').equal('fake2.jsonl.gz');
      expect(report.steps[4]).have.property('percent').equal(100);
      expect(report.steps[4]).have.property('linesRead').equal(100);
      expect(report.steps[4]).have.property('insertedDocs').equal(100);
      expect(report.steps[4]).have.property('updatedDocs').equal(0);
      expect(report.steps[4]).have.property('failedDocs').equal(0);
      expect(report.steps[4]).have.property('took').to.not.equal(undefined);
      expect(report.steps[4]).have.property('status').equal('success');
    });
    after(async () => {
      await reset();
    });
  });

  describe(`Week: Don't download and insert between ${date5} and ${date4} because there is no file between these dates in ezunpaywall`, () => {
    before(async () => {
      await reset();
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/period')
        .send({
          index: 'unpaywall-test',
          startDate: date5,
          endDate: date4,
          interval: 'week',
        })
        .set('x-api-key', 'admin');

      expect(res).have.status(202);
    });

    it('Should insert nothing', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(0);
    });

    it('Should get state with all informations from the download and insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').equal('getChangefiles');
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('success');
    });

    after(async () => {
      await reset();
    });
  });

  describe(`Week: Don't do a download and insert with endDate=${date1} only`, () => {
    it('Should return status code 400', async () => {
      const res = await chai.request(updateURL)
        .post('/job/period')
        .send({
          index:
            'unpaywall-test',
          endDate: date1,
          interval: 'week',
        })
        .set('x-api-key', 'admin');

      expect(res).have.status(400);
    });
  });

  describe('Week: Don\'t do a download and insert with startDate in the wrong format', () => {
    it('Should return a status code 400', async () => {
      const res = await chai.request(updateURL)
        .post('/job/period')
        .query({
          index: 'unpaywall-test',
          startDate: 'doen\'t exist',
          interval: 'week',
        })
        .send({
          index: 'unpaywall-test',
          startDate: 'doen\'t exist',
        })
        .set('x-api-key', 'admin');

      expect(res).have.status(400);
    });

    it('Should return a status code 400', async () => {
      const res = await chai.request(updateURL)
        .post('/job/period')
        .send({
          index: 'unpaywall-test',
          startDate: '01-01-2000',
          interval: 'week',
        })
        .set('x-api-key', 'admin');

      expect(res).have.status(400);
    });

    it('Should return a status code 400', async () => {
      const res = await chai.request(updateURL)
        .post('/job/period')
        .send({
          index: 'unpaywall-test',
          startDate: '2000-50-50',
          interval: 'week',
        })
        .set('x-api-key', 'admin');

      expect(res).have.status(400);
    });
  });

  describe(`Week: Don't download and insert between ${date2} and ${date3} because startDate=${date2} is superior than endDate=${date3}`, () => {
    it('Should return a status code 400', async () => {
      const res = await chai.request(updateURL)
        .post('/job/period')
        .send({
          index: 'unpaywall-test',
          startDate: date2,
          endDate: date3,
          interval: 'week',
        })
        .set('x-api-key', 'admin');

      expect(res).have.status(400);
    });
  });

  describe(`Week: Don't download and insert with startDate=${tomorrow} because there can be no futuristic file`, () => {
    it('Should return a status code 400', async () => {
      const res = await chai.request(updateURL)
        .post('/job/period')
        .send({
          index: 'unpaywall-test',
          startDate: tomorrow,
          interval: 'week',
        })
        .set('x-api-key', 'admin');

      expect(res).have.status(400);
    });
  });

  after(async () => {
    await reset();
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });
});
