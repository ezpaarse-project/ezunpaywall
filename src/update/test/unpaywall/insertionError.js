/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const config = require('config');
const updateService = require('../utils/server');

const { countDocuments } = require('../../lib/services/elastic');

const { addFile } = require('../../lib/files');
const { getReport } = require('../../lib/report');

const reset = require('../utils/reset');

chai.use(chaiHttp);

describe('Test: insert the content of a file already installed on ezunpaywall', () => {
  const filename01 = 'fake1-error.jsonl.gz';
  const indexName = 'unpaywall-test';
  const sourcesDir = path.resolve(__dirname, '..', 'sources');

  describe('Do insertion of a corrupted file already installed', () => {
    before(async () => {
      await reset();
      await addFile(path.resolve(sourcesDir, filename01));
    });

    it('Should return a status code 202', async () => {
      const res = await updateService({
        method: 'POST',
        url: `/job/changefile/${filename01}`,
        data: {
          index: indexName,
        },
        headers: {
          'x-api-key': config.get('apikey'),
        },
      });

      expect(res).have.status(202);
    });

    it('Should get state with all information from the insertion', async () => {
      // wait for the update to finish
      let isUpdate = true;
      do {
        const res = await updateService({
          method: 'GET',
          url: '/status',
        });
        isUpdate = res?.data;
        await new Promise((resolve) => { setTimeout(resolve, 100); });
      } while (isUpdate);
    });

    it('Should insert 49 data', async () => {
      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(49);
    });

    it('Should get state with all information from the insertion', async () => {
      // FIXME
      // we can't use getState function because test run a other instance of
      // node and on the start of app, state is set at {}
      let state = await updateService({
        method: 'GET',
        url: '/states',
      });
      state = state.data;

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(true);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').equal('insert');
      expect(state.steps[0]).have.property('index').equal('unpaywall-test');
      expect(state.steps[0]).have.property('file').equal(filename01);
      expect(state.steps[0]).have.property('linesRead').equal(50);
      expect(state.steps[0]).have.property('insertedDocs').equal(49);
      expect(state.steps[0]).have.property('updatedDocs').equal(0);
      expect(state.steps[0]).have.property('failedDocs').equal(1);
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('error');
    });

    it('Should get report with all information from the insertion', async () => {
      const report = await getReport('unpaywall');

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(true);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('insert');
      expect(report.steps[0]).have.property('index').equal('unpaywall-test');
      expect(report.steps[0]).have.property('file').equal(filename01);
      expect(report.steps[0]).have.property('linesRead').equal(50);
      expect(report.steps[0]).have.property('insertedDocs').equal(49);
      expect(report.steps[0]).have.property('updatedDocs').equal(0);
      expect(report.steps[0]).have.property('failedDocs').equal(1);
      expect(report.steps[0]).have.property('percent').equal(0);
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('error');
    });

    after(async () => {
      await reset();
    });
  });

  after(async () => {
    await reset();
  });
});
