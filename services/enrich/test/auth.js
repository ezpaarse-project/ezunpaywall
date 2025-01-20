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

const ping = require('./utils/ping');

const enrichURL = process.env.ENRICH_URL || 'http://localhost:59702';
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
          .request(enrichURL)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
          .set('Content-Type', 'text/csv')
          .set('x-api-key', 'user');

        expect(res1).have.status(200);
        id = res1?.body;
      });
    });

    describe('Test with enrich API key', () => {
      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichURL)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
          .set('Content-Type', 'text/csv')
          .set('x-api-key', 'enrich');

        expect(res1).have.status(200);

        id = res1?.body;
      });
    });

    describe('Test without API key', () => {
      it('Should return a error message', async () => {
        const res2 = await chai
          .request(enrichURL)
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
          .request(enrichURL)
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
          .request(enrichURL)
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

    describe('Test with notAllowed API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichURL)
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
          .request(enrichURL)
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

    describe('Test with user API key', () => {
      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichURL)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
          .set('Content-Type', 'text/csv')
          .set('x-api-key', 'user');

        expect(res1).have.status(200);

        id = res1?.body;
      });
    });

    describe('Do a enrichment but try to download with a other apikey', () => {
      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichURL)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
          .set('Content-Type', 'text/csv')
          .set('x-api-key', 'user');

        expect(res1).have.status(200);

        id = res1?.body;
      });

      it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
        // start enrich process
        const res2 = await chai
          .request(enrichURL)
          .post(`/job/${id}`)
          .send({
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
            .request(enrichURL)
            .get(`/states/${id}.json`)
            .set('x-api-key', 'user');
          expect(res3).have.status(200);
          await new Promise((resolve) => { setTimeout(resolve, 100); });
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
          .request(enrichURL)
          .get(`/enriched/${id}.csv`)
          .set('x-api-key', 'test');

        expect(res4).have.status(401);
      });
    });
  });

  describe('Test for jsonl enrich', () => {
    describe('Test with user API key', () => {
      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichURL)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.jsonl'), 'file01.jsonl')
          .set('Content-Type', 'application/x-ndjson')
          .set('x-api-key', 'user');

        expect(res1).have.status(200);

        id = res1?.body;
      });
    });

    describe('Test to upload with enrich API key', () => {
      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichURL)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.jsonl'), 'file01.jsonl')
          .set('Content-Type', 'application/x-ndjson')
          .set('x-api-key', 'enrich');

        expect(res1).have.status(200);

        id = res1?.body;
      });
    });

    describe('Test to upload without apikey', () => {
      it('Should return a error message', async () => {
        it('Should upload the file', async () => {
          const res = await chai
            .request(enrichURL)
            .post('/upload')
            .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.jsonl'), 'file01.jsonl')
            .set('Content-Type', 'application/x-ndjson');

          expect(res).have.status(401);
        });
      });
    });

    describe('Test to upload with a wrong apikey', () => {
      it('Should return a error message', async () => {
        it('Should upload the file', async () => {
          const res = await chai
            .request(enrichURL)
            .post('/upload')
            .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.jsonl'), 'file01.jsonl')
            .set('Content-Type', 'application/x-ndjson')
            .set('x-api-key', 'wrongapikey');

          expect(res).have.status(401);
        });
      });
    });

    describe('Test to enrich without API key', () => {
      it('Should return a error message', async () => {
        const res2 = await chai
          .request(enrichURL)
          .post(`/job/${id}`)
          .send({
            type: 'jsonl',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          });

        expect(res2).have.status(401);
      });
    });

    describe('Test to enrich with a wrong API key that doen\'t exist', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichURL)
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

    describe('Test to enrich with graphql API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichURL)
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

    describe('Test to enrich with notAllowed API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichURL)
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

    describe('Test to enrich with notAllowed API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichURL)
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

    describe('Test to enrich with userRestricted API key', () => {
      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichURL)
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

    describe('Test to access to user files with enrich API key', () => {
      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichURL)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.jsonl'), 'file01.jsonl')
          .set('Content-Type', 'application/x-ndjson')
          .set('x-api-key', 'user');

        expect(res1).have.status(200);

        id = res1?.body;
      });

      it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
        // start enrich process
        const res2 = await chai
          .request(enrichURL)
          .post(`/job/${id}`)
          .send({
            type: 'jsonl',
            index: 'unpaywall-test',
          })
          .set('x-api-key', 'user');

        expect(res2).have.status(200);
      });

      it('Should get the state of enrich', async () => {
        let res3;
        do {
          res3 = await chai
            .request(enrichURL)
            .get(`/states/${id}.json`)
            .set('x-api-key', 'user');
          await new Promise((resolve) => { setTimeout(resolve, 100); });
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

      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichURL)
          .get(`/states/${id}.json`)
          .set('x-api-key', 'enrich');

        expect(res).have.status(404);
      });

      it('Should return a error message', async () => {
        const res = await chai
          .request(enrichURL)
          .post(`/enriched/${id}.jsonl`)
          .set('x-api-key', 'enrich');

        expect(res).have.status(404);
      });
    });
  });
  after(async () => {
    await deleteIndex('unpaywall-test');
    await deleteAllAPIKey();
  });
});
