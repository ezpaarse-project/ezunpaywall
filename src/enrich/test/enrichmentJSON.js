/* eslint-disable no-await-in-loop */
const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs-extra');
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

const {
  ping,
} = require('./utils/ping');

const enrichService = process.env.ENRICH_URL || 'http://localhost:5000';

const enrichDir = path.resolve(__dirname, 'sources');

describe('Test: enrichment with a jsonl file (command ezu)', () => {
  before(async () => {
    await ping();
    await deleteIndex('unpaywall-test');
    await createIndex('unpaywall-test', mappingUnpaywall);
    await insertDataUnpaywall();
    const ndData = await countDocuments('unpaywall-test');
    expect(ndData).eq(50);
  });

  describe('Do a enrichment of a jsonl file with all unpaywall attributes', () => {
    let id;
    let enrichedFile;

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

    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      // start enrich process
      const res2 = await chai
        .request(enrichService)
        .post('/job')
        .send({
          id,
          type: 'jsonl',
          index: 'unpaywall-test',
        })
        .set('X-API-KEY', 'user');

      expect(res2).have.status(200);
    });

    it('Should get the state of enrich', async () => {
      let res3;
      do {
        res3 = await chai
          .request(enrichService)
          .get(`/state/${id}.json`);
        expect(res3).have.status(200);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!res3?.body?.state?.done);

      const { state } = res3?.body;

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
        .request(enrichService)
        .get(`/enriched/${id}.jsonl`)
        .buffer()
        .parse(binaryParser);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.jsonl');
      try {
        await fs.writeFile(enrichedFile, res4.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file1.jsonl');

      const same = await compareFile(reference, enrichedFile);
      expect(same).to.be.equal(true);
    });
  });

  describe('Do a enrichment of a jsonl file with all unpaywall attributes', () => {
    let id;
    let enrichedFile;

    it('Should upload the file', async () => {
      const res1 = await chai
        .request(enrichService)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file2.jsonl'), 'file2.jsonl')
        .set('Content-Type', 'application/x-ndjson')
        .set('X-API-KEY', 'user');

      expect(res1).have.status(200);

      id = res1?.body?.id;
    });
    it('Should enrich the file on 2 lines with all unpaywall attributes and download it', async () => {
      const res2 = await chai
        .request(enrichService)
        .post('/job')
        .send({
          id,
          type: 'jsonl',
          index: 'unpaywall-test',
        })
        .set('X-API-KEY', 'user');

      expect(res2).have.status(200);
    });

    it('Should get the state of enrich', async () => {
      let res3;

      do {
        res3 = await chai
          .request(enrichService)
          .get(`/state/${id}.json`);
        expect(res3).have.status(200);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!res3?.body?.state?.done);

      const { state } = res3?.body;

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
        .request(enrichService)
        .get(`/enriched/${id}.jsonl`)
        .buffer()
        .parse(binaryParser)
        .set('X-API-KEY', 'user');

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.jsonl');
      try {
        await fs.writeFile(enrichedFile, res4.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file2.jsonl');

      const same = await compareFile(reference, enrichedFile);
      expect(same).to.be.equal(true);
    });
  });

  describe('Do a enrichment of a jsonl file with some unpaywall attributes (is_oa, best_oa_location.license, z_authors.family)', () => {
    let id;
    let enrichedFile;
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

    it('Should enrich the file on 3 lines with args {is_oa} and download it', async () => {
      const res2 = await chai
        .request(enrichService)
        .post('/job')
        .send({
          id,
          type: 'jsonl',
          index: 'unpaywall-test',
          args: '{ is_oa }',
        })
        .set('X-API-KEY', 'user');

      expect(res2).have.status(200);
    });

    it('Should get the state of enrich', async () => {
      let res3;

      do {
        res3 = await chai
          .request(enrichService)
          .get(`/state/${id}.json`);
        expect(res3).have.status(200);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!res3?.body?.state?.done);

      const { state } = res3?.body;

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
        .request(enrichService)
        .get(`/enriched/${id}.jsonl`)
        .buffer()
        .parse(binaryParser);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.jsonl');
      try {
        await fs.writeFile(enrichedFile, res4.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file3.jsonl');

      const same = await compareFile(reference, enrichedFile);
      expect(same).to.be.equal(true);
    });
  });

  describe('Do a enrichment of a jsonl file with some unpaywall attributes best_oa_location.license', () => {
    let id;
    let enrichedFile;
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

    it('Should enrich the file on 3 lines with args { best_oa_location { license } } and download it', async () => {
      const res2 = await chai
        .request(enrichService)
        .post('/job')
        .send({
          id,
          type: 'jsonl',
          index: 'unpaywall-test',
          args: '{ best_oa_location { license } }',
        })
        .set('X-API-KEY', 'user');

      expect(res2).have.status(200);
    });

    it('Should get the state of enrich', async () => {
      let res3;
      do {
        res3 = await chai
          .request(enrichService)
          .get(`/state/${id}.json`);
        expect(res3).have.status(200);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!res3?.body?.state?.done);

      const { state } = res3?.body;

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
        .request(enrichService)
        .get(`/enriched/${id}.jsonl`)
        .buffer()
        .parse(binaryParser);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.jsonl');
      try {
        await fs.writeFile(enrichedFile, res4.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file4.jsonl');

      const same = await compareFile(reference, enrichedFile);
      expect(same).to.be.equal(true);
    });
  });

  describe('Do a enrichment of a jsonl file with some unpaywall attributes z_authors.given', () => {
    let id;
    let enrichedFile;

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

    it('Should enrich the file on 3 lines with args { z_authors { given } } and download it', async () => {
      const res2 = await chai
        .request(enrichService)
        .post('/job')
        .send({
          id,
          type: 'jsonl',
          index: 'unpaywall-test',
          args: '{ z_authors { given } }',
        })
        .set('X-API-KEY', 'user');

      expect(res2).have.status(200);
    });

    it('Should get the state of enrich', async () => {
      let res3;
      do {
        res3 = await chai
          .request(enrichService)
          .get(`/state/${id}.json`);
        expect(res3).have.status(200);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!res3?.body?.state?.done);

      const { state } = res3?.body;

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
        .request(enrichService)
        .get(`/enriched/${id}.jsonl`)
        .buffer()
        .parse(binaryParser);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.jsonl');
      try {
        await fs.writeFile(enrichedFile, res4.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file5.jsonl');
      const same = await compareFile(reference, enrichedFile);
      expect(same).to.be.equal(true);
    });
  });

  describe('Do a enrichment of a jsonl file with some unpaywall attributes is_oa, best_oa_location.license, z_authors.family', () => {
    let id;
    let enrichedFile;

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

    it('Should enrich the file on 3 lines with args { is_oa, best_oa_location { license }, z_authors{ family } } and download it', async () => {
      const res2 = await chai
        .request(enrichService)
        .post('/job')
        .send({
          id,
          type: 'jsonl',
          index: 'unpaywall-test',
          args: '{ is_oa, best_oa_location { license }, z_authors { family } }',
        })
        .set('X-API-KEY', 'user');

      expect(res2).have.status(200);
    });

    it('Should get the state of enrich', async () => {
      let res3;
      do {
        res3 = await chai
          .request(enrichService)
          .get(`/state/${id}.json`);
        expect(res3).have.status(200);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!res3?.body?.state?.done);

      const { state } = res3?.body;

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
        .request(enrichService)
        .get(`/enriched/${id}.jsonl`)
        .buffer()
        .parse(binaryParser);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.jsonl');
      try {
        await fs.writeFile(enrichedFile, res4.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file6.jsonl');

      const same = await compareFile(reference, enrichedFile);
      expect(same).to.be.equal(true);
    });
  });

  describe('Don\'t do a enrichment of a jsonl file because the arguments doesn\'t exist on ezunpaywall index', () => {
    let id;

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

    it('Should return a error message', async () => {
      const res2 = await chai
        .request(enrichService)
        .post('/job')
        .send({
          id,
          type: 'jsonl',
          index: 'unpaywall-test',
          args: '{ coin }',
        })
        .set('X-API-KEY', 'user');

      // TODO mettre une erreur 401
      expect(res2).have.status(500);
      // expect(JSON.parse(res.body).message).be.equal('args incorrect');
    });
  });

  describe('Don\'t do a enrichment of a jsonl file because wrong X-API-KEY', () => {
    let id;

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

  after(async () => {
    await deleteIndex('unpaywall-test');
  });
});
