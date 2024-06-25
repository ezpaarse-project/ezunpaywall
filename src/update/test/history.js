/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const ping = require('./utils/ping');
const reset = require('./utils/reset');

chai.use(chaiHttp);

const updateURL = process.env.UPDATE_HOST || 'http://localhost:59702';

const { countDocuments } = require('./utils/elastic');
const { addSnapshot, insertSnapshot } = require('./utils/snapshot');
const { getState } = require('./utils/state');
const getReport = require('./utils/report');
const checkIfInUpdate = require('./utils/status');
const { searchByDOI } = require('./utils/elastic');

const date2 = '2020-01-02';
const date3 = '2020-01-03';
const date4 = '2019-01-04';
const date5 = '2020-01-05';

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
        .post('/job/download/insert/history/period')
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
    });

    it('Should get unpaywall document in base and history', async () => {
      function compare(a, b) {
        if (a.doi < b.doi) return -1;
        if (a.doi > b.doi) return 1;
        return 0;
      }

      const baseRes = await searchByDOI(['1', '2', '3', '4', '5'], 'unpaywall_base');

      baseRes.sort(compare);

      expect(baseRes[0]).have.property('doi').equal('1');
      expect(baseRes[0]).have.property('version').equal(2);
      expect(baseRes[0]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[0]).have.property('updated').equal('2020-01-02T01:00:00.000000');

      expect(baseRes[1]).have.property('doi').equal('2');
      expect(baseRes[1]).have.property('version').equal(2);
      expect(baseRes[1]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[1]).have.property('updated').equal('2020-01-02T01:00:00.000000');

      expect(baseRes[2]).have.property('doi').equal('3');
      expect(baseRes[2]).have.property('version').equal(2);
      expect(baseRes[2]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[2]).have.property('updated').equal('2020-01-02T01:00:00.000000');

      expect(baseRes[3]).have.property('doi').equal('4');
      expect(baseRes[3]).have.property('version').equal(1);
      expect(baseRes[3]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[3]).have.property('updated').equal('2020-01-01T01:00:00.000000');

      expect(baseRes[4]).have.property('doi').equal('5');
      expect(baseRes[4]).have.property('version').equal(1);
      expect(baseRes[4]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[4]).have.property('updated').equal('2020-01-01T01:00:00.000000');

      const historyRes = await searchByDOI(['1', '2', '3', '4', '5'], 'unpaywall_history');

      historyRes.sort(compare);

      expect(historyRes[0]).have.property('doi').equal('1');
      expect(historyRes[0]).have.property('version').equal(1);
      expect(historyRes[0]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[0]).have.property('updated').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[0]).have.property('endValidity').equal('2020-01-02T01:00:00.000000');

      expect(historyRes[1]).have.property('doi').equal('2');
      expect(historyRes[1]).have.property('version').equal(1);
      expect(historyRes[0]).have.property('updated').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[0]).have.property('endValidity').equal('2020-01-02T01:00:00.000000');

      expect(historyRes[2]).have.property('doi').equal('3');
      expect(historyRes[2]).have.property('version').equal(1);
      expect(historyRes[0]).have.property('updated').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[0]).have.property('endValidity').equal('2020-01-02T01:00:00.000000');
    });

    function testResult(result) {
      expect(result).have.property('done').equal(true);
      expect(result).have.property('createdAt').to.not.equal(undefined);
      expect(result).have.property('endAt').to.not.equal(undefined);
      expect(result).have.property('error').equal(false);
      expect(result).have.property('type').equal('unpaywallHistory');
      expect(result).have.property('took').to.not.equal(undefined);
      expect(result).have.property('steps').to.be.an('array');
      expect(result).have.property('indices').to.be.an('array');

      const { indices } = result;
      expect(indices[0]).have.property('index').equal('unpaywall_base');
      expect(indices[0]).have.property('added').equal(0);
      expect(indices[0]).have.property('updated').equal(3);

      expect(indices[1]).have.property('index').equal('unpaywall_history');
      expect(indices[1]).have.property('added').equal(3);
      expect(indices[1]).have.property('updated').equal(0);

      const stepChangefile = result.steps[0];

      expect(stepChangefile).have.property('task').equal('getChangefiles');
      expect(stepChangefile).have.property('took').to.not.equal(undefined);
      expect(stepChangefile).have.property('status').equal('success');

      const stepDownload = result.steps[1];

      expect(stepDownload).have.property('task').equal('download');
      expect(stepDownload).have.property('file').equal('2020-01-02-history.jsonl.gz');
      expect(stepDownload).have.property('percent').equal(100);
      expect(stepDownload).have.property('took').to.not.equal(undefined);
      expect(stepDownload).have.property('status').equal('success');

      const stepInsert = result.steps[2];

      expect(stepInsert).have.property('task').equal('insert');
      expect(stepInsert).have.property('file').equal('2020-01-02-history.jsonl.gz');
      expect(stepInsert).have.property('percent').equal(100);
      expect(stepInsert).have.property('linesRead').equal(3);
      expect(stepInsert).have.property('addedDocs').equal(0);
      expect(stepInsert).have.property('updatedDocs').equal(0);
      expect(stepInsert).have.property('failedDocs').equal(0);
      expect(stepInsert).have.property('took').to.not.equal(undefined);
      expect(stepInsert).have.property('status').equal('success');

      const indexBase = stepInsert.indices.unpaywall_base;
      expect(indexBase).have.property('addedDocs').equal(0);
      expect(indexBase).have.property('updatedDocs').equal(3);
      expect(indexBase).have.property('failedDocs').equal(0);

      const indexHistory = stepInsert.indices.unpaywall_history;
      expect(indexHistory).have.property('addedDocs').equal(3);
      expect(indexHistory).have.property('updatedDocs').equal(0);
      expect(indexHistory).have.property('failedDocs').equal(0);
    }

    it('Should get state with all information from the download and insertion', async () => {
      const state = await getState();
      testResult(state);
    });

    it('Should get report with all information from the download and insertion', async () => {
      const report = await getReport('unpaywallHistory');
      testResult(report);
    });
  });

  describe('insert changefile 2020-01-03', () => {
    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/download/insert/history/period')
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
    });

    it('Should get unpaywall document in base and history', async () => {
      function compare(a, b) {
        if (a.doi < b.doi) return -1;
        if (a.doi > b.doi) return 1;
        return 0;
      }

      const baseRes = await searchByDOI(['1', '2', '3', '4', '5'], 'unpaywall_base');

      baseRes.sort(compare);

      expect(baseRes[0]).have.property('doi').equal('1');
      expect(baseRes[0]).have.property('version').equal(3);
      expect(baseRes[0]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[0]).have.property('updated').equal('2020-01-03T01:00:00.000000');

      expect(baseRes[1]).have.property('doi').equal('2');
      expect(baseRes[1]).have.property('version').equal(3);
      expect(baseRes[1]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[1]).have.property('updated').equal('2020-01-03T01:00:00.000000');

      expect(baseRes[2]).have.property('doi').equal('3');
      expect(baseRes[2]).have.property('version').equal(2);
      expect(baseRes[2]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[2]).have.property('updated').equal('2020-01-02T01:00:00.000000');

      expect(baseRes[3]).have.property('doi').equal('4');
      expect(baseRes[3]).have.property('version').equal(1);
      expect(baseRes[3]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[3]).have.property('updated').equal('2020-01-01T01:00:00.000000');

      expect(baseRes[4]).have.property('doi').equal('5');
      expect(baseRes[4]).have.property('version').equal(1);
      expect(baseRes[4]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[4]).have.property('updated').equal('2020-01-01T01:00:00.000000');

      const historyRes = await searchByDOI(['1', '2', '3', '4', '5'], 'unpaywall_history');

      historyRes.sort(compare);

      expect(historyRes[0]).have.property('doi').equal('1');
      expect(historyRes[0]).have.property('version').equal(1);
      expect(historyRes[0]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[0]).have.property('updated').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[0]).have.property('endValidity').equal('2020-01-02T01:00:00.000000');

      expect(historyRes[1]).have.property('doi').equal('1');
      expect(historyRes[1]).have.property('version').equal(2);
      expect(historyRes[1]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[1]).have.property('updated').equal('2020-01-02T01:00:00.000000');
      expect(historyRes[1]).have.property('endValidity').equal('2020-01-03T01:00:00.000000');

      expect(historyRes[2]).have.property('doi').equal('2');
      expect(historyRes[2]).have.property('version').equal(1);
      expect(historyRes[2]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[2]).have.property('updated').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[2]).have.property('endValidity').equal('2020-01-02T01:00:00.000000');

      expect(historyRes[3]).have.property('doi').equal('2');
      expect(historyRes[3]).have.property('version').equal(2);
      expect(historyRes[3]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[3]).have.property('updated').equal('2020-01-02T01:00:00.000000');
      expect(historyRes[3]).have.property('endValidity').equal('2020-01-03T01:00:00.000000');

      expect(historyRes[4]).have.property('doi').equal('3');
      expect(historyRes[4]).have.property('version').equal(1);
      expect(historyRes[4]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[4]).have.property('updated').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[4]).have.property('endValidity').equal('2020-01-02T01:00:00.000000');
    });

    function testResult(result) {
      expect(result).have.property('done').equal(true);
      expect(result).have.property('createdAt').to.not.equal(undefined);
      expect(result).have.property('endAt').to.not.equal(undefined);
      expect(result).have.property('error').equal(false);
      expect(result).have.property('type').equal('unpaywallHistory');
      expect(result).have.property('took').to.not.equal(undefined);
      expect(result).have.property('steps').to.be.an('array');

      const { indices } = result;
      expect(indices[0]).have.property('index').equal('unpaywall_base');
      expect(indices[0]).have.property('added').equal(0);
      expect(indices[0]).have.property('updated').equal(2);

      expect(indices[1]).have.property('index').equal('unpaywall_history');
      expect(indices[1]).have.property('added').equal(2);
      expect(indices[1]).have.property('updated').equal(0);

      const stepChangefile = result.steps[0];

      expect(stepChangefile).have.property('task').equal('getChangefiles');
      expect(stepChangefile).have.property('took').to.not.equal(undefined);
      expect(stepChangefile).have.property('status').equal('success');

      const stepDownload = result.steps[1];

      expect(stepDownload).have.property('task').equal('download');
      expect(stepDownload).have.property('file').equal('2020-01-03-history.jsonl.gz');
      expect(stepDownload).have.property('percent').equal(100);
      expect(stepDownload).have.property('took').to.not.equal(undefined);
      expect(stepDownload).have.property('status').equal('success');

      const stepInsert = result.steps[2];

      expect(stepInsert).have.property('task').equal('insert');
      expect(stepInsert).have.property('file').equal('2020-01-03-history.jsonl.gz');
      expect(stepInsert).have.property('percent').equal(100);
      expect(stepInsert).have.property('linesRead').equal(2);
      expect(stepInsert).have.property('addedDocs').equal(0);
      expect(stepInsert).have.property('updatedDocs').equal(0);
      expect(stepInsert).have.property('failedDocs').equal(0);
      expect(stepInsert).have.property('took').to.not.equal(undefined);
      expect(stepInsert).have.property('status').equal('success');

      const indexBase = stepInsert.indices.unpaywall_base;
      expect(indexBase).have.property('addedDocs').equal(0);
      expect(indexBase).have.property('updatedDocs').equal(2);
      expect(indexBase).have.property('failedDocs').equal(0);

      const indexHistory = stepInsert.indices.unpaywall_history;
      expect(indexHistory).have.property('addedDocs').equal(2);
      expect(indexHistory).have.property('updatedDocs').equal(0);
      expect(indexHistory).have.property('failedDocs').equal(0);
    }

    it('Should get state with all information from the download and insertion', async () => {
      const state = await getState();
      testResult(state);
    });

    it('Should get report with all information from the download and insertion', async () => {
      const report = await getReport('unpaywallHistory');
      testResult(report);
    });
  });

  describe('insert changefile 2020-01-03 again', () => {
    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/download/insert/history/period')
        .send({
          startDate: date3,
          endDate: date3,
          interval: 'day',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should not insert new data in history', async () => {
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
    });

    it('Should get unpaywall document in base and history', async () => {
      function compare(a, b) {
        if (a.doi < b.doi) return -1;
        if (a.doi > b.doi) return 1;
        return 0;
      }

      const baseRes = await searchByDOI(['1', '2', '3', '4', '5'], 'unpaywall_base');

      baseRes.sort(compare);

      expect(baseRes[0]).have.property('doi').equal('1');
      expect(baseRes[0]).have.property('version').equal(3);
      expect(baseRes[0]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[0]).have.property('updated').equal('2020-01-03T01:00:00.000000');

      expect(baseRes[1]).have.property('doi').equal('2');
      expect(baseRes[1]).have.property('version').equal(3);
      expect(baseRes[1]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[1]).have.property('updated').equal('2020-01-03T01:00:00.000000');

      expect(baseRes[2]).have.property('doi').equal('3');
      expect(baseRes[2]).have.property('version').equal(2);
      expect(baseRes[2]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[2]).have.property('updated').equal('2020-01-02T01:00:00.000000');

      expect(baseRes[3]).have.property('doi').equal('4');
      expect(baseRes[3]).have.property('version').equal(1);
      expect(baseRes[3]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[3]).have.property('updated').equal('2020-01-01T01:00:00.000000');

      expect(baseRes[4]).have.property('doi').equal('5');
      expect(baseRes[4]).have.property('version').equal(1);
      expect(baseRes[4]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[4]).have.property('updated').equal('2020-01-01T01:00:00.000000');

      const historyRes = await searchByDOI(['1', '2', '3', '4', '5'], 'unpaywall_history');

      historyRes.sort(compare);

      expect(historyRes[0]).have.property('doi').equal('1');
      expect(historyRes[0]).have.property('version').equal(1);
      expect(historyRes[0]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[0]).have.property('updated').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[0]).have.property('endValidity').equal('2020-01-02T01:00:00.000000');

      expect(historyRes[1]).have.property('doi').equal('1');
      expect(historyRes[1]).have.property('version').equal(2);
      expect(historyRes[1]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[1]).have.property('updated').equal('2020-01-02T01:00:00.000000');
      expect(historyRes[1]).have.property('endValidity').equal('2020-01-03T01:00:00.000000');

      expect(historyRes[2]).have.property('doi').equal('2');
      expect(historyRes[2]).have.property('version').equal(1);
      expect(historyRes[2]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[2]).have.property('updated').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[2]).have.property('endValidity').equal('2020-01-02T01:00:00.000000');

      expect(historyRes[3]).have.property('doi').equal('2');
      expect(historyRes[3]).have.property('version').equal(2);
      expect(historyRes[3]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[3]).have.property('updated').equal('2020-01-02T01:00:00.000000');
      expect(historyRes[3]).have.property('endValidity').equal('2020-01-03T01:00:00.000000');

      expect(historyRes[4]).have.property('doi').equal('3');
      expect(historyRes[4]).have.property('version').equal(1);
      expect(historyRes[4]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[4]).have.property('updated').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[4]).have.property('endValidity').equal('2020-01-02T01:00:00.000000');
    });

    function testResult(result) {
      expect(result).have.property('done').equal(true);
      expect(result).have.property('createdAt').to.not.equal(undefined);
      expect(result).have.property('endAt').to.not.equal(undefined);
      expect(result).have.property('error').equal(false);
      expect(result).have.property('type').equal('unpaywallHistory');
      expect(result).have.property('took').to.not.equal(undefined);
      expect(result).have.property('steps').to.be.an('array');

      const { indices } = result;
      expect(indices[0]).have.property('index').equal('unpaywall_base');
      expect(indices[0]).have.property('added').equal(0);
      expect(indices[0]).have.property('updated').equal(2);

      expect(indices[1]).have.property('index').equal('unpaywall_history');
      expect(indices[1]).have.property('added').equal(0);
      expect(indices[1]).have.property('updated').equal(0);

      const stepChangefile = result.steps[0];

      expect(stepChangefile).have.property('task').equal('getChangefiles');
      expect(stepChangefile).have.property('took').to.not.equal(undefined);
      expect(stepChangefile).have.property('status').equal('success');

      const stepDownload = result.steps[1];

      expect(stepDownload).have.property('task').equal('download');
      expect(stepDownload).have.property('file').equal('2020-01-03-history.jsonl.gz');
      expect(stepDownload).have.property('percent').equal(100);
      expect(stepDownload).have.property('took').to.not.equal(undefined);
      expect(stepDownload).have.property('status').equal('success');

      const stepInsert = result.steps[2];

      expect(stepInsert).have.property('task').equal('insert');
      expect(stepInsert).have.property('file').equal('2020-01-03-history.jsonl.gz');
      expect(stepInsert).have.property('percent').equal(100);
      expect(stepInsert).have.property('linesRead').equal(2);
      expect(stepInsert).have.property('addedDocs').equal(0);
      expect(stepInsert).have.property('updatedDocs').equal(0);
      expect(stepInsert).have.property('failedDocs').equal(0);
      expect(stepInsert).have.property('took').to.not.equal(undefined);
      expect(stepInsert).have.property('status').equal('success');

      const indexBase = stepInsert.indices.unpaywall_base;
      expect(indexBase).have.property('addedDocs').equal(0);
      expect(indexBase).have.property('updatedDocs').equal(2);
      expect(indexBase).have.property('failedDocs').equal(0);

      const indexHistory = stepInsert.indices.unpaywall_history;
      expect(indexHistory).have.property('addedDocs').equal(0);
      expect(indexHistory).have.property('updatedDocs').equal(0);
      expect(indexHistory).have.property('failedDocs').equal(0);
    }

    it('Should get state with all information from the download and insertion', async () => {
      const state = await getState();
      testResult(state);
    });

    it('Should get report with all information from the download and insertion', async () => {
      const report = await getReport('unpaywallHistory');
      testResult(report);
    });
  });

  describe('insert changefile 2020-01-02 again', () => {
    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/download/insert/history/period')
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
    });
  });
});

