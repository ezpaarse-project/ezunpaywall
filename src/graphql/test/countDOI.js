const { expect } = require('chai');

const getNumberOfDOI = require('../lib/middlewares/countDOI');

describe('Test logger of graphql API', () => {
  describe('GET: unpaywall graphql', () => {
    const req1 = { query: {}, body: {} };
    const query1 = '{ unpaywall(dois:["1"]) { doi, is_oa } }';

    const req2 = { query: {}, body: {} };
    const query2 = '{ unpaywall(dois:["1", "2"]) { doi, is_oa } }';

    const req3 = { query: {}, body: {} };
    const query3 = '{ unpaywall(dois:[]) { doi, is_oa } }';

    const req4 = { query: {}, body: {} };
    const query4 = '{ unpaywall(dois:["1[]"]) { doi, is_oa } }';

    before(() => {
      req1.query.query = query1;
      req2.query.query = query2;
      req3.query.query = query3;
      req4.query.query = query4;
    });

    it('Should get 1', async () => {
      const count = getNumberOfDOI(req1);
      expect(count).eql(1);
    });

    it('Should get 2', async () => {
      const count = getNumberOfDOI(req2);
      expect(count).eql(2);
    });

    it('Should get 0', async () => {
      const count = getNumberOfDOI(req3);
      expect(count).eql(0);
    });

    it('Should get 1', async () => {
      const count = getNumberOfDOI(req4);
      expect(count).eql(1);
    });
  });

  describe('POST: unpaywall graphql', () => {
    const req1 = { query: {}, body: {} };
    const query1 = '{ unpaywall(dois: ["1"]) { doi, is_oa } }';

    const req2 = { query: {}, body: {} };
    const query2 = '{ unpaywall(dois: ["1", "2"]) { doi, is_oa } }';

    const req3 = { query: {}, body: {} };
    const query3 = '{ unpaywall(dois: []) { doi, is_oa } }';

    before(() => {
      req1.body.query = query1;
      req2.body.query = query2;
      req3.body.query = query3;
    });

    it('Should get 1', async () => {
      const count = getNumberOfDOI(req1);
      expect(count).eql(1);
    });

    it('Should get 2', async () => {
      const count = getNumberOfDOI(req2);
      expect(count).eql(2);
    });

    it('Should get 0', async () => {
      const count = getNumberOfDOI(req3);
      expect(count).eql(0);
    });
  });

  describe('POST: unpaywall graphql with multine', () => {
    const req1 = { query: {}, body: {} };
    const query1 = `
      { unpaywall(dois: ["1"]) { doi, is_oa } }
    `;

    const req2 = { query: {}, body: {} };
    const query2 = `{ 
      unpaywall(dois: ["1", "2"]) { doi, is_oa } 
    }`;

    const req3 = { query: {}, body: {} };
    const query3 = `
      { unpaywall(dois: []) { doi, is_oa } }
    `;

    before(() => {
      req1.body.query = query1;
      req2.body.query = query2;
      req3.body.query = query3;
    });

    it('Should get 1', async () => {
      const count = getNumberOfDOI(req1);
      expect(count).eql(1);
    });

    it('Should get 2', async () => {
      const count = getNumberOfDOI(req2);
      expect(count).eql(2);
    });

    it('Should get 0', async () => {
      const count = getNumberOfDOI(req3);
      expect(count).eql(0);
    });
  });

  describe('POST: unpaywall graphql other syntax', () => {
    const req1 = { query: {}, body: {} };
    const query = 'query ($dois: [ID!]!) { unpaywall(dois:  $dois) { doi, is_oa } }';
    const variables1 = { dois: ['1'] };

    const req2 = { query: {}, body: {} };
    const variables2 = { dois: ['1', '2'] };

    const req3 = { query: {}, body: {} };
    const variables3 = { dois: [] };

    before(() => {
      req1.body.query = query;
      req1.body.variables = variables1;

      req2.body.query = query;
      req2.body.variables = variables2;

      req3.body.query = query;
      req3.body.variables = variables3;
    });

    it('Should get 1', async () => {
      const count = getNumberOfDOI(req1);
      expect(count).eql(1);
    });

    it('Should get 2', async () => {
      const count = getNumberOfDOI(req2);
      expect(count).eql(2);
    });

    it('Should get 0', async () => {
      const count = getNumberOfDOI(req3);
      expect(count).eql(0);
    });
  });
});
