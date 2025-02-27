/* eslint-disable no-await-in-loop */
const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');
const fsp = require('fs/promises');
const path = require('path');

chai.use(chaiHttp);

const mappingUnpaywall = require('./mapping/unpaywall.json');

const {
  binaryParser,
  compareFile,
} = require('./utils/file');

const {
  createIndex,
  deleteIndex,
  insertDataUnpaywall,
  countDocuments,
} = require('./utils/elastic');

const ping = require('./utils/ping');

const {
  loadDevAPIKey,
  deleteAllAPIKey,
} = require('./utils/apikey');

const enrichURL = process.env.ENRICH_URL || 'http://localhost:59702';

const enrichDir = path.resolve(__dirname, 'sources');

describe('Test: enrich service jsonl', () => {
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

  describe('Test: enrichment with a jsonl file', () => {
    describe('Do a enrichment of a jsonl file with all unpaywall attributes', () => {
      let id;
      let enrichedFile;

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

      it('Should download the enrichedfile', async () => {
        const res4 = await chai
          .request(enrichURL)
          .get(`/enriched/${id}.jsonl`)
          .set('x-api-key', 'user')
          .buffer()
          .parse(binaryParser);

        enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.jsonl');
        try {
          await fsp.writeFile(enrichedFile, res4.body.toString());
        } catch (err) {
          console.error(`writeFile: ${err}`);
        }
      });

      it('Should be the same', async () => {
        const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file01.jsonl');

        const same = await compareFile(reference, enrichedFile);
        expect(same).to.be.equal(true);
      });
    });

    describe('Do a enrichment of a jsonl file with all unpaywall attributes', () => {
      let id;
      let enrichedFile;

      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichURL)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file02.jsonl'), 'file02.jsonl')
          .set('Content-Type', 'application/x-ndjson')
          .set('x-api-key', 'user');

        expect(res1).have.status(200);

        id = res1?.body;
      });
      it('Should enrich the file on 2 lines with all unpaywall attributes and download it', async () => {
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
          expect(res3).have.status(200);
          await new Promise((resolve) => { setTimeout(resolve, 100); });
        } while (!res3?.body?.done);

        const state = res3?.body;

        expect(state).have.property('done').equal(true);
        expect(state).have.property('loaded').to.not.equal(undefined);
        expect(state).have.property('linesRead').equal(3);
        expect(state).have.property('enrichedLines').equal(2);
        expect(state).have.property('createdAt').to.not.equal(undefined);
        expect(state).have.property('endAt').to.not.equal(undefined);
        expect(state).have.property('error').equal(false);
      });

      it('Should download the enrichedfile', async () => {
        const res4 = await chai
          .request(enrichURL)
          .get(`/enriched/${id}.jsonl`)
          .set('x-api-key', 'user')
          .buffer()
          .parse(binaryParser);

        enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.jsonl');
        try {
          await fsp.writeFile(enrichedFile, res4.body.toString());
        } catch (err) {
          console.error(`writeFile: ${err}`);
        }
      });

      it('Should be the same', async () => {
        const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file02.jsonl');

        const same = await compareFile(reference, enrichedFile);
        expect(same).to.be.equal(true);
      });
    });

    describe('Do a enrichment of a jsonl file with some unpaywall attributes (is_oa, best_oa_location.license, z_authors.family)', () => {
      let id;
      let enrichedFile;
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

      it('Should enrich the file on 3 lines with args {is_oa} and download it', async () => {
        const res2 = await chai
          .request(enrichURL)
          .post(`/job/${id}`)
          .send({
            type: 'jsonl',
            index: 'unpaywall-test',
            args: '{ is_oa }',
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

      it('Should download the enrichedfile', async () => {
        const res4 = await chai
          .request(enrichURL)
          .get(`/enriched/${id}.jsonl`)
          .set('x-api-key', 'user')
          .buffer()
          .parse(binaryParser);

        enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.jsonl');
        try {
          await fsp.writeFile(enrichedFile, res4.body.toString());
        } catch (err) {
          console.error(`writeFile: ${err}`);
        }
      });

      it('Should be the same', async () => {
        const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file03.jsonl');

        const same = await compareFile(reference, enrichedFile);
        expect(same).to.be.equal(true);
      });
    });

    describe('Do a enrichment of a jsonl file with some unpaywall attributes best_oa_location.license', () => {
      let id;
      let enrichedFile;
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

      it('Should enrich the file on 3 lines with args { best_oa_location { license } } and download it', async () => {
        const res2 = await chai
          .request(enrichURL)
          .post(`/job/${id}`)
          .send({
            type: 'jsonl',
            index: 'unpaywall-test',
            args: '{ best_oa_location { license } }',
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

      it('Should download the enrichedfile', async () => {
        const res4 = await chai
          .request(enrichURL)
          .get(`/enriched/${id}.jsonl`)
          .set('x-api-key', 'user')
          .buffer()
          .parse(binaryParser);

        enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.jsonl');
        try {
          await fsp.writeFile(enrichedFile, res4.body.toString());
        } catch (err) {
          console.error(`writeFile: ${err}`);
        }
      });

      it('Should be the same', async () => {
        const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file04.jsonl');

        const same = await compareFile(reference, enrichedFile);
        expect(same).to.be.equal(true);
      });
    });

    describe('Do a enrichment of a jsonl file with some unpaywall attributes z_authors.given', () => {
      let id;
      let enrichedFile;

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

      it('Should enrich the file on 3 lines with args { z_authors { given } } and download it', async () => {
        const res2 = await chai
          .request(enrichURL)
          .post(`/job/${id}`)
          .send({
            type: 'jsonl',
            index: 'unpaywall-test',
            args: '{ z_authors { given } }',
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

      it('Should download the enrichedfile', async () => {
        const res4 = await chai
          .request(enrichURL)
          .get(`/enriched/${id}.jsonl`)
          .set('x-api-key', 'user')
          .buffer()
          .parse(binaryParser);

        enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.jsonl');
        try {
          await fsp.writeFile(enrichedFile, res4.body.toString());
        } catch (err) {
          console.error(`writeFile: ${err}`);
        }
      });

      it('Should be the same', async () => {
        const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file05.jsonl');
        const same = await compareFile(reference, enrichedFile);
        expect(same).to.be.equal(true);
      });
    });

    describe('Do a enrichment of a jsonl file with some unpaywall attributes is_oa, best_oa_location.license, z_authors.family', () => {
      let id;
      let enrichedFile;

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

      it('Should enrich the file on 3 lines with args { is_oa, best_oa_location { license }, z_authors{ family } } and download it', async () => {
        const res2 = await chai
          .request(enrichURL)
          .post(`/job/${id}`)
          .send({
            type: 'jsonl',
            index: 'unpaywall-test',
            args: '{ is_oa, best_oa_location { license }, z_authors { family } }',
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

      it('Should download the enrichedfile', async () => {
        const res4 = await chai
          .request(enrichURL)
          .get(`/enriched/${id}.jsonl`)
          .set('x-api-key', 'user')
          .buffer()
          .parse(binaryParser);

        enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.jsonl');
        try {
          await fsp.writeFile(enrichedFile, res4.body.toString());
        } catch (err) {
          console.error(`writeFile: ${err}`);
        }
      });

      it('Should be the same', async () => {
        const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file06.jsonl');

        const same = await compareFile(reference, enrichedFile);
        expect(same).to.be.equal(true);
      });
    });

    describe('Don\'t do a enrichment of a jsonl file because the arguments doesn\'t exist on ezunpaywall index', () => {
      let id;

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

      it('Should return a error message', async () => {
        const res2 = await chai
          .request(enrichURL)
          .post(`/job/${id}`)
          .send({
            type: 'jsonl',
            index: 'unpaywall-test',
            args: '{ coin }',
          })
          .set('x-api-key', 'user');

        // TODO mettre une erreur 401
        expect(res2).have.status(200);
        // expect(JSON.parse(res.body).message).be.equal('args incorrect');
      });
    });

    describe('Don\'t do a enrichment of a jsonl file because the file doesn\'t exist', () => {
      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichURL)
          .post('/job')
          .send({
            id: 'hello',
            type: 'jsonl',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('x-api-key', 'user');

        expect(res1).have.status(404);
      });
    });
  });

  after(async () => {
    // await deleteIndex('unpaywall-test');
    await deleteAllAPIKey();
  });
});
