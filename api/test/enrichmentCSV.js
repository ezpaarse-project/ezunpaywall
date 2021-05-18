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
  deleteFile,
  binaryParser,
  compareFile,
  ping,
} = require('./utils/prepareTest');

const {
  createIndex,
  isInUpdate,
  deleteIndex,
  countDocuments,
} = require('./utils/update');

const { getState } = require('./utils/enrich');

const ezunpaywallURL = process.env.EZUNPAYWALL_URL;

const enrichDir = path.resolve(__dirname, 'sources');

describe('Test: enrichment with a csv file (command ezu)', () => {
  before(async () => {
    await ping();
  });

  describe('Do a classic weekly update', () => {
    before(async () => {
      await createIndex('unpaywall', indexUnpawall);
    });

    // test response
    it('Should return the process start', async () => {
      const res = await chai.request(ezunpaywallURL)
        .post('/update')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');

      expect(res).have.status(200);
      expect(res.body.message).be.equal('weekly update has begun, list of task has been created on elastic');
    });

    // test insertion
    it('Should insert 50 data', async () => {
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        isUpdate = await isInUpdate();
      }
      const count = await countDocuments();
      expect(count).to.equal(50);
    });
  });

  describe('Do a enrichment of a csv file with all unpaywall attributes', () => {
    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');

      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/csv')
        .send(file)
        .set('Content-Type', 'text/csv')
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
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.csv'), res2.body.toString());
      } catch (err) {
        logger.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file1.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

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
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file2.csv'), 'utf8');
      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/csv')
        .send(file)
        .set('Content-Type', 'text/csv')
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
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.csv'), res2.body.toString());
      } catch (err) {
        logger.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file2.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

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

  describe('Do a enrichment of a csv file with some unpaywall attributes (is_oa, best_oa_location.license, z_authors.family)', () => {
    it('Should enrich the file on 3 lines with args {is_oa} and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');

      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/csv')
        .query({ args: '{ is_oa }' })
        .send(file)
        .set('Content-Type', 'text/csv')
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
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.csv'), res2.body.toString());
      } catch (err) {
        logger.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file3.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

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
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');

      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/csv')

        .query({ args: '{ best_oa_location { license } }' })
        .send(file)
        .set('Content-Type', 'text/csv')
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
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.csv'), res2.body.toString());
      } catch (err) {
        logger.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file4.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

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

    it('Should enrich the file on 3 lines with args { z_authors { given } } and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');

      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/csv')
        .query({ args: '{ z_authors { given } }' })
        .send(file)
        .set('Content-Type', 'text/csv')
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
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.csv'), res2.body.toString());
      } catch (err) {
        logger.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file5.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

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
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');

      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/csv')
        .query({ args: '{ is_oa, best_oa_location { license }, z_authors{ family } }' })
        .send(file)
        .set('Content-Type', 'text/csv')
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
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.csv'), res2.body.toString());
      } catch (err) {
        logger.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file6.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

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

  describe('Do a enrichment of a csv file with all unpaywall attributes and with semi colomn separator', () => {
    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');
      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/csv')
        .query({ separator: ';' })
        .send(file)
        .set('Content-Type', 'text/csv')
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
        await fs.writeFile(path.resolve(enrichDir, 'enriched', 'enriched.csv'), res2.body.toString());
      } catch (err) {
        logger.error(`writeFile: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file7.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

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

  describe('Don\'t do a enrichment of a csv file because the arguments doesn\'t exist on ezunpaywall index', () => {
    it('Should return a error message', async () => {
      const file = await fs.readFile(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');

      const res = await chai
        .request(ezunpaywallURL)
        .post('/enrich/csv')
        .query({ args: '{ coin }' })
        .send(file)
        .set('Content-Type', 'text/csv')
        .set('Content-Type', 'application/json')
        .buffer()
        .parse(binaryParser);

      // TODO mettre une erreur 401
      expect(res).have.status(500);
      // expect(JSON.parse(res.body).message).be.equal('args incorrect');
    });
  });

  after(async () => {
    await deleteIndex('unpaywall');
    await deleteFile('fake1.csv.gz');
    await deleteFile('fake2.csv.gz');
    await deleteFile('fake3.csv.gz');
  });
});
