/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const ping = require('./utils/ping');
const reset = require('./utils/reset');

chai.use(chaiHttp);

const updateURL = process.env.UPDATE_HOST || 'http://localhost:59702';

const { countDocuments } = require('./utils/elastic');
const { addSnapshot, insertSnapshot, insertInHistory } = require('./utils/snapshot');
const { getState } = require('./utils/state');
const getReport = require('./utils/report');
const checkIfInUpdate = require('./utils/status');

const date2 = '2020-01-02';
const date3 = '2020-01-03';
const date4 = '2020-01-04';
const date5 = '2019-01-02';

// TODO Test historique classique
describe('Test: daily update route test with history', () => {
  before(async function () {
    this.timeout(1000);
    await ping();
    await reset();
    await addSnapshot('2020-01-01-snapshot.jsonl.gz');
    await insertSnapshot('2020-01-01-snapshot.jsonl.gz', 'unpaywall_base');
  });

  describe('insert changefile 2020-01-02', () => {
    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/history')
        .send({
          startDate: date2,
          endDate: date2,
          interval: 'day',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should insert 3 data in history', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => { setTimeout(resolve, 100); });
        isUpdate = await checkIfInUpdate();
      }
      const countUnpaywallBase = await countDocuments('unpaywall_base');
      expect(countUnpaywallBase).to.equal(5);
      const countUnpaywallHistory = await countDocuments('unpaywall_history');
      expect(countUnpaywallHistory).to.equal(3);
      // TODO test elastic request
    });

    it('Should get state with all information from the download and insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('error').equal(false);
      expect(state).have.property('type').equal('unpaywallHistory');
      expect(state).have.property('took').to.not.equal(undefined);
      expect(state).have.property('totalBaseInsertedDocs').equal(0);
      expect(state).have.property('totalBaseUpdatedDocs').equal(3);
      expect(state).have.property('totalHistoryInsertedDocs').equal(3);
      expect(state).have.property('totalHistoryUpdatedDocs').equal(0);
      expect(state).have.property('steps').to.be.an('array');

      const stepChangefile = state.steps[0];

      expect(stepChangefile).have.property('task').equal('getChangefiles');
      expect(stepChangefile).have.property('took').to.not.equal(undefined);
      expect(stepChangefile).have.property('status').equal('success');

      const stepDownload = state.steps[1];

      expect(stepDownload).have.property('task').equal('download');
      expect(stepDownload).have.property('file').equal('2020-01-02-history.jsonl.gz');
      expect(stepDownload).have.property('percent').equal(100);
      expect(stepDownload).have.property('took').to.not.equal(undefined);
      expect(stepDownload).have.property('status').equal('success');

      const stepInsert = state.steps[2];

      expect(stepInsert).have.property('task').equal('insert');
      expect(stepInsert).have.property('file').equal('2020-01-02-history.jsonl.gz');
      expect(stepInsert).have.property('percent').equal(100);
      expect(stepInsert).have.property('linesRead').equal(3);
      expect(stepInsert).have.property('insertedDocs').equal(0);
      expect(stepInsert).have.property('updatedDocs').equal(0);
      expect(stepInsert).have.property('failedDocs').equal(0);
      expect(stepInsert).have.property('took').to.not.equal(undefined);
      expect(stepInsert).have.property('status').equal('success');

      const indexBase = stepInsert.index.unpaywall_base;
      expect(indexBase).have.property('insertedDocs').equal(0);
      expect(indexBase).have.property('updatedDocs').equal(3);
      expect(indexBase).have.property('failedDocs').equal(0);

      const indexHistory = stepInsert.index.unpaywall_history;
      expect(indexHistory).have.property('insertedDocs').equal(3);
      expect(indexHistory).have.property('updatedDocs').equal(0);
      expect(indexHistory).have.property('failedDocs').equal(0);
    });

    it('Should get report with all information from the download and insertion', async () => {
      const report = await getReport('unpaywallHistory');

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('error').equal(false);
      expect(report).have.property('type').equal('unpaywallHistory');
      expect(report).have.property('took').to.not.equal(undefined);
      expect(report).have.property('totalBaseInsertedDocs').equal(0);
      expect(report).have.property('totalBaseUpdatedDocs').equal(3);
      expect(report).have.property('totalHistoryInsertedDocs').equal(3);
      expect(report).have.property('totalHistoryUpdatedDocs').equal(0);
      expect(report).have.property('steps').to.be.an('array');

      const stepChangefile = report.steps[0];

      expect(stepChangefile).have.property('task').equal('getChangefiles');
      expect(stepChangefile).have.property('took').to.not.equal(undefined);
      expect(stepChangefile).have.property('status').equal('success');

      const stepDownload = report.steps[1];

      expect(stepDownload).have.property('task').equal('download');
      expect(stepDownload).have.property('file').equal('2020-01-02-history.jsonl.gz');
      expect(stepDownload).have.property('percent').equal(100);
      expect(stepDownload).have.property('took').to.not.equal(undefined);
      expect(stepDownload).have.property('status').equal('success');

      const stepInsert = report.steps[2];

      expect(stepInsert).have.property('task').equal('insert');
      expect(stepInsert).have.property('file').equal('2020-01-02-history.jsonl.gz');
      expect(stepInsert).have.property('percent').equal(100);
      expect(stepInsert).have.property('linesRead').equal(3);
      expect(stepInsert).have.property('insertedDocs').equal(0);
      expect(stepInsert).have.property('updatedDocs').equal(0);
      expect(stepInsert).have.property('failedDocs').equal(0);
      expect(stepInsert).have.property('took').to.not.equal(undefined);
      expect(stepInsert).have.property('status').equal('success');

      const indexBase = stepInsert.index.unpaywall_base;
      expect(indexBase).have.property('insertedDocs').equal(0);
      expect(indexBase).have.property('updatedDocs').equal(3);
      expect(indexBase).have.property('failedDocs').equal(0);

      const indexHistory = stepInsert.index.unpaywall_history;
      expect(indexHistory).have.property('insertedDocs').equal(3);
      expect(indexHistory).have.property('updatedDocs').equal(0);
      expect(indexHistory).have.property('failedDocs').equal(0);
    });
  });

  describe('insert changefile 2020-01-03', () => {
    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/history')
        .send({
          startDate: date3,
          endDate: date3,
          interval: 'day',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should insert 2 data in history', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => { setTimeout(resolve, 100); });
        isUpdate = await checkIfInUpdate();
      }
      const countUnpaywallBase = await countDocuments('unpaywall_base');
      expect(countUnpaywallBase).to.equal(5);
      const countUnpaywallHistory = await countDocuments('unpaywall_history');
      expect(countUnpaywallHistory).to.equal(5);
      // TODO test elastic request
    });

    it('Should get state with all information from the download and insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('error').equal(false);
      expect(state).have.property('type').equal('unpaywallHistory');
      expect(state).have.property('took').to.not.equal(undefined);
      expect(state).have.property('totalBaseInsertedDocs').equal(0);
      expect(state).have.property('totalBaseUpdatedDocs').equal(2);
      expect(state).have.property('totalHistoryInsertedDocs').equal(2);
      expect(state).have.property('totalHistoryUpdatedDocs').equal(0);
      expect(state).have.property('steps').to.be.an('array');

      const stepChangefile = state.steps[0];

      expect(stepChangefile).have.property('task').equal('getChangefiles');
      expect(stepChangefile).have.property('took').to.not.equal(undefined);
      expect(stepChangefile).have.property('status').equal('success');

      const stepDownload = state.steps[1];

      expect(stepDownload).have.property('task').equal('download');
      expect(stepDownload).have.property('file').equal('2020-01-03-history.jsonl.gz');
      expect(stepDownload).have.property('percent').equal(100);
      expect(stepDownload).have.property('took').to.not.equal(undefined);
      expect(stepDownload).have.property('status').equal('success');

      const stepInsert = state.steps[2];

      expect(stepInsert).have.property('task').equal('insert');
      expect(stepInsert).have.property('file').equal('2020-01-03-history.jsonl.gz');
      expect(stepInsert).have.property('percent').equal(100);
      expect(stepInsert).have.property('linesRead').equal(2);
      expect(stepInsert).have.property('insertedDocs').equal(0);
      expect(stepInsert).have.property('updatedDocs').equal(0);
      expect(stepInsert).have.property('failedDocs').equal(0);
      expect(stepInsert).have.property('took').to.not.equal(undefined);
      expect(stepInsert).have.property('status').equal('success');

      const indexBase = stepInsert.index.unpaywall_base;
      expect(indexBase).have.property('insertedDocs').equal(0);
      expect(indexBase).have.property('updatedDocs').equal(2);
      expect(indexBase).have.property('failedDocs').equal(0);

      const indexHistory = stepInsert.index.unpaywall_history;
      expect(indexHistory).have.property('insertedDocs').equal(2);
      expect(indexHistory).have.property('updatedDocs').equal(0);
      expect(indexHistory).have.property('failedDocs').equal(0);
    });

    it('Should get report with all information from the download and insertion', async () => {
      const report = await getReport('unpaywallHistory');

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('error').equal(false);
      expect(report).have.property('type').equal('unpaywallHistory');
      expect(report).have.property('took').to.not.equal(undefined);
      expect(report).have.property('totalBaseInsertedDocs').equal(0);
      expect(report).have.property('totalBaseUpdatedDocs').equal(2);
      expect(report).have.property('totalHistoryInsertedDocs').equal(2);
      expect(report).have.property('totalHistoryUpdatedDocs').equal(0);
      expect(report).have.property('steps').to.be.an('array');

      const stepChangefile = report.steps[0];

      expect(stepChangefile).have.property('task').equal('getChangefiles');
      expect(stepChangefile).have.property('took').to.not.equal(undefined);
      expect(stepChangefile).have.property('status').equal('success');

      const stepDownload = report.steps[1];

      expect(stepDownload).have.property('task').equal('download');
      expect(stepDownload).have.property('file').equal('2020-01-03-history.jsonl.gz');
      expect(stepDownload).have.property('percent').equal(100);
      expect(stepDownload).have.property('took').to.not.equal(undefined);
      expect(stepDownload).have.property('status').equal('success');

      const stepInsert = report.steps[2];

      expect(stepInsert).have.property('task').equal('insert');
      expect(stepInsert).have.property('file').equal('2020-01-03-history.jsonl.gz');
      expect(stepInsert).have.property('percent').equal(100);
      expect(stepInsert).have.property('linesRead').equal(2);
      expect(stepInsert).have.property('insertedDocs').equal(0);
      expect(stepInsert).have.property('updatedDocs').equal(0);
      expect(stepInsert).have.property('failedDocs').equal(0);
      expect(stepInsert).have.property('took').to.not.equal(undefined);
      expect(stepInsert).have.property('status').equal('success');

      const indexBase = stepInsert.index.unpaywall_base;
      expect(indexBase).have.property('insertedDocs').equal(0);
      expect(indexBase).have.property('updatedDocs').equal(2);
      expect(indexBase).have.property('failedDocs').equal(0);

      const indexHistory = stepInsert.index.unpaywall_history;
      expect(indexHistory).have.property('insertedDocs').equal(2);
      expect(indexHistory).have.property('updatedDocs').equal(0);
      expect(indexHistory).have.property('failedDocs').equal(0);
    });
  });

  describe('insert changefile 2020-01-03 again', () => {
    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/history')
        .send({
          startDate: date3,
          endDate: date3,
          interval: 'day',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should insert 0 data in history', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => { setTimeout(resolve, 100); });
        isUpdate = await checkIfInUpdate();
      }
      const countUnpaywallBase = await countDocuments('unpaywall_base');
      expect(countUnpaywallBase).to.equal(5);
      const countUnpaywallHistory = await countDocuments('unpaywall_history');
      expect(countUnpaywallHistory).to.equal(5);
      // TODO test elastic request
    });

    it('Should get state with all information from the download and insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('error').equal(false);
      expect(state).have.property('type').equal('unpaywallHistory');
      expect(state).have.property('took').to.not.equal(undefined);
      expect(state).have.property('totalBaseInsertedDocs').equal(0);
      expect(state).have.property('totalBaseUpdatedDocs').equal(2);
      expect(state).have.property('totalHistoryInsertedDocs').equal(0);
      expect(state).have.property('totalHistoryUpdatedDocs').equal(0);
      expect(state).have.property('steps').to.be.an('array');

      const stepChangefile = state.steps[0];

      expect(stepChangefile).have.property('task').equal('getChangefiles');
      expect(stepChangefile).have.property('took').to.not.equal(undefined);
      expect(stepChangefile).have.property('status').equal('success');

      const stepDownload = state.steps[1];

      expect(stepDownload).have.property('task').equal('download');
      expect(stepDownload).have.property('file').equal('2020-01-03-history.jsonl.gz');
      expect(stepDownload).have.property('percent').equal(100);
      expect(stepDownload).have.property('took').to.not.equal(undefined);
      expect(stepDownload).have.property('status').equal('success');

      const stepInsert = state.steps[2];

      expect(stepInsert).have.property('task').equal('insert');
      expect(stepInsert).have.property('file').equal('2020-01-03-history.jsonl.gz');
      expect(stepInsert).have.property('percent').equal(100);
      expect(stepInsert).have.property('linesRead').equal(2);
      expect(stepInsert).have.property('insertedDocs').equal(0);
      expect(stepInsert).have.property('updatedDocs').equal(0);
      expect(stepInsert).have.property('failedDocs').equal(0);
      expect(stepInsert).have.property('took').to.not.equal(undefined);
      expect(stepInsert).have.property('status').equal('success');

      const indexBase = stepInsert.index.unpaywall_base;
      expect(indexBase).have.property('insertedDocs').equal(0);
      expect(indexBase).have.property('updatedDocs').equal(2);
      expect(indexBase).have.property('failedDocs').equal(0);

      const indexHistory = stepInsert.index.unpaywall_history;
      expect(indexHistory).have.property('insertedDocs').equal(0);
      expect(indexHistory).have.property('updatedDocs').equal(0);
      expect(indexHistory).have.property('failedDocs').equal(0);
    });

    it('Should get report with all information from the download and insertion', async () => {
      const report = await getReport('unpaywallHistory');

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('error').equal(false);
      expect(report).have.property('type').equal('unpaywallHistory');
      expect(report).have.property('took').to.not.equal(undefined);
      expect(report).have.property('totalBaseInsertedDocs').equal(0);
      expect(report).have.property('totalBaseUpdatedDocs').equal(2);
      expect(report).have.property('totalHistoryInsertedDocs').equal(0);
      expect(report).have.property('totalHistoryUpdatedDocs').equal(0);
      expect(report).have.property('steps').to.be.an('array');

      const stepChangefile = report.steps[0];

      expect(stepChangefile).have.property('task').equal('getChangefiles');
      expect(stepChangefile).have.property('took').to.not.equal(undefined);
      expect(stepChangefile).have.property('status').equal('success');

      const stepDownload = report.steps[1];

      expect(stepDownload).have.property('task').equal('download');
      expect(stepDownload).have.property('file').equal('2020-01-03-history.jsonl.gz');
      expect(stepDownload).have.property('percent').equal(100);
      expect(stepDownload).have.property('took').to.not.equal(undefined);
      expect(stepDownload).have.property('status').equal('success');

      const stepInsert = report.steps[2];

      expect(stepInsert).have.property('task').equal('insert');
      expect(stepInsert).have.property('file').equal('2020-01-03-history.jsonl.gz');
      expect(stepInsert).have.property('percent').equal(100);
      expect(stepInsert).have.property('linesRead').equal(2);
      expect(stepInsert).have.property('insertedDocs').equal(0);
      expect(stepInsert).have.property('updatedDocs').equal(0);
      expect(stepInsert).have.property('failedDocs').equal(0);
      expect(stepInsert).have.property('took').to.not.equal(undefined);
      expect(stepInsert).have.property('status').equal('success');

      const indexBase = stepInsert.index.unpaywall_base;
      expect(indexBase).have.property('insertedDocs').equal(0);
      expect(indexBase).have.property('updatedDocs').equal(2);
      expect(indexBase).have.property('failedDocs').equal(0);

      const indexHistory = stepInsert.index.unpaywall_history;
      expect(indexHistory).have.property('insertedDocs').equal(0);
      expect(indexHistory).have.property('updatedDocs').equal(0);
      expect(indexHistory).have.property('failedDocs').equal(0);
    });
  });

  describe('insert changefile 2020-01-02 again', () => {
    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/history')
        .send({
          startDate: date2,
          endDate: date2,
          interval: 'day',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should insert 0 data in history', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => { setTimeout(resolve, 100); });
        isUpdate = await checkIfInUpdate();
      }
      const countUnpaywallBase = await countDocuments('unpaywall_base');
      expect(countUnpaywallBase).to.equal(5);
      const countUnpaywallHistory = await countDocuments('unpaywall_history');
      expect(countUnpaywallHistory).to.equal(5);
      // TODO test elastic request
    });
  });
});

