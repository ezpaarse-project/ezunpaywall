const request = require('supertest');
const { apikey } = require('config');

const { getStatus, getState, getReport } = require('../../../../utils/job');
const { countDocuments } = require('../../../../utils/elastic');
const { removeSnapshot, addSnapshot } = require('../../../../utils/file');

const app = require('../../../../../src/app');
const testState = require('../../report');

describe('Job: start snapshot insert', () => {
  const filename = 'snapshot.jsonl.gz';
  const indexName = 'unpaywall-test';

  afterAll(async () => {
    app.close();
  });

  describe('[job][snapshot][insert]: job', () => {
    beforeAll(async () => {
      await addSnapshot(filename);
    });

    afterAll(async () => {
      await removeSnapshot(filename);
    });

    const reportConfig = {
      index: indexName,
      added: 10,
      updated: 0,
      error: false,
      steps: [
        {
          task: 'insert',
          file: filename,
          linesRead: 10,
          addedDocs: 10,
          updatedDocs: 0,
          failedDocs: 0,
          percent: 100,
          status: 'success',
        },
      ],
    };
    it('Should start job insert snapshot.jsonl.gz', async () => {
      const response = await request(app)
        .post(`/job/snapshots/insert/${filename}`)
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

      expect(count).toBe(10);
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
