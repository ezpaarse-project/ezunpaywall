const request = require('supertest');
const { apikey } = require('config');

const app = require('../../../../src/app');

const { getStatus, getState, getReport } = require('../../../utils/job');
const { countDocuments } = require('../../../utils/elastic');
const testState = require('../report');

describe('Job: start changefile download and insert', () => {
  const filename = 'fake1.jsonl.gz';
  const indexName = 'unpaywall-test';

  afterAll(async () => {
    app.close();
  });

  describe('Classic download and insertion changefile', () => {
    const reportConfig = {
      index: indexName,
      added: 2,
      updated: 0,
      error: false,
      steps: [
        {
          task: 'download',
          filename,
          linesRead: 2,
          addedDocs: 2,
          updatedDocs: 0,
          failedDocs: 0,
          percent: 100,
          status: 'success',
        },
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

    it('Should download and insert fake1.jsonl.gz', async () => {
      const response = await request(app)
        .post('/job/changefile/download/insert')
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
      console.log(state);
      testState(state, reportConfig);
    });

    it('Should get report with all information from the insertion', async () => {
      const report = await getReport('[changefile][insert]');
      testState(report, reportConfig);
    });
  });
});
