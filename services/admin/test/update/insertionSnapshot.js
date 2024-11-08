/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { format } = require('date-fns');

const { countDocuments } = require('./utils/elastic');
const { getState } = require('./utils/state');
const getReport = require('./utils/report');
const checkStatus = require('./utils/status');

const ping = require('./utils/ping');
const reset = require('./utils/reset');

chai.use(chaiHttp);

const adminURL = process.env.ADMIN_URL || 'http://localhost:59703';

describe('Test: download and insert snapshot from unpaywall', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
  });

  describe('Do a download and a insertion of snapshot', () => {
    before(async () => {
      await reset();
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(adminURL)
        .post('/job/download/insert/snapshot')
        .send({
          index: 'unpaywall-test',
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should insert 2150 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      do {
        isUpdate = await checkStatus();
        await new Promise((resolve) => { setTimeout(resolve, 100); });
      } while (isUpdate);

      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(2150);
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
      expect(indices[0]).have.property('added').equal(2150);
      expect(indices[0]).have.property('updated').equal(0);

      expect(result.steps[0]).have.property('task').equal('download');
      expect(result.steps[0]).have.property('percent').equal(100);
      expect(result.steps[1]).have.property('took').to.not.equal(undefined);
      expect(result.steps[1]).have.property('status').equal('success');
      expect(result.steps[1]).have.property('file').equal(`snapshot-${format(new Date(), 'yyyy-MM-dd')}.jsonl.gz`);

      expect(result.steps[1]).have.property('task').equal('insert');
      expect(result.steps[1]).have.property('index').equal('unpaywall-test');
      expect(result.steps[1]).have.property('file').equal(`snapshot-${format(new Date(), 'yyyy-MM-dd')}.jsonl.gz`);
      expect(result.steps[1]).have.property('percent').equal(100);
      expect(result.steps[1]).have.property('linesRead').equal(2150);
      expect(result.steps[1]).have.property('addedDocs').equal(2150);
      expect(result.steps[1]).have.property('updatedDocs').equal(0);
      expect(result.steps[1]).have.property('failedDocs').equal(0);
      expect(result.steps[1]).have.property('took').to.not.equal(undefined);
      expect(result.steps[1]).have.property('status').equal('success');
    }

    it('Should get state with all information from the insertion', async () => {
      const state = await getState();
      testResult(state);
    });

    it('Should get report with all information from the insertion', async () => {
      const report = await getReport('[download][insert][snapshot]');
      testResult(report);
    });

    after(async () => {
      await reset();
    });
  });
});
