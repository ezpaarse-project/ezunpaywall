/* eslint-disable no-await-in-loop */
const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const mappingUnpaywall = require('./mapping/unpaywall.json');

chai.use(chaiHttp);

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
          .set('X-API-KEY', 'user');

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
          .set('X-API-KEY', 'enrich');

        expect(res1).have.status(200);

        id = res1?.body?.id;
      });
    });

    describe('Test without API key', () => {
      it('Should return a error message', async () => {
        const res2 = await chai
          .request(enrichService)
          .post('/job')
          .send({
            id,
            type: 'csv',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          });

        expect(res2).have.status(401);
        expect(res2?.body).have.property('message').eq('Not authorized');
      });
    });

    describe('Test with wrong API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post('/job')
          .send({
            id,
            type: 'csv',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('X-API-KEY', 'wrong apikey');

        expect(res).have.status(401);
        expect(res?.body).have.property('message').eq('Not authorized');
      });
    });

    describe('Test with graphql API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post('/job')
          .send({
            id,
            type: 'csv',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('X-API-KEY', 'graphql');

        expect(res).have.status(401);
        expect(res?.body).have.property('message').eq('Not authorized');
      });
    });

    describe('Test with update API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post('/job')
          .send({
            id,
            type: 'csv',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('X-API-KEY', 'update');

        expect(res).have.status(401);
        expect(res?.body).have.property('message').eq('Not authorized');
      });
    });

    describe('Test with notAllowed API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post('/job')
          .send({
            id,
            type: 'csv',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('X-API-KEY', 'notAllowed');

        expect(res).have.status(401);
        expect(res?.body).have.property('message').eq('Not authorized');
      });
    });

    describe('Test with userRestricted API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post('/job')
          .send({
            id,
            type: 'csv',
            index: 'unpaywall-test',
            args: '{ is_oa, oa_status }',
          })
          .set('X-API-KEY', 'userRestricted');

        expect(res).have.status(401);
        expect(res?.body).have.property('message').eq('You don\'t have access to "oa_status" attribute(s)');
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
          .set('X-API-KEY', 'user');

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
          .set('X-API-KEY', 'enrich');

        expect(res1).have.status(200);

        id = res1?.body?.id;
      });
    });

    describe('Test without API key', () => {
      it('Should return a error message', async () => {
        const res2 = await chai
          .request(enrichService)
          .post('/job')
          .send({
            id,
            type: 'jsonl',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          });

        expect(res2).have.status(401);
        expect(res2?.body).have.property('message').eq('Not authorized');
      });
    });

    describe('Test with a wrong API key that doen\'t exist', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post('/job')
          .send({
            id,
            type: 'jsonl',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('X-API-KEY', 'wrong apikey');

        expect(res).have.status(401);
        expect(res?.body).have.property('message').eq('Not authorized');
      });
    });

    describe('Test with update API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post('/job')
          .send({
            id,
            type: 'jsonl',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('X-API-KEY', 'update');

        expect(res).have.status(401);
        expect(res?.body).have.property('message').eq('Not authorized');
      });
    });

    describe('Test with graphql API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post('/job')
          .send({
            id,
            type: 'jsonl',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('X-API-KEY', 'graphql');

        expect(res).have.status(401);
        expect(res?.body).have.property('message').eq('Not authorized');
      });
    });

    describe('Test with notAllowed API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post('/job')
          .send({
            id,
            type: 'jsonl',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('X-API-KEY', 'notAllowed');

        expect(res).have.status(401);
        expect(res?.body).have.property('message').eq('Not authorized');
      });
    });

    describe('Test with notAllowed API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post('/job')
          .send({
            id,
            type: 'jsonl',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('X-API-KEY', 'notAllowed');

        expect(res).have.status(401);
        expect(res?.body).have.property('message').eq('Not authorized');
      });
    });

    describe('Test with userRestricted API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichService)
          .post('/job')
          .send({
            id,
            type: 'jsonl',
            index: 'unpaywall-test',
            args: '{ is_oa, oa_status }',
          })
          .set('X-API-KEY', 'userRestricted');

        expect(res).have.status(401);
        expect(res?.body).have.property('message').eq('You don\'t have access to "oa_status" attribute(s)');
      });
    });
  });
  after(async () => {
    await deleteIndex('unpaywall-test');
  });
});