// TODO Test insertion 2 fois du même fichier
describe('Test: Insert 2 time the same file in history', () => {
  before(async function () {
    this.timeout(1000);
    await ping();
    await reset();
    await addSnapshot('2020-01-01-snapshot.jsonl.gz');
    await insertSnapshot('2020-01-01-snapshot.jsonl.gz', 'unpaywall_base');
  });

  it('Should return a status code 202', async () => {
    const res = await chai.request(updateURL)
      .post('/job/history')
      .send({
        startDate: date2,
        endDate: date2,
        interval: 'day',
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(202);
  });

  it('Should insert 3 data in history', async () => {
    // wait for the update to finish
    let isUpdate = true;
    while (isUpdate) {
      await new Promise((resolve) => { setTimeout(resolve, 100); });
      isUpdate = await checkIfInUpdate();
    }
    const countUnpaywallBase = await countDocuments('unpaywall_base');
    expect(countUnpaywallBase).to.equal(5);
    const countUnpaywallHistory = await countDocuments('unpaywall_history');
    expect(countUnpaywallHistory).to.equal(3);
    // TODO test elastic request
  });

  it('Should return a status code 202', async () => {
    const res = await chai.request(updateURL)
      .post('/job/history')
      .send({
        startDate: date2,
        endDate: date2,
        interval: 'day',
      })
      .set('x-api-key', 'changeme');

    expect(res).have.status(202);
  });

  it('Should insert 3 data in history', async () => {
    // wait for the update to finish
    let isUpdate = true;
    while (isUpdate) {
      await new Promise((resolve) => { setTimeout(resolve, 100); });
      isUpdate = await checkIfInUpdate();
    }
    const countUnpaywallBase = await countDocuments('unpaywall_base');
    expect(countUnpaywallBase).to.equal(5);
    const countUnpaywallHistory = await countDocuments('unpaywall_history');
    expect(countUnpaywallHistory).to.equal(3);
    // TODO test elastic request
  });
});

// TODO Test insertion d'un fichier plus vieux que l'existant
describe('Test: Insert a old file (history-04)', () => {
  before(async function () {
    this.timeout(1000);
    await ping();
    await reset();
    await addSnapshot('2020-01-01-snapshot.jsonl.gz');
    await insertSnapshot('2020-01-01-snapshot.jsonl.gz', 'unpaywall_base');
  });
  describe('insert changefile 01', () => {
    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/history')
        .send({
          startDate: date4,
          endDate: date4,
          interval: 'day',
        })
        .set('x-api-key', 'changeme');
      expect(res).have.status(202);
    });

    it('Should insert 0 data in history', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => { setTimeout(resolve, 100); });
        isUpdate = await checkIfInUpdate();
      }
      const countUnpaywallBase = await countDocuments('unpaywall_base');
      expect(countUnpaywallBase).to.equal(5);
      const countUnpaywallHistory = await countDocuments('unpaywall_history');
      expect(countUnpaywallHistory).to.equal(0);
    });
  });
});

