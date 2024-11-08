/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const { countDocuments } = require('./utils/elastic');
const { addChangefile, updateChangefile } = require('./utils/changefile');
const { getState } = require('./utils/state');
const getReport = require('./utils/report');
const checkStatus = require('./utils/status');

const ping = require('./utils/ping');
const reset = require('./utils/reset');

chai.use(chaiHttp);

const adminURL = process.env.ADMIN_URL || 'http://localhost:59703';

describe('Test: insert the content of a file already installed on ezunpaywall', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
    await updateChangefile('week');
  });

  describe('Do insertion of a corrupted file already installed', () => {
    before(async () => {
      await reset();
      await addChangefile('fake1-error.jsonl.gz');
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(adminURL)
        .post('/job/insert/changefile/fake1-error.jsonl.gz')
        .send({
          index: 'unpaywall-test',
        })
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should insert 0 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      do {
        isUpdate = await checkStatus();
        await new Promise((resolve) => { setTimeout(resolve, 100); });
      } while (isUpdate);

      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(0);
    });

    function testResult(result) {
      expect(result).have.property('done').equal(true);
      expect(result).have.property('createdAt').to.not.equal(undefined);
      expect(result).have.property('endAt').to.not.equal(undefined);
      expect(result).have.property('steps').to.be.an('array');
      expect(result).have.property('error').equal(true);
      expect(result).have.property('took').to.not.equal(undefined);

      const { indices } = result;
      expect(indices[0]).have.property('index').equal('unpaywall-test');
      expect(indices[0]).have.property('added').equal(49);
      expect(indices[0]).have.property('updated').equal(0);

      expect(result.steps[0]).have.property('task').equal('insert');
      expect(result.steps[0]).have.property('index').equal('unpaywall-test');
      expect(result.steps[0]).have.property('file').equal('fake1-error.jsonl.gz');
      expect(result.steps[0]).have.property('linesRead').equal(50);
      expect(result.steps[0]).have.property('addedDocs').equal(49);
      expect(result.steps[0]).have.property('updatedDocs').equal(0);
      expect(result.steps[0]).have.property('failedDocs').equal(1);
      expect(result.steps[0]).have.property('took').to.not.equal(undefined);
      expect(result.steps[0]).have.property('status').equal('error');
    }

    it('Should get state with all information from the insertion', async () => {
      const state = await getState();
      testResult(state);
    });

    it('Should get report with all information from the insertion', async () => {
      const report = await getReport('[insert][changefile]');
      testResult(report);
    });

    after(async () => {
      await reset();
    });
  });

  after(async () => {
    await reset();
  });
});
