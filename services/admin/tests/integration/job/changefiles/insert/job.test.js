const request = require('supertest');
const { apikey } = require('config');

const app = require('../../../../../src/app');

const { getStatus, getState, getReport } = require('../../../../utils/job');
const { addChangefile, getChangefiles } = require('../../../../utils/file');
const { countDocuments } = require('../../../../utils/elastic');
const testState = require('../../report');
const resetAll = require('../../../../utils/reset');

describe('Job: start changefile insert', () => {
  const filename = 'fake1.jsonl.gz';
  const indexName = 'unpaywall-test';

  afterAll(async () => {
    await resetAll();
    app.close();
  });

  beforeAll(async () => {
    await resetAll();
  });

  describe('[job][changefiles][insert]: job', () => {
    beforeAll(async () => {
      await addChangefile(filename);
    });

    afterAll(async () => {
      await resetAll();
    });

    const reportConfig = {
      index: indexName,
      added: 2,
      updated: 0,
      error: false,
      steps: [
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

    it('Should start job insert fake1.jsonl.gz', async () => {
      const response = await request(app)
        .post(`/job/changefiles/insert/${filename}`)
        .send({ index: indexName })
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

  describe('[job][changefiles][insert]: job with cleanFile', () => {
    beforeAll(async () => {
      await addChangefile(filename);
    });

    afterAll(async () => {
      await resetAll();
    });

    const reportConfig = {
      index: indexName,
      added: 2,
      updated: 0,
      error: false,
      indices: [
        {
          index: indexName,
          added: 2,
          updated: 0,
        },
      ],
      steps: [
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
    it('Should start job insert fake1.jsonl.gz', async () => {
      const response = await request(app)
        .post(`/job/changefiles/insert/${filename}`)
        .send({
          index: indexName,
          cleanFile: true,
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

    it('Should not get files', async () => {
      const changefiles = await getChangefiles();
      const fake1IsPresent = changefiles.includes(filename);
      expect(fake1IsPresent).toBe(false);
    });
  });

  describe('[job][changefiles][insert]: job with limit=1', () => {
    beforeAll(async () => {
      await addChangefile(filename);
    });

    afterAll(async () => {
      await resetAll();
    });

    const reportConfig = {
      index: indexName,
      added: 1,
      updated: 0,
      error: false,
      steps: [
        {
          task: 'insert',
          file: filename,
          linesRead: 1,
          addedDocs: 1,
          updatedDocs: 0,
          failedDocs: 0,
          percent: 100,
          status: 'success',
        },
      ],
    };

    it('Should start job insert fake1.jsonl.gz', async () => {
      const response = await request(app)
        .post(`/job/changefiles/insert/${filename}`)
        .send({
          index: indexName,
          limit: 1,
        })
        .set('x-api-key', apikey);

      expect(response.statusCode).toBe(202);
    });

    it('Should insert 1 data', async () => {
      // wait for the update to finish
      let status = true;
      do {
        status = await getStatus();
        await new Promise((resolve) => { setTimeout(resolve, 10); });
      } while (status);

      const count = await countDocuments(indexName);

      expect(count).toBe(1);
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

  describe('[job][changefiles][insert]: job with offset=1', () => {
    beforeAll(async () => {
      await addChangefile(filename);
    });

    afterAll(async () => {
      await resetAll();
    });

    const reportConfig = {
      index: indexName,
      added: 1,
      updated: 0,
      error: false,
      steps: [
        {
          task: 'insert',
          file: filename,
          linesRead: 2,
          addedDocs: 1,
          updatedDocs: 0,
          failedDocs: 0,
          percent: 100,
          status: 'success',
        },
      ],
    };

    it('Should start job insert fake1.jsonl.gz', async () => {
      const response = await request(app)
        .post(`/job/changefiles/insert/${filename}`)
        .send({
          index: indexName,
          offset: 1,
        })
        .set('x-api-key', apikey);

      expect(response.statusCode).toBe(202);
    });

    it('Should insert 1 data', async () => {
      // wait for the update to finish
      let status = true;
      do {
        status = await getStatus();
        await new Promise((resolve) => { setTimeout(resolve, 10); });
      } while (status);

      const count = await countDocuments(indexName);

      expect(count).toBe(1);
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
});
