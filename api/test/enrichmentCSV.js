/* eslint-disable no-await-in-loop */
const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs-extra');
const path = require('path');
const uuid = require('uuid');

chai.use(chaiHttp);

const { logger } = require('../lib/logger');

const indexUnpawall = require('../index/unpaywall.json');

const {
  binaryParser,
  compareFile,
} = require('./utils/file');

const {
  createIndex,
  checkIfInUpdate,
  deleteIndex,
  countDocuments,
  addSnapshot,
  deleteSnapshot,
  resetAll,
} = require('./utils/update');

const {
  ping,
} = require('./utils/ping');

const ezunpaywallURL = process.env.EZUNPAYWALL_URL;

const enrichDir = path.resolve(__dirname, 'sources');

describe('Test: enrichment with a csv file (command ezu)', () => {
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

  describe('Do a enrichment of a csv file with all unpaywall attributes', () => {
    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');
      const id = uuid.v4();
      // start enrich process
      await chai
        .request(ezunpaywallURL)
        .post(`/enrich/csv/${id}`)
        .send(file)
        .set('Content-Type', 'text/csv')
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
        .get(`/enrich/${id}.csv`)
        .buffer()
        .parse(binaryParser);

      try {
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.csv'), res3.body.toString());
      } catch (err) {
        logger.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file1.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 2 lines with all unpaywall attributes and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file2.csv'), 'utf8');
      const id = uuid.v4();

      // start enrich process
      await chai
        .request(ezunpaywallURL)
        .post(`/enrich/csv/${id}`)
        .send(file)
        .set('Content-Type', 'text/csv')
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
        .get(`/enrich/${id}.csv`)
        .buffer()
        .parse(binaryParser)
        .set('api_key', 'user');

      try {
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.csv'), res3.body.toString());
      } catch (err) {
        logger.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file2.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });
  });

  describe('Do a enrichment of a csv file with some unpaywall attributes (is_oa, best_oa_location.license, z_authors.family)', () => {
    it('Should enrich the file on 3 lines with args {is_oa} and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');
      const id = uuid.v4();
      // start enrich process
      await chai
        .request(ezunpaywallURL)
        .post(`/enrich/csv/${id}`)
        .query({ args: '{ is_oa }' })
        .send(file)
        .set('Content-Type', 'text/csv')
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
        .get(`/enrich/${id}.csv`)
        .buffer()
        .parse(binaryParser);

      try {
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.csv'), res3.body.toString());
      } catch (err) {
        logger.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file3.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with args { best_oa_location { license } } and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');
      const id = uuid.v4();
      // start enrich process, return id of process
      await chai
        .request(ezunpaywallURL)
        .post(`/enrich/csv/${id}`)
        .query({ args: '{ best_oa_location { license } }' })
        .send(file)
        .set('Content-Type', 'text/csv')
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
        .get(`/enrich/${id}.csv`)
        .buffer()
        .parse(binaryParser);

      try {
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.csv'), res3.body.toString());
      } catch (err) {
        logger.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file4.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with args { z_authors { given } } and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');
      const id = uuid.v4();

      await chai
        .request(ezunpaywallURL)
        .post(`/enrich/csv/${id}`)
        .query({ args: '{ z_authors { given } }' })
        .send(file)
        .set('Content-Type', 'text/csv')
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
        .get(`/enrich/${id}.csv`)
        .buffer()
        .parse(binaryParser);

      try {
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.csv'), res3.body.toString());
      } catch (err) {
        logger.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file5.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with args { is_oa, best_oa_location { license }, z_authors{ family } } and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');

      const id = uuid.v4();
      await chai
        .request(ezunpaywallURL)
        .post(`/enrich/csv/${id}`)
        .query({ args: '{ is_oa, best_oa_location { license }, z_authors{ family } }' })
        .send(file)
        .set('Content-Type', 'text/csv')
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
        .get(`/enrich/${id}.csv`)
        .buffer()
        .parse(binaryParser);

      try {
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.csv'), res3.body.toString());
      } catch (err) {
        logger.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file6.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });
  });

  describe('Do a enrichment of a csv file with all unpaywall attributes and with semi colomn separator', () => {
    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');

      const id = uuid.v4();
      await chai
        .request(ezunpaywallURL)
        .post(`/enrich/csv/${id}`)
        .query({ separator: ';' })
        .send(file)
        .set('Content-Type', 'text/csv')
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
        .get(`/enrich/${id}.csv`)
        .buffer()
        .parse(binaryParser);

      try {
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.csv'), res3.body.toString());
      } catch (err) {
        logger.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file7.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });
  });

  describe('Don\'t do a enrichment of a csv file because the arguments doesn\'t exist on ezunpaywall index', () => {
    it('Should return a error message', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');

      const id = uuid.v4();
      const res = await chai
        .request(ezunpaywallURL)
        .post(`/enrich/csv/${id}`)
        .query({ args: '{ coin }' })
        .send(file)
        .set('Content-Type', 'text/csv')
        .set('api_key', 'user');

      // TODO mettre une erreur 401
      expect(res).have.status(500);
      // expect(JSON.parse(res.body).message).be.equal('args incorrect');
    });
  });

  describe('Don\'t do a enrichment of a csv file because wrong api_key', () => {
    it('Should return a error message', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');

      const id = uuid.v4();
      const res = await chai
        .request(ezunpaywallURL)
        .post(`/enrich/csv/${id}`)
        .query({ args: '{ is_oa }' })
        .send(file)
        .set('Content-Type', 'text/csv');

      expect(res).have.status(401);
      expect(res?.body).have.property('message').eq('Not authorized');
    });

    it('Should return a error message', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');

      const id = uuid.v4();
      const res = await chai
        .request(ezunpaywallURL)
        .post(`/enrich/csv/${id}`)
        .query({ args: '{ is_oa }' })
        .send(file)
        .set('Content-Type', 'text/csv')
        .set('api_key', 'wrong apikey');

      expect(res).have.status(401);
      expect(res?.body).have.property('message').eq('Not authorized');
    });
  });

  after(async () => {
    await deleteIndex('unpaywall');
    await deleteSnapshot('fake1.csv.gz');
    await deleteSnapshot('fake2.csv.gz');
    await deleteSnapshot('fake3.csv.gz');
  });
});
