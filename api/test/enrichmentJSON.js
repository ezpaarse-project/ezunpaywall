/* eslint-disable no-await-in-loop */
const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs-extra');
const path = require('path');

chai.use(chaiHttp);

const { logger } = require('../lib/logger');

const indexUnpawall = require('../index/unpaywall.json');

const {
  downloadFile,
  deleteFile,
  binaryParser,
  compareFile,
  ping,
} = require('./utils/prepareTest');

const {
  createIndex,
  isInUpdate,
  deleteIndex,
} = require('./utils/update');

const { getState } = require('./utils/enrich');

const ezunpaywallURL = process.env.EZUNPAYWALL_URL;

const enrichDir = path.resolve(__dirname, 'sources');

describe('Test: enrichment with a json file (command ezu)', () => {
  before(async () => {
    await ping();
    await downloadFile('fake1.jsonl.gz');
    await createIndex('unpaywall', indexUnpawall);

    // test insertion
    await chai.request(ezunpaywallURL)
      .post('/update/fake1.jsonl.gz')
      .set('Access-Control-Allow-Origin', '*')
      .set('Content-Type', 'application/json');

    let inUpdate = true;
    while (inUpdate) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      inUpdate = await isInUpdate();
    }
  });

  describe('Do a enrichment of a json file with all unpaywall attributes', () => {
    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.jsonl'), 'utf8');

      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/json')
        .send(file)
        .set('Content-Type', 'application/x-ndjson')
        .buffer()
        .parse(binaryParser);

      expect(res1).have.status(200);
      const filename = JSON.parse(res1.body.toString()).file;

      const res2 = await chai
        .request(ezunpaywallURL)
        .get(`/enrich/${filename}`)
        .buffer()
        .parse(binaryParser);

      expect(res2).have.status(200);

      try {
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.jsonl'), res2.body.toString());
      } catch (err) {
        logger.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file1.jsonl');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);

      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('loaded').to.not.equal(undefined);
      expect(state).have.property('linesRead').equal(3);
      expect(state).have.property('enrichedLines').equal(3);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('error').equal(false);
    });

    it('Should enrich the file on 2 lines with all unpaywall attributes and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file2.jsonl'));

      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/json')
        .send(file)
        .set('Content-Type', 'application/x-ndjson')
        .buffer()
        .parse(binaryParser);

      expect(res1).have.status(200);

      const filename = JSON.parse(res1.body.toString()).file;

      const res2 = await chai
        .request(ezunpaywallURL)
        .get(`/enrich/${filename}`)
        .buffer()
        .parse(binaryParser);

      expect(res2).have.status(200);

      try {
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.jsonl'), res2.body.toString());
      } catch (err) {
        logger.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file2.jsonl');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);

      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('loaded').to.not.equal(undefined);
      expect(state).have.property('linesRead').equal(3);
      expect(state).have.property('enrichedLines').equal(2);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('error').equal(false);
    });
  });

  describe('Do a enrichment of a file already installed and enrich a json file with some unpaywall attributes (is_oa, best_oa_location.license, z_authors.family)', () => {
    it('Should enrich the file on 3 lines with is_oa attributes and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.jsonl'), 'utf8');

      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/json')
        .query({ args: '{ is_oa }' })
        .send(file)
        .set('Content-Type', 'application/x-ndjson')
        .buffer()
        .parse(binaryParser);

      expect(res1).have.status(200);

      const filename = JSON.parse(res1.body.toString()).file;

      const res2 = await chai
        .request(ezunpaywallURL)
        .get(`/enrich/${filename}`)
        .buffer()
        .parse(binaryParser);

      expect(res2).have.status(200);

      try {
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.jsonl'), res2.body.toString());
      } catch (err) {
        logger.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file3.jsonl');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);

      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('loaded').to.not.equal(undefined);
      expect(state).have.property('linesRead').equal(3);
      expect(state).have.property('enrichedLines').equal(3);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('error').equal(false);
    });

    it('Should enrich the file on 3 lines with args { best_oa_location { license } } and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.jsonl'), 'utf8');

      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/json')
        .query({ args: '{ best_oa_location { license } }' })
        .send(file)
        .set('Content-Type', 'application/x-ndjson')
        .buffer()
        .parse(binaryParser);

      expect(res1).have.status(200);

      const filename = JSON.parse(res1.body.toString()).file;

      const res2 = await chai
        .request(ezunpaywallURL)
        .get(`/enrich/${filename}`)
        .buffer()
        .parse(binaryParser);

      expect(res2).have.status(200);

      try {
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.jsonl'), res2.body.toString());
      } catch (err) {
        logger.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file4.jsonl');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);

      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('loaded').to.not.equal(undefined);
      expect(state).have.property('linesRead').equal(3);
      expect(state).have.property('enrichedLines').equal(3);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('error').equal(false);
    });

    it('Should enrich the file on 3 lines with args { z_authors { family } } and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.jsonl'), 'utf8');

      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/json')
        .query({ args: '{ z_authors { family } }' })
        .send(file)
        .set('Content-Type', 'application/x-ndjson')
        .buffer()
        .parse(binaryParser);

      expect(res1).have.status(200);

      const filename = JSON.parse(res1.body.toString()).file;

      const res2 = await chai
        .request(ezunpaywallURL)
        .get(`/enrich/${filename}`)
        .buffer()
        .parse(binaryParser);

      expect(res2).have.status(200);

      try {
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.jsonl'), res2.body.toString());
      } catch (err) {
        logger.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file5.jsonl');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);

      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('loaded').to.not.equal(undefined);
      expect(state).have.property('linesRead').equal(3);
      expect(state).have.property('enrichedLines').equal(3);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('error').equal(false);
    });

    it('Should enrich the file on 3 lines with args { is_oa, best_oa_location { license }, z_authors{ family } } and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.jsonl'), 'utf8');

      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/json')
        .query({ args: '{ is_oa, best_oa_location { license }, z_authors{ family } }' })
        .send(file)
        .set('Content-Type', 'application/x-ndjson')
        .buffer()
        .parse(binaryParser);

      expect(res1).have.status(200);

      const filename = JSON.parse(res1.body.toString()).file;

      const res2 = await chai
        .request(ezunpaywallURL)
        .get(`/enrich/${filename}`)
        .buffer()
        .parse(binaryParser);

      expect(res2).have.status(200);

      try {
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.jsonl'), res2.body.toString());
      } catch (err) {
        logger.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file6.jsonl');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);

      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('loaded').to.not.equal(undefined);
      expect(state).have.property('linesRead').equal(3);
      expect(state).have.property('enrichedLines').equal(3);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('error').equal(false);
    });
  });

  describe('Don\'t do a enrichment of a json file because the arguments doesn\'t exist on ezunpaywall index', () => {
    it('Should return a error message', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.jsonl'), 'utf8');

      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/json')
        .query({ args: '{ coin }' })
        .send(file)
        .set('Content-Type', 'application/x-ndjson')
        .set('Content-Type', 'application/json')
        .buffer()
        .parse(binaryParser);
      // TODO status code not wrong (401)
      expect(res1).have.status(500);
      // expect(JSON.parse(res1.body).message).be.equal('args incorrect');
    });
  });

  after(async () => {
    await deleteIndex('unpaywall');
    await deleteIndex('task');
    await deleteFile('fake1.jsonl.gz');
  });
});
