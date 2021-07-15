/* eslint-disable no-await-in-loop */
const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs-extra');
const path = require('path');
const uuid = require('uuid');

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

describe('Test: enrichment with a csv file (command ezu)', () => {
  before(async () => {
    await ping();
    await deleteIndex('unpaywall-test');
    await createIndex('unpaywall-test', mappingUnpaywall);
    await insertDataUnpaywall();
    const ndData = await countDocuments('unpaywall-test');
    expect(ndData).eq(50);
  });

  describe('Do a enrichment of a csv file with all unpaywall attributes', () => {
    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');
      const id = uuid.v4();

      // start enrich process
      const res1 = await chai
        .request(enrichService)
        .post(`/csv/${id}`)
        .query({ index: 'unpaywall-test' })
        .send(file)
        .set('Content-Type', 'text/csv')
        .set('X-API-KEY', 'user');

      expect(res1).have.status(200);

      // get the state of process
      let res2;

      do {
        res2 = await chai
          .request(enrichService)
          .get(`/state/${id}.json`);
        expect(res2).have.status(200);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!res2?.body?.state?.done);

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
        .request(enrichService)
        .get(`/enriched/${id}.csv`)
        .buffer()
        .parse(binaryParser);

      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');
      try {
        await fs.writeFile(fileEnriched, res3.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file1.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 2 lines with all unpaywall attributes and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file2.csv'), 'utf8');
      const id = uuid.v4();

      // start enrich process
      const res1 = await chai
        .request(enrichService)
        .post(`/csv/${id}`)
        .query({ index: 'unpaywall-test' })
        .send(file)
        .set('Content-Type', 'text/csv')
        .set('X-API-KEY', 'user');

      expect(res1).have.status(200);

      // get the state of process
      let res2;

      do {
        res2 = await chai
          .request(enrichService)
          .get(`/state/${id}.json`);
        expect(res2).have.status(200);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!res2?.body?.state?.done);

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
        .request(enrichService)
        .get(`/enriched/${id}.csv`)
        .buffer()
        .parse(binaryParser)
        .set('X-API-KEY', 'user');

      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');
      try {
        await fs.writeFile(fileEnriched, res3.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file2.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });
  });

  describe('Do a enrichment of a csv file with some unpaywall attributes (is_oa, best_oa_location.license, z_authors.family)', () => {
    it('Should enrich the file on 3 lines with args {is_oa} and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');
      const id = uuid.v4();

      // start enrich process
      const res1 = await chai
        .request(enrichService)
        .post(`/csv/${id}`)
        .query({ index: 'unpaywall-test' })
        .query({ args: '{ is_oa }' })
        .send(file)
        .set('Content-Type', 'text/csv')
        .set('X-API-KEY', 'user');

      expect(res1).have.status(200);

      // get the state of process
      let res2;

      do {
        res2 = await chai
          .request(enrichService)
          .get(`/state/${id}.json`);
        expect(res2).have.status(200);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!res2?.body?.state?.done);

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
        .request(enrichService)
        .get(`/enriched/${id}.csv`)
        .buffer()
        .parse(binaryParser);

      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');
      try {
        await fs.writeFile(fileEnriched, res3.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file3.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with args { best_oa_location { license } } and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');
      const id = uuid.v4();
      // start enrich process, return id of process
      const res1 = await chai
        .request(enrichService)
        .post(`/csv/${id}`)
        .query({ index: 'unpaywall-test' })
        .query({ args: '{ best_oa_location { license } }' })
        .send(file)
        .set('Content-Type', 'text/csv')
        .set('X-API-KEY', 'user');

      expect(res1).have.status(200);

      // get the state of process
      let res2;

      do {
        res2 = await chai
          .request(enrichService)
          .get(`/state/${id}.json`);
        expect(res2).have.status(200);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!res2?.body?.state?.done);

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
        .request(enrichService)
        .get(`/enriched/${id}.csv`)
        .buffer()
        .parse(binaryParser);

      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');
      try {
        await fs.writeFile(fileEnriched, res3.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file4.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with args { z_authors { given } } and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');
      const id = uuid.v4();

      const res1 = await chai
        .request(enrichService)
        .post(`/csv/${id}`)
        .query({ index: 'unpaywall-test' })
        .query({ args: '{ z_authors { given } }' })
        .send(file)
        .set('Content-Type', 'text/csv')
        .set('X-API-KEY', 'user');

      expect(res1).have.status(200);

      // get the state of process
      let res2;

      do {
        res2 = await chai
          .request(enrichService)
          .get(`/state/${id}.json`);
        expect(res2).have.status(200);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!res2?.body?.state?.done);

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
        .request(enrichService)
        .get(`/enriched/${id}.csv`)
        .buffer()
        .parse(binaryParser);

      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');
      try {
        await fs.writeFile(fileEnriched, res3.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file5.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with args { is_oa, best_oa_location { license }, z_authors{ family } } and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');

      const id = uuid.v4();
      const res1 = await chai
        .request(enrichService)
        .post(`/csv/${id}`)
        .query({ index: 'unpaywall-test' })
        .query({ args: '{ is_oa, best_oa_location { license }, z_authors{ family } }' })
        .send(file)
        .set('Content-Type', 'text/csv')
        .set('X-API-KEY', 'user');

      expect(res1).have.status(200);

      // get the state of process
      let res2;

      do {
        res2 = await chai
          .request(enrichService)
          .get(`/state/${id}.json`);
        expect(res2).have.status(200);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!res2?.body?.state?.done);

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
        .request(enrichService)
        .get(`/enriched/${id}.csv`)
        .buffer()
        .parse(binaryParser);

      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');
      try {
        await fs.writeFile(fileEnriched, res3.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file6.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });
  });

  describe('Do a enrichment of a csv file with all unpaywall attributes and with semi colomn separator', () => {
    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');
      const id = uuid.v4();

      const res1 = await chai
        .request(enrichService)
        .post(`/csv/${id}`)
        .query({ index: 'unpaywall-test' })
        .query({ separator: ';' })
        .send(file)
        .set('Content-Type', 'text/csv')
        .set('X-API-KEY', 'user');

      expect(res1).have.status(200);

      // get the state of process
      let res2;

      do {
        res2 = await chai
          .request(enrichService)
          .get(`/state/${id}.json`);
        expect(res2).have.status(200);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!res2?.body?.state?.done);

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
        .request(enrichService)
        .get(`/enriched/${id}.csv`)
        .buffer()
        .parse(binaryParser);

      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');
      try {
        await fs.writeFile(fileEnriched, res3.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file7.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });
  });

  describe('Don\'t do a enrichment of a csv file because the arguments doesn\'t exist on ezunpaywall index', () => {
    it('Should return a error message', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');
      const id = uuid.v4();

      const res = await chai
        .request(enrichService)
        .post(`/csv/${id}`)
        .query({ index: 'unpaywall-test' })
        .query({ args: '{ coin }' })
        .send(file)
        .set('Content-Type', 'text/csv')
        .set('X-API-KEY', 'user');

      // TODO mettre une erreur 401
      expect(res).have.status(500);
      // expect(JSON.parse(res.body).message).be.equal('args incorrect');
    });
  });

  describe('Don\'t do a enrichment of a csv file because wrong X-API-KEY', () => {
    it('Should return a error message', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');
      const id = uuid.v4();

      const res = await chai
        .request(enrichService)
        .post(`/csv/${id}`)
        .query({ index: 'unpaywall-test' })
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
        .request(enrichService)
        .post(`/csv/${id}`)
        .query({ index: 'unpaywall-test' })
        .query({ args: '{ is_oa }' })
        .send(file)
        .set('Content-Type', 'text/csv')
        .set('X-API-KEY', 'wrong apikey');

      expect(res).have.status(401);
      expect(res?.body).have.property('message').eq('Not authorized');
    });
  });

  after(async () => {
    await deleteIndex('unpaywall-test');
  });
});
