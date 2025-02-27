const request = require('supertest');
const { apikey } = require('config');

const app = require('../../../../../../src/app');

const { getStatus, getState, getReport } = require('../../../../../utils/job');
const { countDocuments, deleteIndex } = require('../../../../../utils/elastic');
const { removeChangefile, getChangefiles } = require('../../../../../utils/file');
const resetAll = require('../../../../../utils/reset');
const testState = require('../../../report');

const now = Date.now();
const oneDay = (1 * 24 * 60 * 60 * 1000);
const today = new Date(now).toISOString().slice(0, 10);
const oneDaysAgo = new Date(now - (1 * oneDay)).toISOString().slice(0, 10);
const twoDaysAgo = new Date(now - (2 * oneDay)).toISOString().slice(0, 10);
const threeDaysGrace = new Date(now - (3 * oneDay)).toISOString().slice(0, 10);
const fourDaysAgo = new Date(now - (4 * oneDay)).toISOString().slice(0, 10);

describe('Job: start changefile download and insert', () => {
  const indexName = 'unpaywall-test';

  afterAll(async () => {
    app.close();
  });

  describe('[job][changefiles][download][insert][day]: Job', () => {
    const filename = 'fake1.jsonl.gz';

    beforeAll(async () => {
      await resetAll();
    });

    afterAll(async () => {
      // await resetAll();
    });

    const reportConfig = {
      index: indexName,
      added: 2,
      updated: 0,
      error: false,
      steps: [
        {
          task: 'getChangefiles',
          took: 0,
          status: 'success',
        },
        {
          task: 'download',
          file: filename,
          percent: 100,
          took: 0,
          status: 'success',
        },
        {
          task: 'insert',
          file: filename,
          linesRead: 2,
          addedDocs: 2,
          updatedDocs: 0,
          failedDocs: 0,
          percent: 100,
          status: 'success',
        },
      ],
    };

    it('Should start job download and insert fake1.jsonl.gz', async () => {
      const response = await request(app)
        .post('/job/changefiles/download/insert')
        .send({ index: indexName })
        .set('x-api-key', apikey);

      expect(response.statusCode).toBe(202);
    });

    it('Should insert 2 data', async () => {
      // wait for the update to finish
      let status = true;
      do {
        status = await getStatus();
        await new Promise((resolve) => { setTimeout(resolve, 1000); });
      } while (status);

      const count = await countDocuments(indexName);

      expect(count).toBe(2);
    });

    it('Should get state with all information from the insertion', async () => {
      const state = await getState();
      testState(state, reportConfig);
    });

    it('Should get report with all information from the insertion', async () => {
      const report = await getReport('[changefiles][insert]');
      testState(report, reportConfig);
    });
  });

  describe(`[job][changefiles][download][insert][day]: Job between ${twoDaysAgo} and ${oneDaysAgo}`, () => {
    const filename = 'fake2.jsonl.gz';

    beforeAll(async () => {
      await removeChangefile(filename);
      await deleteIndex(indexName);
    });

    afterAll(async () => {
      await removeChangefile(filename);
      await deleteIndex(indexName);
    });

    const reportConfig = {
      index: indexName,
      added: 2,
      updated: 0,
      error: false,
      steps: [
        {
          task: 'getChangefiles',
          took: 0,
          status: 'success',
        },
        {
          task: 'download',
          file: filename,
          percent: 100,
          took: 0,
          status: 'success',
        },
        {
          task: 'insert',
          file: filename,
          index: indexName,
          linesRead: 2,
          addedDocs: 2,
          updatedDocs: 0,
          failedDocs: 0,
          percent: 100,
          status: 'success',
        },
      ],
    };

    it(`Should start job download and insert ${filename}`, async () => {
      const response = await request(app)
        .post('/job/changefiles/download/insert')
        .send({
          index: indexName,
          startDate: oneDaysAgo,
          endDate: today,
        })
        .set('x-api-key', apikey);

      expect(response.statusCode).toBe(202);
    });

    it('Should insert 2 data', async () => {
      // wait for the update to finish
      let status = true;
      do {
        status = await getStatus();
        await new Promise((resolve) => { setTimeout(resolve, 10); });
      } while (status);

      const count = await countDocuments(indexName);

      expect(count).toBe(2);
    });

    it('Should get state with all information from the insertion', async () => {
      const state = await getState();
      testState(state, reportConfig);
    });

    it('Should get report with all information from the insertion', async () => {
      const report = await getReport('[changefiles][insert]');
      testState(report, reportConfig);
    });
  });

  describe('[job][changefiles][download][insert][day]: Job with cleanFile', () => {
    const filename = 'fake1.jsonl.gz';

    beforeAll(async () => {
      await removeChangefile(filename);
      await deleteIndex(indexName);
    });

    afterAll(async () => {
      await removeChangefile(filename);
      await deleteIndex(indexName);
    });

    const reportConfig = {
      index: indexName,
      added: 2,
      updated: 0,
      error: false,
      steps: [
        {
          task: 'getChangefiles',
          took: 0,
          status: 'success',
        },
        {
          task: 'download',
          file: filename,
          percent: 100,
          took: 0,
          status: 'success',
        },
        {
          task: 'insert',
          file: filename,
          linesRead: 2,
          addedDocs: 2,
          updatedDocs: 0,
          failedDocs: 0,
          percent: 100,
          status: 'success',
        },
      ],
    };

    it('Should start job download and insert fake1.jsonl.gz', async () => {
      const response = await request(app)
        .post('/job/changefiles/download/insert')
        .send({ index: indexName, cleanFile: true })
        .set('x-api-key', apikey);

      expect(response.statusCode).toBe(202);
    });

    it('Should insert 2 data', async () => {
      // wait for the update to finish
      let status = true;
      do {
        status = await getStatus();
        await new Promise((resolve) => { setTimeout(resolve, 10); });
      } while (status);

      const count = await countDocuments(indexName);

      expect(count).toBe(2);
    });

    it('Should get state with all information from the insertion', async () => {
      const state = await getState();
      testState(state, reportConfig);
    });

    it('Should get report with all information from the insertion', async () => {
      const report = await getReport('[changefiles][insert]');
      testState(report, reportConfig);
    });

    it('Should not get files', async () => {
      const changefiles = await getChangefiles();
      const fake1IsPresent = changefiles.includes(filename);
      expect(fake1IsPresent).toBe(false);
    });
  });

  describe(`[job][changefiles][download][insert][day]: Job between ${fourDaysAgo} and ${threeDaysGrace}`, () => {
    const filename = 'fake1.jsonl.gz';

    beforeAll(async () => {
      await removeChangefile(filename);
      await deleteIndex(indexName);
    });

    afterAll(async () => {
      await removeChangefile(filename);
      await deleteIndex(indexName);
    });

    const reportConfig = {
      index: indexName,
      added: 0,
      updated: 0,
      error: false,
      steps: [
        {
          task: 'getChangefiles',
          took: 0,
          status: 'success',
        },
      ],
    };

    it('Should start job download and insert fake1.jsonl.gz', async () => {
      const response = await request(app)
        .post('/job/changefiles/download/insert')
        .send({ index: indexName, startDate: fourDaysAgo, endDate: threeDaysGrace })
        .set('x-api-key', apikey);

      expect(response.statusCode).toBe(202);
    });

    it('Should not insert data', async () => {
      // wait for the update to finish
      let status = true;
      do {
        status = await getStatus();
        await new Promise((resolve) => { setTimeout(resolve, 10); });
      } while (status);

      const count = await countDocuments(indexName);

      expect(count).toBe(0);
    });

    it('Should get state with all information from the insertion', async () => {
      const state = await getState();
      testState(state, reportConfig);
    });

    it('Should get report with all information from the insertion', async () => {
      const report = await getReport('[changefiles][insert]');
      testState(report, reportConfig);
    });

    it('Should not get files', async () => {
      const changefiles = await getChangefiles();
      const fake1IsPresent = changefiles.includes(filename);
      expect(fake1IsPresent).toBe(false);
    });
  });
});
