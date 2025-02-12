const request = require('supertest');
const { apikey } = require('config');

const app = require('../../../../src/app');

const { getStatus, getState, getReport } = require('../../../utils/job');
const { addChangefile } = require('../../../utils/file');
const { countDocuments } = require('../../../utils/elastic');
const testState = require('../report');

describe('Job: start errored changefile insert', () => {
  const filename = 'fake1-error.jsonl.gz';
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
      added: 1,
      updated: 0,
      error: true,
      steps: [
        {
          task: 'insert',
          filename,
          linesRead: 2,
          addedDocs: 1,
          updatedDocs: 0,
          failedDocs: 1,
          percent: 0,
          status: 'error',
        },
      ],
    };

    it('Should insert fake1-error.jsonl.gz', async () => {
      const response = await request(app)
        .post(`/job/changefile/insert/${filename}`)
        .send({ index: indexName })
        .set('x-api-key', apikey);

      expect(response.statusCode).toBe(202);
    });

    it('Should insert 0 data', async () => {
      // wait for the update to finish
      let status = true;
      do {
        status = await getStatus();
        await new Promise((resolve) => { setTimeout(resolve, 10); });
      } while (status);

      const count = await countDocuments('unpaywall-test');

      expect(count).toBe(0);
    });

    it('Should get state with all information from the insertion', async () => {
      const state = await getState();
      console.log(state);
      testState(state, reportConfig);
    });

    it('Should get report with all information from the insertion', async () => {
      const report = await getReport('[changefile][insert]');
      testState(report, reportConfig);
    });
  });
});
