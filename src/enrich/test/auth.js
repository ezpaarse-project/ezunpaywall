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
  pingEnrich,
  pingElastic,
  pingRedis,
} = require('./utils/ping');

const enrichService = process.env.ENRICH_URL || 'http://localhost:5000';
const enrichDir = path.resolve(__dirname, 'sources');

describe('Test: auth service in enrich service', () => {
  let id;

  before(async function () {
    this.timeout(30000);
    await pingEnrich();
    await pingElastic();
    await pingRedis();
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
          .set('x-api-key', 'wrong apikey');

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
          .set('x-api-key', 'graphql');

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
          .set('x-api-key', 'update');

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
          .set('x-api-key', 'notAllowed');

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
          .set('x-api-key', 'userRestricted');

        expect(res).have.status(401);
        expect(res?.body).have.property('message').eq('You don\'t have access to "oa_status" attribute(s)');
      });
    });

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

    describe('Do a enrichment but try to download with a other apikey', () => {
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

      it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
        // start enrich process
        const res2 = await chai
          .request(enrichService)
          .post('/job')
          .send({
            id,
            type: 'csv',
            index: 'unpaywall-test',
          })
          .set('x-api-key', 'user');

        expect(res2).have.status(200);
      });

      it('Should get the state of enrich', async () => {
        let res3;
        do {
          res3 = await chai
            .request(enrichService)
            .get(`/state/${id}.json`)
            .set('x-api-key', 'user');
          expect(res3).have.status(200);
          await new Promise((resolve) => setTimeout(resolve, 100));
        } while (!res3?.body?.done);

        const state = res3?.body;

        expect(state).have.property('done').equal(true);
        expect(state).have.property('loaded').to.not.equal(undefined);
        expect(state).have.property('linesRead').equal(3);
        expect(state).have.property('enrichedLines').equal(3);
        expect(state).have.property('createdAt').to.not.equal(undefined);
        expect(state).have.property('endAt').to.not.equal(undefined);
        expect(state).have.property('error').equal(false);
      });

      it('Shouldn\'t download the enrichedfile', async () => {
        const res4 = await chai
          .request(enrichService)
          .get(`/enriched/${id}.csv`)
          .set('x-api-key', 'test');

        expect(res4).have.status(401);
        expect(res4?.body).have.property('message').eq('Not authorized');
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
          .set('x-api-key', 'wrong apikey');

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
          .set('x-api-key', 'update');

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
          .set('x-api-key', 'graphql');

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
          .set('x-api-key', 'notAllowed');

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
          .set('x-api-key', 'notAllowed');

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
          .set('x-api-key', 'userRestricted');

        expect(res).have.status(401);
        expect(res?.body).have.property('message').eq('You don\'t have access to "oa_status" attribute(s)');
      });
    });
  });
  after(async () => {
    await deleteIndex('unpaywall-test');
    await deleteAllAPIKey();
  });
});