// TODO Test insertion d'un fichier plus vieux que l'existant avec un index temporaire
describe('Test: Insert a old file (history-04)', () => {
  before(async function () {
    this.timeout(1000);
    await ping();
    await reset();
    await addSnapshot('2020-01-01-snapshot.jsonl.gz');
    await insertSnapshot('2020-01-01-snapshot.jsonl.gz', 'unpaywall_base');
    await insertInHistory(date2, date2);
    await insertInHistory(date3, date3);
    await addSnapshot('2019-01-01-snapshot.jsonl.gz');
    await insertSnapshot('2019-01-01-snapshot.jsonl.gz', 'unpaywall_tmp');
  });
  describe('insert changefile 01', () => {
    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/history')
        .send({
          indexBase: 'unpaywall_tmp',
          startDate: date5,
          endDate: date5,
          interval: 'day',
        })
        .set('x-api-key', 'changeme');
      expect(res).have.status(202);
    });

    it('Should insert 0 data in history', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => { setTimeout(resolve, 100); });
        isUpdate = await checkIfInUpdate();
      }
      const countUnpaywallBase = await countDocuments('unpaywall_base');
      expect(countUnpaywallBase).to.equal(5);
      const countUnpaywallHistory = await countDocuments('unpaywall_history');
      expect(countUnpaywallHistory).to.equal(10);

      // TODO test elastic request
    });
  });
});
