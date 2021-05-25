/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const indexUnpawall = require('../index/unpaywall.json');

const {
  createIndex,
  deleteIndex,
  countDocuments,
  isInUpdate,
  getState,
  getReport,
} = require('./utils/update');

const {
  deleteFile,
  downloadFile,
} = require('./utils/file');

const {
  ping,
} = require('./utils/ping');

chai.use(chaiHttp);

const ezunpaywallURL = process.env.EZUNPAYWALL_URL;

describe('Test: insert the content of a file already installed on ezunpaywall', () => {
  before(async () => {
    await ping();
    await downloadFile('fake1.jsonl.gz');
  });

  describe('Do a classic insertion of a file already installed', () => {
    before(async () => {
      await createIndex('unpaywall', indexUnpawall);
    });

    // test return message
    it('Should return the process start', async () => {
      const res = await chai.request(ezunpaywallURL)
        .post('/update/fake1.jsonl.gz')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');

      expect(res).have.status(200);
      expect(res.body.message).be.equal('start upsert with fake1.jsonl.gz');
    });

    // test insertion
    it('Should insert 50 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        isUpdate = await isInUpdate();
      }
      const count = await countDocuments();
      expect(count).to.equal(50);
    });

    // test task
    it('Should get task with all informations from the insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').equal('insert');
      expect(state.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(state.steps[0]).have.property('linesRead').equal(50);
      expect(state.steps[0]).have.property('percent').equal(100);
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('success');
    });

    // test Report
    it('Should get report with all informations from the insertion', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('insert');
      expect(report.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[0]).have.property('percent').equal(100);
      expect(report.steps[0]).have.property('linesRead').equal(50);
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('success');
    });

    after(async () => {
      await deleteIndex('unpaywall');
    });
  });

  describe('Do a classic insertion of a file already installed with parameter limit=10', () => {
    before(async () => {
      await createIndex('unpaywall', indexUnpawall);
    });

    // test return message
    it('Should return the process start', async () => {
      const res = await chai.request(ezunpaywallURL)
        .post('/update/fake1.jsonl.gz?limit=10')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');

      expect(res).have.status(200);
      expect(res.body.message).be.equal('start upsert with fake1.jsonl.gz');
    });

    // test insertion
    it('Should insert 10 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        isUpdate = await isInUpdate();
      }
      const count = await countDocuments();
      expect(count).to.equal(10);
    });

    // test task
    it('Should get task with all informations from the insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').equal('insert');
      expect(state.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(state.steps[0]).have.property('percent').equal(100);
      expect(state.steps[0]).have.property('linesRead').equal(10);
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('success');
    });

    // test report
    it('Should get report with all informations from the insertion', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('insert');
      expect(report.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[0]).have.property('percent').equal(100);
      expect(report.steps[0]).have.property('linesRead').equal(10);
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('success');
    });

    after(async () => {
      await deleteIndex('unpaywall');
    });
  });

  describe('Do a classic insertion of a file already installed with parameter offset=40', () => {
    before(async () => {
      await createIndex('unpaywall', indexUnpawall);
    });
    // test return message
    it('should return the process start', async () => {
      const res = await chai.request(ezunpaywallURL)
        .post('/update/fake1.jsonl.gz?offset=40')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');

      expect(res).have.status(200);
      expect(res.body.message).be.equal('start upsert with fake1.jsonl.gz');
    });

    // test insertion
    it('Should insert 10 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        isUpdate = await isInUpdate();
      }
      const count = await countDocuments();
      expect(count).to.equal(10);
    });

    // test task
    it('Should get task with all informations from the insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').equal('insert');
      expect(state.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(state.steps[0]).have.property('percent').equal(100);
      expect(state.steps[0]).have.property('linesRead').equal(50);
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('success');
    });

    // test report
    it('Should get task with all informations from the insertion', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('insert');
      expect(report.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[0]).have.property('percent').equal(100);
      expect(report.steps[0]).have.property('linesRead').equal(50);
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('success');
    });

    after(async () => {
      await deleteIndex('unpaywall');
    });
  });

  describe('Do a classic insertion of a file already installed with parameter offset=10 and limit=20', () => {
    before(async () => {
      await createIndex('unpaywall', indexUnpawall);
    });
    // test return message
    it('Should return the process start', async () => {
      const res = await chai.request(ezunpaywallURL)
        .post('/update/fake1.jsonl.gz?offset=10&limit=20')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');

      expect(res).have.status(200);
      expect(res.body.message).be.equal('start upsert with fake1.jsonl.gz');
    });

    // test insertion
    it('Should insert 10 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        isUpdate = await isInUpdate();
      }
      const count = await countDocuments();
      expect(count).to.equal(10);
    });

    // test task
    it('Should get task with all informations from the insertion', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').equal('insert');
      expect(state.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(state.steps[0]).have.property('percent').equal(100);
      expect(state.steps[0]).have.property('linesRead').equal(20);
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('success');
    });

    // test report
    it('Should get report with all informations from the insertion', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('insert');
      expect(report.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[0]).have.property('percent').equal(100);
      expect(report.steps[0]).have.property('linesRead').equal(20);
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('success');
    });

    after(async () => {
      await deleteIndex('unpaywall');
    });
  });

  describe('Don\'t do a insertion of a file already installed because the file is in the wrong format', () => {
    // test return message
    it('Should return a error message', async () => {
      const res = await chai.request(ezunpaywallURL)
        .post('/update/fake1.jsonl')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');

      expect(res).have.status(400);
      expect(res.body.message).be.equal('filename of file is in bad format (accepted a .gz file)');
    });
  });

  describe('Don\'t do a insertion of a file already installed because the file not found on ezunpaywall', () => {
    // test return message
    it('Should return a error message', async () => {
      const res = await chai.request(ezunpaywallURL)
        .post('/update/fileDoesntExist.jsonl.gz')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');

      expect(res).have.status(404);
      expect(res.body.message).be.equal('file not found');
    });
  });

  describe('Don\'t do a insertion of a file already installed because the parameter limit can\t be lower than offset', () => {
    // test return message
    it('Should return a error message', async () => {
      const res = await chai.request(ezunpaywallURL)
        .post('/update/fake1.jsonl.gz?offset=100&limit=50')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');

      expect(res).have.status(400);
      expect(res.body.message).be.equal('limit can\t be lower than offset or 0');
    });
  });

  after(async () => {
    await deleteIndex('unpaywall');
    await deleteFile('fake1.jsonl.gz');
    await deleteFile('fake2.jsonl.gz');
    await deleteFile('fake3.jsonl.gz');
  });
});
