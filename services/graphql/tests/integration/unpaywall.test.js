const request = require('supertest');

const startServer = require('../../src/app');
const { loadApikey } = require('../utils/apikey');

describe('Graphql: POST1 unpaywall resolver', () => {
  let app;
  const apikey1 = 'apikey1';
  const doi1 = '1';
  const doi2 = '2';
  const doi3a = '3aA';
  const doi3b = '3Aa';
  const doi6 = 'coin';

  beforeAll(async () => {
    app = await startServer();
    await loadApikey();
  });

  afterAll(async () => {
    app.close();
  });

  describe(`POST: get unpaywall data for DOI ${doi1}`, () => {
    const graphqlRequest = `{ unpaywall(dois: ["${doi1}"]) { doi, is_oa, z_authors { author_position, raw_author_name }, oa_locations { url, url_for_pdf, oa_date } } }`;
    it(`Should get unpaywall data - ${graphqlRequest}`, async () => {
      const response = await request(app)
        .post('/graphql')
        .send({ query: graphqlRequest })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      const data = response?.body?.data?.unpaywall;
      expect(data).toBeInstanceOf(Array);
      expect(data).toHaveLength(1);

      expect(data).toMatchObject([
        {
          doi: doi1,
          is_oa: true,
          z_authors: [
            {
              author_position: '1',
              raw_author_name: 'John Doe',
            },
          ],
          oa_locations: [
            {
              url: 'http://localhost',
              url_for_pdf: 'http://localhost',
              oa_date: '2020-01-01',
            },
          ],
        },
      ]);
    });
  });

  describe(`POST: get unpaywall data for DOI ${doi6}`, () => {
    const graphqlRequest = `{ unpaywall(dois: ["${doi6}"]) { doi, is_oa } }`;
    it(`Should get unpaywall data - ${graphqlRequest}`, async () => {
      const response = await request(app)
        .post('/graphql')
        .send({ query: graphqlRequest })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      const data = response?.body?.data?.unpaywall;
      expect(data).toBeInstanceOf(Array);
      expect(data).toHaveLength(0);
    });
  });

  describe(`POST: get unpaywall data for DOI ${doi3a} not normalized`, () => {
    const graphqlRequest = `{ unpaywall(dois: ["${doi3a.toUpperCase()}"]) { doi, is_oa } }`;
    it(`Should get unpaywall data - ${graphqlRequest}`, async () => {
      const response = await request(app)
        .post('/graphql')
        .send({ query: graphqlRequest })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      const data = response?.body?.data?.unpaywall;
      expect(data).toBeInstanceOf(Array);
      expect(data).toHaveLength(1);

      expect(data).toMatchObject([
        { doi: doi3a, is_oa: true },
      ]);
    });
  });

  describe(`POST: get unpaywall data for DOI ${doi3b} not normalized`, () => {
    const graphqlRequest = `{ unpaywall(dois: ["${doi3b.toLowerCase()}"]) { doi, is_oa } }`;
    it(`Should get unpaywall data - ${graphqlRequest}`, async () => {
      const response = await request(app)
        .post('/graphql')
        .send({ query: graphqlRequest })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      const data = response?.body?.data?.unpaywall;
      expect(data).toBeInstanceOf(Array);
      expect(data).toHaveLength(1);

      expect(data).toMatchObject([
        { doi: doi3a, is_oa: true },
      ]);
    });
  });

  describe(`POST: get unpaywall data for DOI ${doi1} ${doi2}`, () => {
    const graphqlRequest = `{ unpaywall(dois: ["${doi1}","${doi2}"]) { doi, is_oa } }`;
    it(`Should get unpaywall data - ${graphqlRequest}`, async () => {
      const response = await request(app)
        .post('/graphql')
        .send({ query: graphqlRequest })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      const data = response?.body?.data?.unpaywall;
      expect(data).toBeInstanceOf(Array);
      expect(data).toHaveLength(2);

      expect(data).toMatchObject([
        { doi: doi1, is_oa: true },
        { doi: doi2, is_oa: true },
      ]);
    });
  });

  describe(`POST: get unpaywall data for DOI ${doi1} ${doi6}`, () => {
    const graphqlRequest = `{ unpaywall(dois: ["${doi1}","${doi6}"]) { doi, is_oa } }`;
    it(`Should get unpaywall data - ${graphqlRequest}`, async () => {
      const response = await request(app)
        .post('/graphql')
        .send({ query: graphqlRequest })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      const data = response?.body?.data?.unpaywall;
      expect(data).toBeInstanceOf(Array);
      expect(data).toHaveLength(1);

      expect(data).toMatchObject([
        { doi: doi1, is_oa: true },
      ]);
    });
  });
});
