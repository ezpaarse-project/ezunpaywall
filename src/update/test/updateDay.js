/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const { countDocuments } = require('./utils/elastic');
const { addSnapshot, updateChangeFile } = require('./utils/snapshot');
const { getState } = require('./utils/state');
const getReport = require('./utils/report');
const checkIfInUpdate = require('./utils/status');

const ping = require('./utils/ping');
const reset = require('./utils/reset');

chai.use(chaiHttp);

const updateURL = process.env.UPDATE_HOST || 'http://localhost:59702';

describe('Test: daily update route test', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
    await updateChangeFile('day');
  });

  describe('Day: Do daily update', () => {
    before(async () => {
      await reset();
    });

    // test response
    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/period')
        .send({
          index: 'unpaywall-test',
          interval: 'day',
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

    it('Should get state with all information from the daily update', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);
      expect(state).have.property('totalInsertedDocs').equal(50);
      expect(state).have.property('totalUpdatedDocs').equal(0);

      expect(state.steps[0]).have.property('task').be.equal('getChangefiles');
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

    it('Should get report with all information from the daily update', async () => {
      const report = await getReport('unpaywall');

      expect(report).have.property('done');
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);
      expect(report).have.property('totalInsertedDocs').equal(50);
      expect(report).have.property('totalUpdatedDocs').equal(0);

      expect(report.steps[0]).have.property('task').be.equal('getChangefiles');
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
      await reset();
    });
  });

  describe('Day: daily update 2 times', () => {
    before(async () => {
      await reset();
    });

    // test response
    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/period')
        .send({
          index: 'unpaywall-test',
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

    it('Should get state with all information from the weekly update', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);
      expect(state).have.property('totalInsertedDocs').equal(50);
      expect(state).have.property('totalUpdatedDocs').equal(0);

      expect(state.steps[0]).have.property('task').be.equal('getChangefiles');
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

    it('Should get report with all information from the weekly update', async () => {
      const report = await getReport('unpaywall');

      expect(report).have.property('done');
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);
      expect(report).have.property('totalInsertedDocs').equal(50);
      expect(report).have.property('totalUpdatedDocs').equal(0);

      expect(report.steps[0]).have.property('task').be.equal('getChangefiles');
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

    // test response
    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/period')
        .send({
          index: 'unpaywall-test',
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

    it('Should get state with all information from the weekly update', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);
      expect(state).have.property('totalInsertedDocs').equal(0);
      expect(state).have.property('totalUpdatedDocs').equal(50);

      expect(state.steps[0]).have.property('task').be.equal('getChangefiles');
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').be.equal('success');

      expect(state.steps[1]).have.property('task').be.equal('insert');
      expect(state.steps[1]).have.property('index').equal('unpaywall-test');
      expect(state.steps[1]).have.property('file').be.equal('fake1.jsonl.gz');
      expect(state.steps[1]).have.property('percent').be.equal(100);
      expect(state.steps[1]).have.property('linesRead').be.equal(50);
      expect(state.steps[1]).have.property('insertedDocs').equal(0);
      expect(state.steps[1]).have.property('updatedDocs').equal(50);
      expect(state.steps[1]).have.property('failedDocs').equal(0);
      expect(state.steps[1]).have.property('took').to.not.equal(undefined);
      expect(state.steps[1]).have.property('status').be.equal('success');

      expect(state.done).be.equal(true);
    });

    it('Should get report with all information from the weekly update', async () => {
      const report = await getReport('unpaywall');

      expect(report).have.property('done');
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);
      expect(report).have.property('totalInsertedDocs').equal(0);
      expect(report).have.property('totalUpdatedDocs').equal(50);

      expect(report.steps[0]).have.property('task').be.equal('getChangefiles');
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').be.equal('success');

      expect(report.steps[1]).have.property('task').be.equal('insert');
      expect(report.steps[1]).have.property('index').equal('unpaywall-test');
      expect(report.steps[1]).have.property('file').be.equal('fake1.jsonl.gz');
      expect(report.steps[1]).have.property('percent').be.equal(100);
      expect(report.steps[1]).have.property('linesRead').be.equal(50);
      expect(report.steps[1]).have.property('insertedDocs').equal(0);
      expect(report.steps[1]).have.property('updatedDocs').equal(50);
      expect(report.steps[1]).have.property('failedDocs').equal(0);
      expect(report.steps[1]).have.property('took').to.not.equal(undefined);
      expect(report.steps[1]).have.property('status').be.equal('success');
    });

    after(async () => {
      await reset();
    });
  });

  describe('Day: Do a daily update but the file is already installed', () => {
    before(async () => {
      await reset();
      await addSnapshot('fake1.jsonl.gz');
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/period')
        .send({
          index: 'unpaywall-test',
          interval: 'day',
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

    it('Should get state with all information from the daily update', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);
      expect(state).have.property('totalInsertedDocs').equal(50);
      expect(state).have.property('totalUpdatedDocs').equal(0);

      expect(state.steps[0]).have.property('task').equal('getChangefiles');
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('success');

      expect(state.steps[1]).have.property('task').equal('insert');
      expect(state.steps[1]).have.property('index').equal('unpaywall-test');
      expect(state.steps[1]).have.property('file').equal('fake1.jsonl.gz');
      expect(state.steps[1]).have.property('percent').equal(100);
      expect(state.steps[1]).have.property('linesRead').equal(50);
      expect(state.steps[1]).have.property('insertedDocs').equal(50);
      expect(state.steps[1]).have.property('updatedDocs').equal(0);
      expect(state.steps[1]).have.property('failedDocs').equal(0);
      expect(state.steps[1]).have.property('took').to.not.equal(undefined);
      expect(state.steps[1]).have.property('status').equal('success');
    });

    it('Should get report with all information from the daily update', async () => {
      const report = await getReport('unpaywall');

      expect(report).have.property('done').equal(true);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);
      expect(report).have.property('totalInsertedDocs').equal(50);
      expect(report).have.property('totalUpdatedDocs').equal(0);

      expect(report.steps[0]).have.property('task').equal('getChangefiles');
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
      await reset();
    });
  });

  after(async () => {
    await reset();
  });
});
