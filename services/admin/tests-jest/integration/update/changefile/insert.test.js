const request = require('supertest');
const { apikey } = require('config');

const app = require('../../../../src/app');

const { getStatus, getState, getReport } = require('../../../utils/job');
const { addChangefile, getChangefiles } = require('../../../utils/file');
const { countDocuments } = require('../../../utils/elastic');
const testState = require('../report');

describe('Job: start changefile insert', () => {
  const filename = 'fake1.jsonl.gz';
  const indexName = 'unpaywall-test';

  afterAll(async () => {
    app.close();
  });

  describe('Classic insertion changefile', () => {
    beforeAll(async () => {
      await addChangefile(filename);
    });

    const reportConfig = {
      index: indexName,
      added: 2,
      updated: 0,
      error: false,
      steps: [
        {
          task: 'insert',
          filename,
          linesRead: 2,
          addedDocs: 2,
          updatedDocs: 0,
          failedDocs: 0,
          percent: 100,
          status: 'success',
        },
      ],
    };

    it('Should insert fake1.jsonl.gz', async () => {
      const response = await request(app)
        .post(`/job/changefile/insert/${filename}`)
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
      const report = await getReport('[changefile][insert]');
      testState(report, reportConfig);
    });
  });

  describe('Insertion changefile with param cleanFile', () => {
    beforeAll(async () => {
      await addChangefile(filename);
    });

    const reportConfig = {
      index: indexName,
      added: 2,
      updated: 0,
      error: false,
      steps: [
        {
          task: 'insert',
          filename,
          linesRead: 2,
          addedDocs: 2,
          updatedDocs: 0,
          failedDocs: 0,
          percent: 100,
          status: 'success',
        },
      ],
    };
    it('Should insert fake1.jsonl.gz', async () => {
      const response = await request(app)
        .post(`/job/changefile/insert/${filename}`)
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
      const report = await getReport('[changefile][insert]');
      testState(report, reportConfig);
    });

    it('Should not get files', async () => {
      const changefiles = await getChangefiles();
      const fake1IsPresent = changefiles.includes(filename);
      expect(fake1IsPresent).toBe(false);
    });
  });

  describe('Insertion changefile with parameter limit=1', () => {
    beforeAll(async () => {
      await addChangefile(filename);
    });

    const reportConfig = {
      index: indexName,
      added: 1,
      updated: 0,
      error: false,
      steps: [
        {
          task: 'insert',
          filename,
          linesRead: 1,
          addedDocs: 1,
          updatedDocs: 0,
          failedDocs: 0,
          percent: 100,
          status: 'success',
        },
      ],
    };

    it('Should insert fake1.jsonl.gz', async () => {
      const response = await request(app)
        .post(`/job/changefile/insert/${filename}`)
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
      const report = await getReport('[changefile][insert]');
      testState(report, reportConfig);
    });
  });

  describe('Insertion changefile with parameter offset=1', () => {
    beforeAll(async () => {
      await addChangefile(filename);
    });

    const reportConfig = {
      index: indexName,
      added: 1,
      updated: 0,
      error: false,
      steps: [
        {
          task: 'insert',
          filename,
          linesRead: 2,
          addedDocs: 1,
          updatedDocs: 0,
          failedDocs: 0,
          percent: 100,
          status: 'success',
        },
      ],
    };

    it('Should insert fake1.jsonl.gz', async () => {
      const response = await request(app)
        .post(`/job/changefile/insert/${filename}`)
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
      const report = await getReport('[changefile][insert]');
      testState(report, reportConfig);
    });
  });
});
