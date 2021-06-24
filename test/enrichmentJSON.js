/* eslint-disable no-await-in-loop */
const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs-extra');
const path = require('path');
const uuid = require('uuid');

chai.use(chaiHttp);

const indexUnpawall = require('../api/index/unpaywall.json');

const {
  binaryParser,
  compareFile,
} = require('./utils/file');

const {
  createIndex,
  checkIfInUpdate,
  countDocuments,
  addSnapshot,
  resetAll,
} = require('./utils/update');

const {
  ping,
} = require('./utils/ping');

const ezunpaywallURL = process.env.EZUNPAYWALL_URL || 'http://localhost:8080';

const enrichDir = path.resolve(__dirname, 'sources');

describe('Test: enrichment with a json file (command ezu)', () => {
  before(async () => {
    await ping();
    await resetAll();
    await addSnapshot('fake1.jsonl.gz');
    await createIndex('unpaywall', indexUnpawall);

    // test insertion
    await chai.request(ezunpaywallURL)
      .post('/update/fake1.jsonl.gz')
      .set('Access-Control-Allow-Origin', '*')
      .set('Content-Type', 'application/json')
      .set('api_key', 'admin');

    let inUpdate = true;
    while (inUpdate) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      inUpdate = await checkIfInUpdate();
    }
    const count = await countDocuments('unpaywall');
    expect(count).to.equal(50);
  });

  describe('Do a enrichment of a json file with all unpaywall attributes', () => {
    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.jsonl'), 'utf8');

      const id = uuid.v4();
      // start enrich process
      await chai
        .request(ezunpaywallURL)
        .post(`/enrich/json/${id}`)
        .send(file)
        .set('Content-Type', 'application/x-ndjson')
        .set('api_key', 'user');

      // get the state of process
      let res2;
      while (!res2?.body?.state?.done) {
        res2 = await chai
          .request(ezunpaywallURL)
          .get(`/enrich/state/${id}.json`);
        expect(res2).have.status(200);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const { state } = res2?.body;

      expect(state).have.property('done').equal(true);
      expect(state).have.property('loaded').to.not.equal(undefined);
      expect(state).have.property('linesRead').equal(3);
      expect(state).have.property('enrichedLines').equal(3);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('error').equal(false);

      // get the enriched file
      const res3 = await chai
        .request(ezunpaywallURL)
        .get(`/enrich/${id}.jsonl`)
        .buffer()
        .parse(binaryParser);

      try {
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.jsonl'), res3.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file1.jsonl');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 2 lines with all unpaywall attributes and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file2.jsonl'));

      const id = uuid.v4();
      // start enrich process
      await chai
        .request(ezunpaywallURL)
        .post(`/enrich/json/${id}`)
        .send(file)
        .set('Content-Type', 'application/x-ndjson')
        .set('api_key', 'user');

      // get the state of process
      let res2;
      while (!res2?.body?.state?.done) {
        res2 = await chai
          .request(ezunpaywallURL)
          .get(`/enrich/state/${id}.json`);
        expect(res2).have.status(200);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const { state } = res2?.body;

      expect(state).have.property('done').equal(true);
      expect(state).have.property('loaded').to.not.equal(undefined);
      expect(state).have.property('linesRead').equal(3);
      expect(state).have.property('enrichedLines').equal(2);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('error').equal(false);

      // get the enriched file
      const res3 = await chai
        .request(ezunpaywallURL)
        .get(`/enrich/${id}.jsonl`)
        .buffer()
        .parse(binaryParser);

      try {
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.jsonl'), res3.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file2.jsonl');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });
  });

  describe('Do a enrichment of a file already installed and enrich a json file with some unpaywall attributes (is_oa, best_oa_location.license, z_authors.family)', () => {
    it('Should enrich the file on 3 lines with is_oa attributes and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.jsonl'), 'utf8');

      const id = uuid.v4();
      // start enrich process
      await chai
        .request(ezunpaywallURL)
        .post(`/enrich/json/${id}`)
        .query({ args: '{ is_oa }' })
        .send(file)
        .set('Content-Type', 'application/x-ndjson')
        .set('api_key', 'user');

      // get the state of process
      let res2;
      while (!res2?.body?.state?.done) {
        res2 = await chai
          .request(ezunpaywallURL)
          .get(`/enrich/state/${id}.json`);
        expect(res2).have.status(200);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const { state } = res2?.body;

      expect(state).have.property('done').equal(true);
      expect(state).have.property('loaded').to.not.equal(undefined);
      expect(state).have.property('linesRead').equal(3);
      expect(state).have.property('enrichedLines').equal(3);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('error').equal(false);

      // get the enriched file
      const res3 = await chai
        .request(ezunpaywallURL)
        .get(`/enrich/${id}.jsonl`)
        .buffer()
        .parse(binaryParser);

      try {
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.jsonl'), res3.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file3.jsonl');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with args { best_oa_location { license } } and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.jsonl'), 'utf8');

      const id = uuid.v4();
      // start enrich process, return id of process
      await chai
        .request(ezunpaywallURL)
        .post(`/enrich/json/${id}`)
        .query({ args: '{ best_oa_location { license } }' })
        .send(file)
        .set('Content-Type', 'application/x-ndjson')
        .set('api_key', 'user');

      // get the state of process
      let res2;
      while (!res2?.body?.state?.done) {
        res2 = await chai
          .request(ezunpaywallURL)
          .get(`/enrich/state/${id}.json`);
        expect(res2).have.status(200);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const { state } = res2?.body;

      expect(state).have.property('done').equal(true);
      expect(state).have.property('loaded').to.not.equal(undefined);
      expect(state).have.property('linesRead').equal(3);
      expect(state).have.property('enrichedLines').equal(3);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('error').equal(false);

      // get the enriched file
      const res3 = await chai
        .request(ezunpaywallURL)
        .get(`/enrich/${id}.jsonl`)
        .buffer()
        .parse(binaryParser);

      try {
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.jsonl'), res3.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file4.jsonl');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with args { z_authors { family } } and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.jsonl'), 'utf8');
      const id = uuid.v4();

      await chai
        .request(ezunpaywallURL)
        .post(`/enrich/json/${id}`)
        .query({ args: '{ z_authors { family } }' })
        .send(file)
        .set('Content-Type', 'application/x-ndjson')
        .set('api_key', 'user');

      // get the state of process
      let res2;
      while (!res2?.body?.state?.done) {
        res2 = await chai
          .request(ezunpaywallURL)
          .get(`/enrich/state/${id}.json`);
        expect(res2).have.status(200);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const { state } = res2?.body;

      expect(state).have.property('done').equal(true);
      expect(state).have.property('loaded').to.not.equal(undefined);
      expect(state).have.property('linesRead').equal(3);
      expect(state).have.property('enrichedLines').equal(3);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('error').equal(false);

      // get the enriched file
      const res3 = await chai
        .request(ezunpaywallURL)
        .get(`/enrich/${id}.jsonl`)
        .buffer()
        .parse(binaryParser);

      try {
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.jsonl'), res3.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file5.jsonl');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with args { is_oa, best_oa_location { license }, z_authors{ family } } and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.jsonl'), 'utf8');
      const id = uuid.v4();

      await chai
        .request(ezunpaywallURL)
        .post(`/enrich/json/${id}`)
        .query({ args: '{ is_oa, best_oa_location { license }, z_authors{ family } }' })
        .send(file)
        .set('Content-Type', 'application/x-ndjson')
        .set('api_key', 'user');

      // get the state of process
      let res2;
      while (!res2?.body?.state?.done) {
        res2 = await chai
          .request(ezunpaywallURL)
          .get(`/enrich/state/${id}.json`);
        expect(res2).have.status(200);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const { state } = res2?.body;

      expect(state).have.property('done').equal(true);
      expect(state).have.property('loaded').to.not.equal(undefined);
      expect(state).have.property('linesRead').equal(3);
      expect(state).have.property('enrichedLines').equal(3);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('error').equal(false);

      // get the enriched file
      const res3 = await chai
        .request(ezunpaywallURL)
        .get(`/enrich/${id}.jsonl`)
        .buffer()
        .parse(binaryParser);

      try {
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.jsonl'), res3.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file6.jsonl');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });
  });

  describe('Don\'t do a enrichment of a json file because the arguments doesn\'t exist on ezunpaywall index', () => {
    it('Should return a error message', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.jsonl'), 'utf8');
      const id = uuid.v4();
      const res = await chai

        .request(ezunpaywallURL)
        .post(`/enrich/json/${id}`)
        .query({ args: '{ coin }' })
        .send(file)
        .set('Content-Type', 'application/x-ndjson')
        .set('api_key', 'user');

      // TODO status code not wrong (401)
      expect(res).have.status(500);
      // expect(JSON.parse(res1.body).message).be.equal('args incorrect');
    });
  });

  describe('Don\'t do a enrichment of a jsonl file because wrong api_key', () => {
    it('Should return a error message', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.jsonl'), 'utf8');

      const id = uuid.v4();
      const res = await chai
        .request(ezunpaywallURL)
        .post(`/enrich/json/${id}`)
        .query({ args: '{ is_oa }' })
        .send(file)
        .set('Content-Type', 'application/x-ndjson');

      expect(res).have.status(401);
      expect(res?.body).have.property('message').eq('Not authorized');
    });

    it('Should return a error message', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.jsonl'), 'utf8');

      const id = uuid.v4();
      const res = await chai
        .request(ezunpaywallURL)
        .post(`/enrich/json/${id}`)
        .query({ args: '{ is_oa }' })
        .send(file)
        .set('Content-Type', 'application/x-ndjson')
        .set('api_key', 'wrong apikey');

      expect(res).have.status(401);
      expect(res?.body).have.property('message').eq('Not authorized');
    });
  });

  after(async () => {
    await resetAll();
  });
});
