const request = require('supertest');
const { paths } = require('config');
const { format } = require('date-fns');

const startServer = require('../../src/app');
const { loadApikey } = require('../utils/apikey');
const getLastLogLine = require('../utils/log');

// This come from ezPAARSE
const logFormat = /^([a-zA-Z0-9.\-:]+(?:, ?[a-zA-Z0-9.\-:]+)*) "([a-zA-Z0-9@.\-_%,=& ]+)" \[([^\]]+)\] "[A-Z]+ ([^ ]+) [^ ]+" ([0-9]+) ([0-9]+|-) "([^"]*)" "([0-9.]+)[^"]*" "([^"]*)" ([^ ]*)$/;

const { accessDir } = paths.log;

describe('Graphql: GET GetByDOI resolver', () => {
  let app;

  const apikey1 = 'apikey1';
  const doi1 = '1';

  beforeAll(async () => {
    app = await startServer();
    await loadApikey();
  });

  afterAll(async () => {
    app.close();
  });

  describe(`GET: get unpaywall data for DOI ${doi1}`, () => {
    const graphqlRequest = `{ GetByDOI(dois: ["${doi1}"]) { doi, is_oa } }`;
    it(`Should get unpaywall data - ${graphqlRequest}`, async () => {
      const response = await request(app)
        .get('/graphql')
        .query({ query: graphqlRequest })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      const data = response?.body?.data?.GetByDOI;
      expect(data).toBeInstanceOf(Array);
      expect(data).toHaveLength(1);

      expect(data).toMatchObject([
        { doi: doi1, is_oa: true },
      ]);
    });

    it('Log line should be in the right format', async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const logFile = `${accessDir}/${today}-access.log`;

      const logLine = await getLastLogLine(logFile);
      expect(logLine).toMatch(logFormat);
    });
  });
});
