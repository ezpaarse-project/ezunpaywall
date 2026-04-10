const request = require('supertest');

const app = require('../../../src/app');
const { searchByDOI } = require('../../../src/lib/elastic');

const data = [
  { doi: '10.01', is_oa: true, title: 'title1' },
  { doi: '10.02', is_oa: false, title: 'title2' },
  { doi: '10.03', is_oa: false, title: 'title3' },
  { doi: '10.04', is_oa: true, title: 'title4' },
  { doi: '10.05', is_oa: true, title: 'title5' },
];

describe('DOI update test', () => {
  let count;
  afterAll(async () => {
    app.close();
  });

  describe('update 10.01 DOI', () => {
    it('Should update doi in ezunpaywall', async () => {
      const response = await request(app)
        .post('/doi/update')
        .send({
          dois: ['10.01'],
        });

      expect(response.statusCode).toBe(202);
    });

    it('Should get counter to dois updated', async () => {
      const response = await request(app)
        .get('/doi/update/count');

      expect(response.statusCode).toBe(200);
      count = response.body;
      expect(count).toBe(1);
    });

    it('Should get document updated', async () => {
      const searchRes = await searchByDOI(['10.01'], 'unpaywall');

      expect(searchRes[0]).toEqual(data[0]);
    });
  });

  describe('update 10.55 DOI, it does not exist on unpaywall', () => {
    it('Should update doi in ezunpaywall', async () => {
      const response = await request(app)
        .post('/doi/update')
        .send({
          dois: ['10.55'],
        });

      expect(response.statusCode).toBe(202);
    });

    it('Should get counter to dois updated', async () => {
      const response = await request(app)
        .get('/doi/update/count');

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(count);
    });

    it('Should not get document', async () => {
      const searchRes = await searchByDOI(['10.55'], 'unpaywall');

      expect(searchRes).toEqual([]);
    });
  });

  describe('try to update more DOI than limit', () => {
    it('Should update doi in ezunpaywall', async () => {
      const response = await request(app)
        .post('/doi/update')
        .send({
          dois: ['10.01', '10.02', '10.03', '10.04', '10.05'],
        });

      expect(response.statusCode).toBe(202);
    });

    it('Should get counter to dois updated', async () => {
      const response = await request(app)
        .get('/doi/update/count');

      expect(response.statusCode).toBe(200);
      count = response.body;
      expect(count).toBe(4);
    });
  });
});
