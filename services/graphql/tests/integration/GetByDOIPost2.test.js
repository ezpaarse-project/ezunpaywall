const request = require('supertest');

const startServer = require('../../src/app');
const { loadApikey } = require('../utils/apikey');

describe('Graphql: POST2 GetByDOI resolver', () => {
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

  describe(`POST with variables: get unpaywall data for DOI ${doi1}`, () => {
    const graphqlRequest = 'query ($dois: [ID!]!) { GetByDOI(dois: $dois) { doi, is_oa } }';
    const variables = { dois: [doi1] };
    it(`Should get unpaywall data - ${graphqlRequest}`, async () => {
      const response = await request(app)
        .post('/graphql')
        .send({ query: graphqlRequest })
        .send({ variables })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      const data = response?.body?.data?.GetByDOI;
      expect(data).toBeInstanceOf(Array);
      expect(data).toHaveLength(1);

      expect(data).toMatchObject([
        { doi: doi1, is_oa: true },
      ]);
    });
  });

  describe(`POST with variables: get unpaywall data for DOI ${doi6}`, () => {
    const graphqlRequest = 'query ($dois: [ID!]!) { GetByDOI(dois: $dois) { doi, is_oa } }';
    const variables = { dois: [doi6] };
    it(`Should get unpaywall data - ${graphqlRequest}`, async () => {
      const response = await request(app)
        .post('/graphql')
        .send({ query: graphqlRequest })
        .send({ variables })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      const data = response?.body?.data?.GetByDOI;
      expect(data).toBeInstanceOf(Array);
      expect(data).toHaveLength(0);
    });
  });

  describe(`POST with variables: get unpaywall data for DOI ${doi3a} not normalized`, () => {
    const graphqlRequest = 'query ($dois: [ID!]!) { GetByDOI(dois: $dois) { doi, is_oa } }';
    const variables = { dois: [doi3a] };
    it(`Should get unpaywall data - ${graphqlRequest}`, async () => {
      const response = await request(app)
        .post('/graphql')
        .send({ query: graphqlRequest })
        .send({ variables })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      const data = response?.body?.data?.GetByDOI;
      expect(data).toBeInstanceOf(Array);
      expect(data).toHaveLength(1);

      expect(data).toMatchObject([
        { doi: doi3a, is_oa: true },
      ]);
    });
  });

  describe(`POST with variables: get unpaywall data for DOI ${doi3b} not normalized`, () => {
    const graphqlRequest = 'query ($dois: [ID!]!) { GetByDOI(dois: $dois) { doi, is_oa } }';
    const variables = { dois: [doi3b] };
    it(`Should get unpaywall data - ${graphqlRequest}`, async () => {
      const response = await request(app)
        .post('/graphql')
        .send({ query: graphqlRequest })
        .send({ variables })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      const data = response?.body?.data?.GetByDOI;
      expect(data).toBeInstanceOf(Array);
      expect(data).toHaveLength(1);

      expect(data).toMatchObject([
        { doi: doi3a, is_oa: true },
      ]);
    });
  });

  describe(`POST with variables: get unpaywall data for DOI ${doi1} ${doi2}`, () => {
    const graphqlRequest = 'query ($dois: [ID!]!) { GetByDOI(dois: $dois) { doi, is_oa } }';
    const variables = { dois: [doi1, doi2] };
    it(`Should get unpaywall data - ${graphqlRequest}`, async () => {
      const response = await request(app)
        .post('/graphql')
        .send({ query: graphqlRequest })
        .send({ variables })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      const data = response?.body?.data?.GetByDOI;
      expect(data).toBeInstanceOf(Array);
      expect(data).toHaveLength(2);

      expect(data).toMatchObject([
        { doi: doi1, is_oa: true },
        { doi: doi2, is_oa: true },
      ]);
    });
  });

  describe(`POST with variables: get unpaywall data for DOI ${doi1} ${doi6}`, () => {
    const graphqlRequest = 'query ($dois: [ID!]!) { GetByDOI(dois: $dois) { doi, is_oa } }';
    const variables = { dois: [doi1, doi6] };
    it(`Should get unpaywall data - ${graphqlRequest}`, async () => {
      const response = await request(app)
        .post('/graphql')
        .send({ query: graphqlRequest })
        .send({ variables })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      const data = response?.body?.data?.GetByDOI;
      expect(data).toBeInstanceOf(Array);
      expect(data).toHaveLength(1);

      expect(data).toMatchObject([
        { doi: doi1, is_oa: true },
      ]);
    });
  });
});
