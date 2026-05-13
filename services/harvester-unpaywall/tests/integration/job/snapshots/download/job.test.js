const request = require('supertest');
const { apikey } = require('config');
const { format } = require('date-fns');

const app = require('../../../../../src/app');
const { getStatus, getState, getReport } = require('../../../../utils/job');
const testState = require('../../report');

const { removeSnapshot, getSnapshots } = require('../../../../utils/file');

describe('Job: start snapshot download', () => {
  const filename = `snapshot-${format(new Date(), 'yyyy-MM-dd')}.jsonl.gz`;

  afterAll(async () => {
    app.close();
  });

  const reportConfig = {
    error: false,
    steps: [
      {
        task: 'download',
        file: filename,
        percent: 100,
        took: 0,
        status: 'success',
      },
    ],
  };

  describe('[job][snapshot][download]: job', () => {
    afterAll(async () => {
      await removeSnapshot(filename);
    });
    it('Should start job download snapshot.jsonl.gz', async () => {
      const response = await request(app)
        .post('/job/snapshots/download')
        .set('x-api-key', apikey);

      expect(response.statusCode).toBe(202);
    });

    it('Should get status equal to true', async () => {
      // wait for the update to finish
      let status = true;
      do {
        status = await getStatus();
        await new Promise((resolve) => { setTimeout(resolve, 10); });
      } while (status);

      expect(status).toBe(false);
    });

    it('Should get state with all information from the download', async () => {
      const state = await getState();
      testState(state, reportConfig);
    });

    it('Should get report with all information from the download', async () => {
      const report = await getReport('[snapshot][download]');
      testState(report, reportConfig);
    });

    it('Should get snapshots', async () => {
      const snapshots = await getSnapshots();
      const snapshotIsPresent = snapshots.includes(filename);
      expect(snapshotIsPresent).toBe(true);
    });
  });
});
