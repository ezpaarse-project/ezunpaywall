/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const { deleteChangefile, updateChangefile } = require('./utils/changefile');
const { getState } = require('./utils/state');
const getReport = require('./utils/report');
const { countDocuments, deleteIndex } = require('./utils/elastic');
const checkStatus = require('./utils/status');

const ping = require('./utils/ping');
const reset = require('./utils/reset');

const adminURL = process.env.ADMIN_URL || 'http://localhost:59703';

chai.use(chaiHttp);

describe('Test: download and insert file from unpaywall between a period', () => {
  const now = Date.now();
  const oneDay = (1 * 24 * 60 * 60 * 1000);

  // create date in a format (YYYY-mm-dd) to be use by ezunpaywall
  // yesterday
  const date1 = new Date(now - (1 * oneDay)).toISOString().slice(0, 10);
  // 2 days before
  const date2 = new Date(now - (2 * oneDay)).toISOString().slice(0, 10);

  // these dates are for test with dates on which no update file has been published from unpaywall
  const date3 = new Date(now - (6 * oneDay)).toISOString().slice(0, 10);
  const date4 = new Date(now - (7 * oneDay)).toISOString().slice(0, 10);
  const tomorrow = new Date(now + (1 * oneDay)).toISOString().slice(0, 10);

  before(async function () {
    this.timeout(30000);
    await ping();
    await updateChangefile('day');
  });

  describe(`Day: Do a download and insert between ${date1} and now`, async () => {
    before(async () => {
      await reset();
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(adminURL)
        .post('/job/download/insert/changefile/period')
        .send({
          index: 'unpaywall-test',
          startDate: date1,
          interval: 'day',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should insert 150 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => { setTimeout(resolve, 100); });
        isUpdate = await checkStatus();
      }
      const count = await countDocuments('unpaywall-test');

      expect(count).to.equal(150);
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
      expect(indices[0]).have.property('added').equal(150);
      expect(indices[0]).have.property('updated').equal(0);

      expect(result.steps[0]).have.property('task').equal('getChangefiles');
      expect(result.steps[0]).have.property('took').to.not.equal(undefined);
      expect(result.steps[0]).have.property('status').equal('success');

      expect(result.steps[1]).have.property('task').equal('download');
      expect(result.steps[1]).have.property('file').equal('fake2.jsonl.gz');
      expect(result.steps[1]).have.property('percent').equal(100);
      expect(result.steps[1]).have.property('took').to.not.equal(undefined);
      expect(result.steps[1]).have.property('status').equal('success');

      expect(result.steps[2]).have.property('task').equal('insert');
      expect(result.steps[2]).have.property('index').equal('unpaywall-test');
      expect(result.steps[2]).have.property('file').equal('fake2.jsonl.gz');
      expect(result.steps[2]).have.property('percent').equal(100);
      expect(result.steps[2]).have.property('linesRead').equal(100);
      expect(result.steps[2]).have.property('addedDocs').equal(100);
      expect(result.steps[2]).have.property('updatedDocs').equal(0);
      expect(result.steps[2]).have.property('failedDocs').equal(0);
      expect(result.steps[2]).have.property('took').to.not.equal(undefined);
      expect(result.steps[2]).have.property('status').equal('success');

      expect(result.steps[3]).have.property('task').equal('download');
      expect(result.steps[3]).have.property('file').equal('fake1.jsonl.gz');
      expect(result.steps[3]).have.property('percent').equal(100);
      expect(result.steps[3]).have.property('took').to.not.equal(undefined);
      expect(result.steps[3]).have.property('status').equal('success');

      expect(result.steps[4]).have.property('task').equal('insert');
      expect(result.steps[4]).have.property('file').equal('fake1.jsonl.gz');
      expect(result.steps[4]).have.property('percent').equal(100);
      expect(result.steps[4]).have.property('linesRead').equal(50);
      expect(result.steps[4]).have.property('addedDocs').equal(50);
      expect(result.steps[4]).have.property('updatedDocs').equal(0);
      expect(result.steps[4]).have.property('failedDocs').equal(0);
      expect(result.steps[4]).have.property('took').to.not.equal(undefined);
      expect(result.steps[4]).have.property('status').equal('success');
    }

    it('Should get state with all information from the download and insertion', async () => {
      const state = await getState();
      testResult(state);
    });

    it('Should get report with all information from the download and insertion', async () => {
      const report = await getReport('dataUpdate');
      testResult(report);
    });

    after(async () => {
      await reset();
    });
  });

  describe(`Day: Do a download and insert between ${date2} and ${date1}`, () => {
    before(async () => {
      await reset();
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(adminURL)
        .post('/job/download/insert/changefile/period')
        .send({
          index: 'unpaywall-test',
          startDate: date2,
          endDate: date1,
          interval: 'day',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should insert 2100 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => { setTimeout(resolve, 100); });
        isUpdate = await checkStatus();
      }
      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(2100);
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
      expect(indices[0]).have.property('added').equal(2100);
      expect(indices[0]).have.property('updated').equal(0);

      expect(result.steps[0]).have.property('task').equal('getChangefiles');
      expect(result.steps[0]).have.property('took').to.not.equal(undefined);
      expect(result.steps[0]).have.property('status').equal('success');

      expect(result.steps[1]).have.property('task').equal('download');
      expect(result.steps[1]).have.property('file').equal('fake3.jsonl.gz');
      expect(result.steps[1]).have.property('percent').equal(100);
      expect(result.steps[1]).have.property('took').to.not.equal(undefined);
      expect(result.steps[1]).have.property('status').equal('success');

      expect(result.steps[2]).have.property('task').equal('insert');
      expect(result.steps[2]).have.property('index').equal('unpaywall-test');
      expect(result.steps[2]).have.property('file').equal('fake3.jsonl.gz');
      expect(result.steps[2]).have.property('percent').equal(100);
      expect(result.steps[2]).have.property('linesRead').equal(2000);
      expect(result.steps[2]).have.property('addedDocs').equal(2000);
      expect(result.steps[2]).have.property('updatedDocs').equal(0);
      expect(result.steps[2]).have.property('failedDocs').equal(0);
      expect(result.steps[2]).have.property('took').to.not.equal(undefined);
      expect(result.steps[2]).have.property('status').equal('success');

      expect(result.steps[3]).have.property('task').equal('download');
      expect(result.steps[3]).have.property('file').equal('fake2.jsonl.gz');
      expect(result.steps[3]).have.property('percent').equal(100);
      expect(result.steps[3]).have.property('took').to.not.equal(undefined);
      expect(result.steps[3]).have.property('status').equal('success');

      expect(result.steps[4]).have.property('task').equal('insert');
      expect(result.steps[4]).have.property('index').equal('unpaywall-test');
      expect(result.steps[4]).have.property('file').equal('fake2.jsonl.gz');
      expect(result.steps[4]).have.property('percent').equal(100);
      expect(result.steps[4]).have.property('linesRead').equal(100);
      expect(result.steps[4]).have.property('addedDocs').equal(100);
      expect(result.steps[4]).have.property('updatedDocs').equal(0);
      expect(result.steps[4]).have.property('failedDocs').equal(0);
      expect(result.steps[4]).have.property('took').to.not.equal(undefined);
      expect(result.steps[4]).have.property('status').equal('success');
    }

    it('Should get state with all information from the download and insertion', async () => {
      const state = await getState();
      testResult(state);
    });

    it('Should get report with all information from the download and insertion', async () => {
      const report = await getReport('dataUpdate');
      testResult(report);
    });
    after(async () => {
      await reset();
    });
  });

  describe(`Day: Don't download and insert between ${date4} and ${date3} because there is no file between these dates in ezunpaywall`, () => {
    before(async () => {
      await reset();
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(adminURL)
        .post('/job/download/insert/changefile/period')
        .send({
          index: 'unpaywall-test',
          startDate: date4,
          endDate: date3,
          interval: 'day',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should insert nothing', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => { setTimeout(resolve, 100); });
        isUpdate = await checkStatus();
      }
      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(0);
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
      expect(indices[0]).have.property('added').equal(0);
      expect(indices[0]).have.property('updated').equal(0);

      expect(result.steps[0]).have.property('task').equal('getChangefiles');
      expect(result.steps[0]).have.property('took').to.not.equal(undefined);
      expect(result.steps[0]).have.property('status').equal('success');
    }

    it('Should get state with all information from the download and insertion', async () => {
      const state = await getState();
      testResult(state);
    });

    it('Should get report with all information from the download and insertion', async () => {
      const report = await getReport('dataUpdate');
      testResult(report);
    });

    after(async () => {
      await reset();
    });
  });

  describe(`Day: Don't do a download and insert with endDate=${date1} only`, () => {
    it('Should return a status code 400', async () => {
      const res = await chai.request(adminURL)
        .post('/job/download/insert/changefile/period')
        .send({
          index: 'unpaywall-test',
          endDate: date1,
          interval: 'day',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(400);
    });
  });

  describe('Day: Don\'t do a download and insert with startDate in the wrong format', () => {
    it('Should return a status code 400', async () => {
      const res = await chai.request(adminURL)
        .post('/job/download/insert/changefile/period')
        .query({ index: 'unpaywall-test', startDate: 'doen\'t exist' })
        .send({
          index: 'unpaywall-test',
          startDate: 'doesn\'t exist',
          interval: 'day',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(400);
    });

    it('Should return a status code 400', async () => {
      const res = await chai.request(adminURL)
        .post('/job/download/insert/changefile/period')
        .send({
          index: 'unpaywall-test',
          startDate: '01-01-2000',
          interval: 'day',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(400);
    });

    it('Should return a status code 400', async () => {
      const res = await chai.request(adminURL)
        .post('/job/download/insert/changefile/period')
        .send({
          index: 'unpaywall-test',
          startDate: '2000-50-50',
          interval: 'day',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(400);
    });
  });

  describe(`Day: Don't download and insert between ${date2} and ${date3} because startDate=${date2} is superior than endDate=${date3}`, () => {
    it('Should return a status code 400', async () => {
      const res = await chai.request(adminURL)
        .post('/job/download/insert/changefile/period')
        .send({
          index: 'unpaywall-test',
          startDate: date2,
          endDate: date3,
          interval: 'day',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(400);
    });
  });

  describe(`Day: Don't download and insert with startDate=${tomorrow} because there can be no futuristic file`, () => {
    it('Should return a status code 400', async () => {
      const res = await chai.request(adminURL)
        .post('/job/download/insert/changefile/period')
        .send({
          index: 'unpaywall-test',
          startDate: tomorrow,
          interval: 'day',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(400);
    });
  });

  after(async () => {
    await deleteIndex('unpaywall-test');
    await deleteChangefile('fake1.jsonl.gz');
    await deleteChangefile('fake2.jsonl.gz');
    await deleteChangefile('fake3.jsonl.gz');
  });
});