describe('Test: Insert 2 time the same file in history', () => {
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
        .post('/job/download/insert/history/period')
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
    });

    it('Should get unpaywall document in base and history', async () => {
      function compare(a, b) {
        if (a.doi < b.doi) return -1;
        if (a.doi > b.doi) return 1;
        return 0;
      }

      const baseRes = await searchByDOI(['1', '2', '3', '4', '5'], 'unpaywall_base');

      baseRes.sort(compare);

      expect(baseRes[0]).have.property('doi').equal('1');
      expect(baseRes[0]).have.property('version').equal(2);
      expect(baseRes[0]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[0]).have.property('updated').equal('2020-01-02T01:00:00.000000');

      expect(baseRes[1]).have.property('doi').equal('2');
      expect(baseRes[1]).have.property('version').equal(2);
      expect(baseRes[1]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[1]).have.property('updated').equal('2020-01-02T01:00:00.000000');

      expect(baseRes[2]).have.property('doi').equal('3');
      expect(baseRes[2]).have.property('version').equal(2);
      expect(baseRes[2]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[2]).have.property('updated').equal('2020-01-02T01:00:00.000000');

      expect(baseRes[3]).have.property('doi').equal('4');
      expect(baseRes[3]).have.property('version').equal(1);
      expect(baseRes[3]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[3]).have.property('updated').equal('2020-01-01T01:00:00.000000');

      expect(baseRes[4]).have.property('doi').equal('5');
      expect(baseRes[4]).have.property('version').equal(1);
      expect(baseRes[4]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[4]).have.property('updated').equal('2020-01-01T01:00:00.000000');

      const historyRes = await searchByDOI(['1', '2', '3', '4', '5'], 'unpaywall_history');

      historyRes.sort(compare);

      expect(historyRes[0]).have.property('doi').equal('1');
      expect(historyRes[0]).have.property('version').equal(1);
      expect(historyRes[0]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[0]).have.property('updated').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[0]).have.property('endValidity').equal('2020-01-02T01:00:00.000000');

      expect(historyRes[1]).have.property('doi').equal('2');
      expect(historyRes[1]).have.property('version').equal(1);
      expect(historyRes[1]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[1]).have.property('updated').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[1]).have.property('endValidity').equal('2020-01-02T01:00:00.000000');

      expect(historyRes[2]).have.property('doi').equal('3');
      expect(historyRes[2]).have.property('version').equal(1);
      expect(historyRes[2]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[2]).have.property('updated').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[2]).have.property('endValidity').equal('2020-01-02T01:00:00.000000');
    });
  });

  describe('insert changefile 2020-01-02', () => {
    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/download/insert/history/period')
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
    });

    it('Should get unpaywall document in base and history', async () => {
      function compare(a, b) {
        if (a.doi < b.doi) return -1;
        if (a.doi > b.doi) return 1;
        return 0;
      }

      const baseRes = await searchByDOI(['1', '2', '3', '4', '5'], 'unpaywall_base');

      baseRes.sort(compare);

      expect(baseRes[0]).have.property('doi').equal('1');
      expect(baseRes[0]).have.property('version').equal(2);
      expect(baseRes[0]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[0]).have.property('updated').equal('2020-01-02T01:00:00.000000');

      expect(baseRes[1]).have.property('doi').equal('2');
      expect(baseRes[1]).have.property('version').equal(2);
      expect(baseRes[1]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[1]).have.property('updated').equal('2020-01-02T01:00:00.000000');

      expect(baseRes[2]).have.property('doi').equal('3');
      expect(baseRes[2]).have.property('version').equal(2);
      expect(baseRes[2]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[2]).have.property('updated').equal('2020-01-02T01:00:00.000000');

      expect(baseRes[3]).have.property('doi').equal('4');
      expect(baseRes[3]).have.property('version').equal(1);
      expect(baseRes[3]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[3]).have.property('updated').equal('2020-01-01T01:00:00.000000');

      expect(baseRes[4]).have.property('doi').equal('5');
      expect(baseRes[4]).have.property('version').equal(1);
      expect(baseRes[4]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[4]).have.property('updated').equal('2020-01-01T01:00:00.000000');

      const historyRes = await searchByDOI(['1', '2', '3', '4', '5'], 'unpaywall_history');

      historyRes.sort(compare);

      expect(historyRes[0]).have.property('doi').equal('1');
      expect(historyRes[0]).have.property('version').equal(1);
      expect(historyRes[0]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[0]).have.property('updated').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[0]).have.property('endValidity').equal('2020-01-02T01:00:00.000000');

      expect(historyRes[1]).have.property('doi').equal('2');
      expect(historyRes[1]).have.property('version').equal(1);
      expect(historyRes[1]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[1]).have.property('updated').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[1]).have.property('endValidity').equal('2020-01-02T01:00:00.000000');

      expect(historyRes[2]).have.property('doi').equal('3');
      expect(historyRes[2]).have.property('version').equal(1);
      expect(historyRes[2]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[2]).have.property('updated').equal('2020-01-01T01:00:00.000000');
      expect(historyRes[2]).have.property('endValidity').equal('2020-01-02T01:00:00.000000');
    });
  });
});

