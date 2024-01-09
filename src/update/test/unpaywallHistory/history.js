/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const { updateChangeFile } = require('../utils/snapshot');
const { countDocuments } = require('../utils/elastic');
const { getState } = require('../utils/state');
const getReport = require('../utils/report');
const checkIfInUpdate = require('../utils/status');

const ping = require('../utils/ping');
const reset = require('../utils/reset');

const updateURL = process.env.UPDATE_HOST || 'http://localhost:59702';

chai.use(chaiHttp);

describe('Test: daily update route test with history', () => {
  const date1 = '2020-01-03';
  const date3 = '2020-01-01';

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
        .post('/job/history')
        .send({
          startDate: date3,
          endDate: date1,
          interval: 'day',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should insert 2 data in enriched index', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => { setTimeout(resolve, 100); });
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall_enriched');
      expect(count).to.equal(2);
    });

    it('Should insert 4 data in history index', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => { setTimeout(resolve, 100); });
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall_history');
      expect(count).to.equal(4);
    });

    it('Should get state with all information from the download and insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);
      expect(state).have.property('totalInsertedDocs').equal(6);
      expect(state).have.property('totalUpdatedDocs').equal(4);

      expect(state.steps[0]).have.property('task').equal('getChangefiles');
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('success');

      expect(state.steps[1]).have.property('task').equal('download');
      expect(state.steps[1]).have.property('file').equal('history3.jsonl.gz');
      expect(state.steps[1]).have.property('percent').equal(100);
      expect(state.steps[1]).have.property('took').to.not.equal(undefined);
      expect(state.steps[1]).have.property('status').equal('success');

      expect(state.steps[2]).have.property('task').equal('insert');
      expect(state.steps[2]).have.property('file').equal('history3.jsonl.gz');
      expect(state.steps[2]).have.property('percent').equal(100);
      expect(state.steps[2]).have.property('linesRead').equal(2);
      expect(state.steps[2]).have.property('insertedDocs').equal(0);
      expect(state.steps[2]).have.property('updatedDocs').equal(0);
      expect(state.steps[2]).have.property('failedDocs').equal(0);
      expect(state.steps[2]).have.property('took').to.not.equal(undefined);
      expect(state.steps[2]).have.property('status').equal('success');

      const step2 = state.steps[2].index;
      expect(step2.unpaywall_enriched).have.property('insertedDocs').equal(2);
      expect(step2.unpaywall_enriched).have.property('updatedDocs').equal(0);
      expect(step2.unpaywall_enriched).have.property('failedDocs').equal(0);
      expect(step2.unpaywall_history).have.property('insertedDocs').equal(0);
      expect(step2.unpaywall_history).have.property('updatedDocs').equal(0);
      expect(step2.unpaywall_history).have.property('failedDocs').equal(0);

      expect(state.steps[3]).have.property('task').equal('download');
      expect(state.steps[3]).have.property('file').equal('history2.jsonl.gz');
      expect(state.steps[3]).have.property('percent').equal(100);
      expect(state.steps[3]).have.property('took').to.not.equal(undefined);
      expect(state.steps[3]).have.property('status').equal('success');

      expect(state.steps[4]).have.property('task').equal('insert');
      expect(state.steps[4]).have.property('file').equal('history2.jsonl.gz');
      expect(state.steps[4]).have.property('percent').equal(100);
      expect(state.steps[4]).have.property('linesRead').equal(2);
      expect(state.steps[4]).have.property('insertedDocs').equal(0);
      expect(state.steps[4]).have.property('updatedDocs').equal(0);
      expect(state.steps[4]).have.property('failedDocs').equal(0);
      expect(state.steps[4]).have.property('took').to.not.equal(undefined);
      expect(state.steps[4]).have.property('status').equal('success');

      const step4 = state.steps[4].index;
      expect(step4.unpaywall_enriched).have.property('insertedDocs').equal(0);
      expect(step4.unpaywall_enriched).have.property('updatedDocs').equal(2);
      expect(step4.unpaywall_enriched).have.property('failedDocs').equal(0);
      expect(step4.unpaywall_history).have.property('insertedDocs').equal(2);
      expect(step4.unpaywall_history).have.property('updatedDocs').equal(0);
      expect(step4.unpaywall_history).have.property('failedDocs').equal(0);

      expect(state.steps[5]).have.property('task').equal('download');
      expect(state.steps[5]).have.property('file').equal('history1.jsonl.gz');
      expect(state.steps[5]).have.property('percent').equal(100);
      expect(state.steps[5]).have.property('took').to.not.equal(undefined);
      expect(state.steps[5]).have.property('status').equal('success');

      expect(state.steps[6]).have.property('task').equal('insert');
      expect(state.steps[6]).have.property('file').equal('history1.jsonl.gz');
      expect(state.steps[6]).have.property('percent').equal(100);
      expect(state.steps[6]).have.property('linesRead').equal(2);
      expect(state.steps[6]).have.property('insertedDocs').equal(0);
      expect(state.steps[6]).have.property('updatedDocs').equal(0);
      expect(state.steps[6]).have.property('failedDocs').equal(0);
      expect(state.steps[6]).have.property('took').to.not.equal(undefined);
      expect(state.steps[6]).have.property('status').equal('success');

      const step6 = state.steps[6].index;
      expect(step6.unpaywall_enriched).have.property('insertedDocs').equal(0);
      expect(step6.unpaywall_enriched).have.property('updatedDocs').equal(2);
      expect(step6.unpaywall_enriched).have.property('failedDocs').equal(0);
      expect(step6.unpaywall_history).have.property('insertedDocs').equal(2);
      expect(step6.unpaywall_history).have.property('updatedDocs').equal(0);
      expect(step6.unpaywall_history).have.property('failedDocs').equal(0);
    });

    it('Should get report with all information from the download and insertion', async () => {
      const report = await getReport('unpaywallHistory');

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);
      expect(report).have.property('totalInsertedDocs').equal(6);
      expect(report).have.property('totalUpdatedDocs').equal(4);

      expect(report.steps[0]).have.property('task').equal('getChangefiles');
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('success');

      expect(report.steps[1]).have.property('task').equal('download');
      expect(report.steps[1]).have.property('file').equal('history3.jsonl.gz');
      expect(report.steps[1]).have.property('percent').equal(100);
      expect(report.steps[1]).have.property('took').to.not.equal(undefined);
      expect(report.steps[1]).have.property('status').equal('success');

      expect(report.steps[2]).have.property('task').equal('insert');
      expect(report.steps[2]).have.property('file').equal('history3.jsonl.gz');
      expect(report.steps[2]).have.property('percent').equal(100);
      expect(report.steps[2]).have.property('linesRead').equal(2);
      expect(report.steps[2]).have.property('insertedDocs').equal(0);
      expect(report.steps[2]).have.property('updatedDocs').equal(0);
      expect(report.steps[2]).have.property('failedDocs').equal(0);
      expect(report.steps[2]).have.property('took').to.not.equal(undefined);
      expect(report.steps[2]).have.property('status').equal('success');

      const step2 = report.steps[2].index;
      expect(step2.unpaywall_enriched).have.property('insertedDocs').equal(2);
      expect(step2.unpaywall_enriched).have.property('updatedDocs').equal(0);
      expect(step2.unpaywall_enriched).have.property('failedDocs').equal(0);
      expect(step2.unpaywall_history).have.property('insertedDocs').equal(0);
      expect(step2.unpaywall_history).have.property('updatedDocs').equal(0);
      expect(step2.unpaywall_history).have.property('failedDocs').equal(0);

      expect(report.steps[3]).have.property('task').equal('download');
      expect(report.steps[3]).have.property('file').equal('history2.jsonl.gz');
      expect(report.steps[3]).have.property('percent').equal(100);
      expect(report.steps[3]).have.property('took').to.not.equal(undefined);
      expect(report.steps[3]).have.property('status').equal('success');

      expect(report.steps[4]).have.property('task').equal('insert');
      expect(report.steps[4]).have.property('file').equal('history2.jsonl.gz');
      expect(report.steps[4]).have.property('percent').equal(100);
      expect(report.steps[4]).have.property('linesRead').equal(2);
      expect(report.steps[4]).have.property('insertedDocs').equal(0);
      expect(report.steps[4]).have.property('updatedDocs').equal(0);
      expect(report.steps[4]).have.property('failedDocs').equal(0);
      expect(report.steps[4]).have.property('took').to.not.equal(undefined);
      expect(report.steps[4]).have.property('status').equal('success');

      const step4 = report.steps[4].index;
      expect(step4.unpaywall_enriched).have.property('insertedDocs').equal(0);
      expect(step4.unpaywall_enriched).have.property('updatedDocs').equal(2);
      expect(step4.unpaywall_enriched).have.property('failedDocs').equal(0);
      expect(step4.unpaywall_history).have.property('insertedDocs').equal(2);
      expect(step4.unpaywall_history).have.property('updatedDocs').equal(0);
      expect(step4.unpaywall_history).have.property('failedDocs').equal(0);

      expect(report.steps[5]).have.property('task').equal('download');
      expect(report.steps[5]).have.property('file').equal('history1.jsonl.gz');
      expect(report.steps[5]).have.property('percent').equal(100);
      expect(report.steps[5]).have.property('took').to.not.equal(undefined);
      expect(report.steps[5]).have.property('status').equal('success');

      expect(report.steps[6]).have.property('task').equal('insert');
      expect(report.steps[6]).have.property('file').equal('history1.jsonl.gz');
      expect(report.steps[6]).have.property('percent').equal(100);
      expect(report.steps[6]).have.property('linesRead').equal(2);
      expect(report.steps[6]).have.property('insertedDocs').equal(0);
      expect(report.steps[6]).have.property('updatedDocs').equal(0);
      expect(report.steps[6]).have.property('failedDocs').equal(0);
      expect(report.steps[6]).have.property('took').to.not.equal(undefined);
      expect(report.steps[6]).have.property('status').equal('success');

      const step6 = report.steps[6].index;
      expect(step6.unpaywall_enriched).have.property('insertedDocs').equal(0);
      expect(step6.unpaywall_enriched).have.property('updatedDocs').equal(2);
      expect(step6.unpaywall_enriched).have.property('failedDocs').equal(0);
      expect(step6.unpaywall_history).have.property('insertedDocs').equal(2);
      expect(step6.unpaywall_history).have.property('updatedDocs').equal(0);
      expect(step6.unpaywall_history).have.property('failedDocs').equal(0);
    });
  });

  after(async () => {
    await reset();
  });
});
