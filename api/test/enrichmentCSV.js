/* eslint-disable no-await-in-loop */
const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs-extra');
const path = require('path');
const { Readable } = require('stream');

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
  getState,
  getReport,
} = require('./utils/update');

const { getStateOfEnrich } = require('./utils/enrich');

const ezunpaywallURL = 'http://localhost:8080';

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

    // test task
    it('Should get task with all informations from the weekly update', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').be.equal('askUnpaywall');
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').be.equal('success');

      expect(state.steps[1]).have.property('task').be.equal('download');
      expect(state.steps[1]).have.property('file').be.equal('fake1.jsonl.gz');
      expect(state.steps[1]).have.property('percent').be.equal(100);
      expect(state.steps[1]).have.property('took').to.not.equal(undefined);
      expect(state.steps[1]).have.property('status').be.equal('success');

      expect(state.steps[2]).have.property('task').be.equal('insert');
      expect(state.steps[2]).have.property('file').be.equal('fake1.jsonl.gz');
      expect(state.steps[2]).have.property('percent').be.equal(100);
      expect(state.steps[2]).have.property('linesRead').be.equal(50);
      expect(state.steps[2]).have.property('took').to.not.equal(undefined);
      expect(state.steps[2]).have.property('status').be.equal('success');

      expect(state.done).be.equal(true);
    });

    // test report
    it('Should get report with all informations from the weekly update', async () => {
      const report = await getReport();

      expect(report).have.property('done');
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').be.equal('askUnpaywall');
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').be.equal('success');

      expect(report.steps[1]).have.property('task').be.equal('download');
      expect(report.steps[1]).have.property('file').be.equal('fake1.jsonl.gz');
      expect(report.steps[1]).have.property('percent').be.equal(100);
      expect(report.steps[1]).have.property('took').to.not.equal(undefined);
      expect(report.steps[1]).have.property('status').be.equal('success');

      expect(report.steps[2]).have.property('task').be.equal('insert');
      expect(report.steps[2]).have.property('file').be.equal('fake1.jsonl.gz');
      expect(report.steps[2]).have.property('percent').be.equal(100);
      expect(report.steps[2]).have.property('linesRead').be.equal(50);
      expect(report.steps[2]).have.property('took').to.not.equal(undefined);
      expect(report.steps[2]).have.property('status').be.equal('success');
    });
  });

  describe('Do a enrichment of a csv file with all unpaywall attributes', () => {
    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      const file = fs.readFileSync(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');

      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/state')
        .set('responseType', 'json');

      const stateName = res1.body.state;

      const res2 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/csv')
        .query({ state: stateName })
        .send(file)
        .set('Content-Type', 'text/csv')
        .buffer()
        .parse(binaryParser);

      expect(res2).have.status(200);

      const filename = JSON.parse(res2.body.toString()).file;

      const res3 = await chai
        .request(ezunpaywallURL)
        .get(`/enrich/${filename}`)
        .buffer()
        .parse(binaryParser);

      expect(res3).have.status(200);

      try {
        const writer = fs.createWriteStream(path.resolve(enrichDir, 'enriched', 'enriched.csv'));
        Readable.from(res3.body.toString()).pipe(writer);
      } catch (err) {
        logger.error(`createWriteStream: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file1.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);

      const state = await getStateOfEnrich(stateName);

      expect(state).have.property('loaded');
      expect(state).have.property('linesRead').equal(3);
      expect(state).have.property('enrichedLines').equal(3);
      expect(state).have.property('startDate');
      expect(state).have.property('endDate');
      expect(state).have.property('status').equal('done');
    });

    it('Should enrich the file on 2 lines with all unpaywall attributes and download it', async () => {
      const file = fs.readFileSync(path.resolve(enrichDir, 'mustBeEnrich', 'file2.csv'), 'utf8');

      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/state')
        .set('responseType', 'json');

      const stateName = res1.body.state;

      const res2 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/csv')
        .query({ state: stateName })
        .send(file)
        .set('Content-Type', 'text/csv')
        .buffer()
        .parse(binaryParser);

      expect(res2).have.status(200);

      const filename = JSON.parse(res2.body.toString()).file;

      const res3 = await chai
        .request(ezunpaywallURL)
        .get(`/enrich/${filename}`)
        .buffer()
        .parse(binaryParser);

      expect(res3).have.status(200);

      try {
        const writer = fs.createWriteStream(path.resolve(enrichDir, 'enriched', 'enriched.csv'));
        Readable.from(res3.body.toString()).pipe(writer);
      } catch (err) {
        logger.error(`createWriteStream: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file2.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);

      const state = await getStateOfEnrich(stateName);

      expect(state).have.property('loaded');
      expect(state).have.property('linesRead').equal(3);
      expect(state).have.property('enrichedLines').equal(2);
      expect(state).have.property('startDate');
      expect(state).have.property('endDate');
      expect(state).have.property('status').equal('done');
    });
  });

  describe('Do a enrichment of a csv file with some unpaywall attributes (is_oa, best_oa_location.license, z_authors.family)', () => {
    it('Should enrich the file on 3 lines with is_oa attributes and download it', async () => {
      const file = fs.readFileSync(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');

      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/state')
        .set('responseType', 'json');

      const stateName = res1.body.state;

      const res2 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/csv')
        .query({ state: stateName })
        .query({ args: 'is_oa' })
        .send(file)
        .set('Content-Type', 'text/csv')
        .buffer()
        .parse(binaryParser);

      expect(res2).have.status(200);

      const filename = JSON.parse(res2.body.toString()).file;

      const res3 = await chai
        .request(ezunpaywallURL)
        .get(`/enrich/${filename}`)
        .buffer()
        .parse(binaryParser);

      expect(res3).have.status(200);

      try {
        const writer = fs.createWriteStream(path.resolve(enrichDir, 'enriched', 'enriched.csv'));
        Readable.from(res3.body.toString()).pipe(writer);
      } catch (err) {
        logger.error(`createWriteStream: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file3.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);

      const state = await getStateOfEnrich(stateName);

      expect(state).have.property('loaded');
      expect(state).have.property('linesRead').equal(3);
      expect(state).have.property('enrichedLines').equal(3);
      expect(state).have.property('startDate');
      expect(state).have.property('endDate');
      expect(state).have.property('status').equal('done');
    });

    it('Should enrich the file on 3 lines with best_oa_location.license attributes and download it', async () => {
      const file = fs.readFileSync(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');

      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/state')
        .set('responseType', 'json');

      const stateName = res1.body.state;

      const res2 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/csv')
        .query({ state: stateName })
        .query({ args: 'best_oa_location.license' })
        .send(file)
        .set('Content-Type', 'text/csv')
        .buffer()
        .parse(binaryParser);

      expect(res2).have.status(200);

      const filename = JSON.parse(res2.body.toString()).file;

      const res3 = await chai
        .request(ezunpaywallURL)
        .get(`/enrich/${filename}`)
        .buffer()
        .parse(binaryParser);

      expect(res3).have.status(200);

      try {
        const writer = fs.createWriteStream(path.resolve(enrichDir, 'enriched', 'enriched.csv'));
        Readable.from(res3.body.toString()).pipe(writer);
      } catch (err) {
        logger.error(`createWriteStream: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file4.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);

      const state = await getStateOfEnrich(stateName);

      expect(state).have.property('loaded');
      expect(state).have.property('linesRead').equal(3);
      expect(state).have.property('enrichedLines').equal(3);
      expect(state).have.property('startDate');
      expect(state).have.property('endDate');
      expect(state).have.property('status').equal('done');
    });

    it('Should enrich the file on 3 lines with z_authors.family attributes and download it', async () => {
      const file = fs.readFileSync(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');

      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/state')
        .set('responseType', 'json');

      const stateName = res1.body.state;

      const res2 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/csv')
        .query({ state: stateName })
        .query({ args: 'z_authors.family' })
        .send(file)
        .set('Content-Type', 'text/csv')
        .buffer()
        .parse(binaryParser);

      expect(res2).have.status(200);

      const filename = JSON.parse(res2.body.toString()).file;

      const res3 = await chai
        .request(ezunpaywallURL)
        .get(`/enrich/${filename}`)
        .buffer()
        .parse(binaryParser);

      expect(res3).have.status(200);

      try {
        const writer = fs.createWriteStream(path.resolve(enrichDir, 'enriched', 'enriched.csv'));
        Readable.from(res3.body.toString()).pipe(writer);
      } catch (err) {
        logger.error(`createWriteStream: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file5.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);

      const state = await getStateOfEnrich(stateName);

      expect(state).have.property('loaded');
      expect(state).have.property('linesRead').equal(3);
      expect(state).have.property('enrichedLines').equal(3);
      expect(state).have.property('startDate');
      expect(state).have.property('endDate');
      expect(state).have.property('status').equal('done');
    });

    it('Should enrich the file on 3 lines with is_oa, best_oa_location.license, z_authors.family attributes and download it', async () => {
      const file = fs.readFileSync(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');

      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/state')
        .set('responseType', 'json');

      const stateName = res1.body.state;

      const res2 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/csv')
        .query({ state: stateName })
        .query({ args: 'is_oa,best_oa_location.license,z_authors.family' })
        .send(file)
        .set('Content-Type', 'text/csv')
        .buffer()
        .parse(binaryParser);

      expect(res2).have.status(200);

      const filename = JSON.parse(res2.body.toString()).file;

      const res3 = await chai
        .request(ezunpaywallURL)
        .get(`/enrich/${filename}`)
        .buffer()
        .parse(binaryParser);

      expect(res3).have.status(200);

      try {
        const writer = fs.createWriteStream(path.resolve(enrichDir, 'enriched', 'enriched.csv'));
        Readable.from(res3.body.toString()).pipe(writer);
      } catch (err) {
        logger.error(`createWriteStream: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file6.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);

      const state = await getStateOfEnrich(stateName);

      expect(state).have.property('loaded');
      expect(state).have.property('linesRead').equal(3);
      expect(state).have.property('enrichedLines').equal(3);
      expect(state).have.property('startDate');
      expect(state).have.property('endDate');
      expect(state).have.property('status').equal('done');
    });
  });

  describe('Do a enrichment of a csv file with all unpaywall attributes and with semi colomn separator', () => {
    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      const file = fs.readFileSync(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');

      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/state')
        .set('responseType', 'json');

      const stateName = res1.body.state;

      const res2 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/csv')
        .query({ state: stateName })
        .query({ separator: ';' })
        .send(file)
        .set('Content-Type', 'text/csv')
        .buffer()
        .parse(binaryParser);

      expect(res2).have.status(200);

      const filename = JSON.parse(res2.body.toString()).file;

      const res3 = await chai
        .request(ezunpaywallURL)
        .get(`/enrich/${filename}`)
        .buffer()
        .parse(binaryParser);

      expect(res3).have.status(200);

      try {
        const writer = fs.createWriteStream(path.resolve(enrichDir, 'enriched', 'enriched.csv'));
        Readable.from(res3.body.toString()).pipe(writer);
      } catch (err) {
        logger.error(`createWriteStream: ${err}`);
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file7.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);

      const state = await getStateOfEnrich(stateName);

      expect(state).have.property('loaded');
      expect(state).have.property('linesRead').equal(3);
      expect(state).have.property('enrichedLines').equal(3);
      expect(state).have.property('startDate');
      expect(state).have.property('endDate');
      expect(state).have.property('status').equal('done');
    });
  });

  describe('Don\'t do a enrichment of a csv file because the arguments doesn\'t exist on ezunpaywall index', () => {
    it('Should return a error message', async () => {
      const file = fs.readFileSync(path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv'), 'utf8');

      const res1 = await chai
        .request(ezunpaywallURL)
        .post('/enrich/state')
        .set('responseType', 'json');

      const stateName = res1.body.state;

      const res = await chai
        .request(ezunpaywallURL)
        .post('/enrich/csv')
        .query({ state: stateName })
        .query({ args: 'don\'t exist' })
        .send(file)
        .set('Content-Type', 'text/csv')
        .set('Content-Type', 'application/json')
        .buffer()
        .parse(binaryParser);

      expect(res).have.status(401);
      expect(JSON.parse(res.body).message).be.equal('args incorrect');

      const state = await getStateOfEnrich(stateName);

      expect(state).have.property('loaded');
      expect(state).have.property('linesRead').equal(0);
      expect(state).have.property('enrichedLines').equal(0);
      expect(state).have.property('startDate');
      expect(state).have.property('endDate');
      expect(state).have.property('status').equal('error');
    });
  });

  after(async () => {
    await deleteIndex('unpaywall');
    await deleteFile('fake1.jsonl.gz');
    await deleteFile('fake2.jsonl.gz');
    await deleteFile('fake3.jsonl.gz');
  });
});