describe('Test: Insert a old file 2019-01-01', () => {
  before(async function () {
    this.timeout(1000);
    await ping();
    await reset();
    await addSnapshot('2020-01-01-snapshot.jsonl.gz');
    await insertSnapshot('2020-01-01-snapshot.jsonl.gz', 'unpaywall_base');
  });
  describe('insert changefile 2019-01-01', () => {
    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/download/insert/history/period')
        .send({
          startDate: date4,
          endDate: date4,
          interval: 'day',
        })
        .set('x-api-key', 'changeme');
      expect(res).have.status(202);
    });

    it('Should no insert new data in history', async () => {
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

    it('Should get unpaywall document in base and history', async () => {
      function compare(a, b) {
        if (a.doi < b.doi) return -1;
        if (a.doi > b.doi) return 1;
        return 0;
      }

      const baseRes = await searchByDOI(['1', '2', '3', '4', '5'], 'unpaywall_base');

      baseRes.sort(compare);

      expect(baseRes[0]).have.property('doi').equal('1');
      expect(baseRes[0]).have.property('version').equal(1);
      expect(baseRes[0]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[0]).have.property('updated').equal('2020-01-01T01:00:00.000000');

      expect(baseRes[1]).have.property('doi').equal('2');
      expect(baseRes[1]).have.property('version').equal(1);
      expect(baseRes[1]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[1]).have.property('updated').equal('2020-01-01T01:00:00.000000');

      expect(baseRes[2]).have.property('doi').equal('3');
      expect(baseRes[2]).have.property('version').equal(1);
      // This is normal that referencedAt is erase
      expect(baseRes[2]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[2]).have.property('updated').equal('2020-01-01T01:00:00.000000');

      expect(baseRes[3]).have.property('doi').equal('4');
      expect(baseRes[3]).have.property('version').equal(1);
      // This is normal that referencedAt is erase
      expect(baseRes[3]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[3]).have.property('updated').equal('2020-01-01T01:00:00.000000');

      expect(baseRes[4]).have.property('doi').equal('5');
      expect(baseRes[4]).have.property('version').equal(1);
      expect(baseRes[4]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[4]).have.property('updated').equal('2020-01-01T01:00:00.000000');
    });
  });
});

