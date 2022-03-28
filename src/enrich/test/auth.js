/* eslint-disable no-await-in-loop */
const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const mappingUnpaywall = require('./mapping/unpaywall.json');

chai.use(chaiHttp);

const {
  loadDevAPIKey,
  deleteAllAPIKey,
} = require('./utils/apikey');

const {
  createIndex,
  deleteIndex,
  insertDataUnpaywall,
  countDocuments,
} = require('./utils/elastic');

const {
  ping,
} = require('./utils/ping');

const enrichService = process.env.ENRICH_URL || 'http://localhost:5000';
const enrichDir = path.resolve(__dirname, 'sources');

describe('Test: auth service in enrich service', () => {
  let id;

  before(async function () {
    this.timeout(30000);
    await ping();
    await deleteAllAPIKey();
    await loadDevAPIKey();
    await deleteIndex('unpaywall-test');
    await createIndex('unpaywall-test', mappingUnpaywall);
    await insertDataUnpaywall();
    const ndData = await countDocuments('unpaywall-test');
    expect(ndData).eq(50);
  });

  describe('Test for csv enrich', () => {
    describe('Test with user API key', () => {
      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichService)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'file1.csv')
          .set('Content-Type', 'text/csv')
          .set('x-api-key', 'user');

        expect(res1).have.status(200);

        id = res1?.body?.id;
      });
    });

    describe('Test with enrich API key', () => {
      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichService)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'file1.csv')
          .set('Content-Type', 'text/csv')
          .set('x-api-key', 'enrich');

        expect(res1).have.status(200);

        id = res1?.body?.id;
      });
    });

    describe('Test without API key', () => {
      it('Should return a error message', async () => {
        const res2 = await chai
          .request(enrichService)
          .post(`/job/${id}`)
          .send({
            type: 'csv',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          });

        expect(res2).have.status(401);
      });
    });

    describe('Test with wrong API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post(`/job/${id}`)
          .send({
            type: 'csv',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('x-api-key', 'wrong apikey');

        expect(res).have.status(401);
      });
    });

    describe('Test with graphql API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post(`/job/${id}`)
          .send({
            type: 'csv',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('x-api-key', 'graphql');

        expect(res).have.status(401);
      });
    });

    describe('Test with update API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post(`/job/${id}`)
          .send({
            type: 'csv',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('x-api-key', 'update');

        expect(res).have.status(401);
      });
    });

    describe('Test with notAllowed API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post(`/job/${id}`)
          .send({
            type: 'csv',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('x-api-key', 'notAllowed');

        expect(res).have.status(401);
      });
    });

    describe('Test with userRestricted API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post(`/job/${id}`)
          .send({
            type: 'csv',
            index: 'unpaywall-test',
            args: '{ is_oa, oa_status }',
          })
          .set('x-api-key', 'userRestricted');

        expect(res).have.status(401);
      });
    });
  });
  describe('Test for jsonl enrich', () => {
    describe('Test with user API key', () => {
      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichService)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file1.jsonl'), 'file1.jsonl')
          .set('Content-Type', 'application/x-ndjson')
          .set('x-api-key', 'user');

        expect(res1).have.status(200);

        id = res1?.body?.id;
      });
    });

    describe('Test with enrich API key', () => {
      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichService)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file1.jsonl'), 'file1.jsonl')
          .set('Content-Type', 'application/x-ndjson')
          .set('x-api-key', 'enrich');

        expect(res1).have.status(200);

        id = res1?.body?.id;
      });
    });

    describe('Test without API key', () => {
      it('Should return a error message', async () => {
        const res2 = await chai
          .request(enrichService)
          .post(`/job/${id}`)
          .send({
            type: 'jsonl',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          });

        expect(res2).have.status(401);
      });
    });

    describe('Test with a wrong API key that doen\'t exist', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post(`/job/${id}`)
          .send({
            type: 'jsonl',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('x-api-key', 'wrong apikey');

        expect(res).have.status(401);
      });
    });

    describe('Test with update API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post(`/job/${id}`)
          .send({
            type: 'jsonl',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('x-api-key', 'update');

        expect(res).have.status(401);
      });
    });

    describe('Test with graphql API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post(`/job/${id}`)
          .send({
            type: 'jsonl',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('x-api-key', 'graphql');

        expect(res).have.status(401);
      });
    });

    describe('Test with notAllowed API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post(`/job/${id}`)
          .send({
            type: 'jsonl',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('x-api-key', 'notAllowed');

        expect(res).have.status(401);
      });
    });

    describe('Test with notAllowed API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post(`/job/${id}`)
          .send({
            type: 'jsonl',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('x-api-key', 'notAllowed');

        expect(res).have.status(401);
      });
    });

    describe('Test with userRestricted API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post(`/job/${id}`)
          .send({
            type: 'jsonl',
            index: 'unpaywall-test',
            args: '{ is_oa, oa_status }',
          })
          .set('x-api-key', 'userRestricted');

        expect(res).have.status(401);
      });
    });
  });
  after(async () => {
    await deleteIndex('unpaywall-test');
    await deleteAllAPIKey();
  });
});
