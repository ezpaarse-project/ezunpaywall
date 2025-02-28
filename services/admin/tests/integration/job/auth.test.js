const request = require('supertest');
const {
  addChangefile,
  removeChangefile,
  addSnapshot,
  removeSnapshot,
} = require('../../utils/file');

const app = require('../../../src/app');

describe('Job: check auth', () => {
  const snapshotFilename = 'snapshot.jsonl.gz';
  const changefileFilename = 'fake1.jsonl.gz';

  afterAll(async () => {
    app.close();
  });
  describe('[job][snapshots][download]: Does not start job without apikey', () => {
    it('Should return a status code 401', async () => {
      const response = await request(app)
        .post('/job/snapshots/download');

      expect(response.statusCode).toBe(401);
    });
  });
  describe('[job][snapshots][download][insert]: Does not start job without apikey', () => {
    it('Should return a status code 401', async () => {
      const response = await request(app)
        .post('/job/snapshots/download/insert');

      expect(response.statusCode).toBe(401);
    });
  });

  describe('[job][snapshots][insert]: Does not start job without apikey', () => {
    beforeAll(async () => {
      await addSnapshot(snapshotFilename);
    });

    afterAll(async () => {
      await removeSnapshot(snapshotFilename);
    });
    it('Should return a status code 401', async () => {
      const response = await request(app)
        .post(`/job/snapshots/insert/${snapshotFilename}`);

      expect(response.statusCode).toBe(401);
    });
  });
  describe('[job][changefiles][download][insert]: Does not start job without apikey', () => {
    it('Should return a status code 401', async () => {
      const response = await request(app)
        .post('/job/changefiles/download/insert');

      expect(response.statusCode).toBe(401);
    });
  });

  describe('[job][changefiles][insert]: Does not start job without apikey', () => {
    beforeAll(async () => {
      await addChangefile(changefileFilename);
    });

    afterAll(async () => {
      await removeChangefile(changefileFilename);
    });
    it('Should return a status code 401', async () => {
      const response = await request(app)
        .post(`/job/changefiles/insert/${changefileFilename}`);

      expect(response.statusCode).toBe(401);
    });
  });

  describe('[job][changefiles][history][download][insert]: Does not start job without apikey', () => {
    it('Should return a status code 401', async () => {
      const response = await request(app)
        .post('/job/changefiles/history/download/insert');

      expect(response.statusCode).toBe(401);
    });
  });

  describe('[job][changefiles][history][insert]: Does not start job without apikey', () => {
    beforeAll(async () => {
      await addChangefile(changefileFilename);
    });

    afterAll(async () => {
      await removeChangefile(changefileFilename);
    });
    it('Should return a status code 401', async () => {
      const response = await request(app)
        .post(`/job/changefiles/history/insert/${changefileFilename}`);

      expect(response.statusCode).toBe(401);
    });
  });
});