describe('Test: insert changefile with only new documents', () => {
  before(async function () {
    this.timeout(5000);
    await ping();
    await reset();
    await addSnapshot('2020-01-01-snapshot.jsonl.gz');
    await insertSnapshot('2020-01-01-snapshot.jsonl.gz', 'unpaywall_base');
  });
  describe('insert changefile 2020-01-05 with only new lines', () => {
    it('Should return a status code 202', async () => {
      const res = await chai.request(updateURL)
        .post('/job/download/insert/history/period')
        .send({
          startDate: date5,
          endDate: date5,
          interval: 'day',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should not insert new data in history', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => { setTimeout(resolve, 100); });
        isUpdate = await checkIfInUpdate();
      }
      const countUnpaywallBase = await countDocuments('unpaywall_base');
      expect(countUnpaywallBase).to.equal(7);
      const countUnpaywallHistory = await countDocuments('unpaywall_history');
      expect(countUnpaywallHistory).to.equal(0);
    });

    it('Should get unpaywall document in base and history', async () => {
      function compare(a, b) {
        if (a.doi < b.doi) return -1;
        if (a.doi > b.doi) return 1;
        return 0;
      }

      const baseRes = await searchByDOI(['1', '2', '3', '4', '5', '6', '7'], 'unpaywall_base');

      baseRes.sort(compare);

      expect(baseRes[0]).have.property('doi').equal('1');
      expect(baseRes[0]).have.property('version').equal(1);
      expect(baseRes[0]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[0]).have.property('updated').equal('2020-01-01T01:00:00.000000');

      expect(baseRes[1]).have.property('doi').equal('2');
      expect(baseRes[1]).have.property('version').equal(1);
      expect(baseRes[1]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[1]).have.property('updated').equal('2020-01-01T01:00:00.000000');

      expect(baseRes[2]).have.property('doi').equal('3');
      expect(baseRes[2]).have.property('version').equal(1);
      expect(baseRes[2]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[2]).have.property('updated').equal('2020-01-01T01:00:00.000000');

      expect(baseRes[3]).have.property('doi').equal('4');
      expect(baseRes[3]).have.property('version').equal(1);
      expect(baseRes[3]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[3]).have.property('updated').equal('2020-01-01T01:00:00.000000');

      expect(baseRes[4]).have.property('doi').equal('5');
      expect(baseRes[4]).have.property('version').equal(1);
      expect(baseRes[4]).have.property('referencedAt').equal('2020-01-01T01:00:00.000000');
      expect(baseRes[4]).have.property('updated').equal('2020-01-01T01:00:00.000000');

      expect(baseRes[5]).have.property('doi').equal('6');
      expect(baseRes[5]).have.property('version').equal(1);
      expect(baseRes[5]).have.property('referencedAt').equal('2020-01-05T01:00:00.000000');
      expect(baseRes[5]).have.property('updated').equal('2020-01-05T01:00:00.000000');

      expect(baseRes[6]).have.property('doi').equal('7');
      expect(baseRes[6]).have.property('version').equal(1);
      expect(baseRes[6]).have.property('referencedAt').equal('2020-01-05T01:00:00.000000');
      expect(baseRes[6]).have.property('updated').equal('2020-01-05T01:00:00.000000');
    });
  });
});
