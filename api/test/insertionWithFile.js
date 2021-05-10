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
} = require('./utils/elastic');

const {
  getReport,
} = require('./utils/report');

const {
  initializeDate,
  deleteFile,
  downloadFile,
} = require('./utils/file');

const {
  ping,
} = require('./utils/ping');

chai.use(chaiHttp);

const ezunpaywallURL = 'http://localhost:8080';

describe('Test: insert the content of a file already installed on ezunpaywall', () => {
  before(async () => {
    await ping();
    initializeDate();
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
      let isUpdate = true;
      while (isUpdate) {
        console.log(isUpdate)
        await new Promise((resolve) => setTimeout(resolve, 1000));
        isUpdate = await isInUpdate();
      }
      const count = await countDocuments();
      expect(count).to.equal(50);
    });

    // test task
    it('Should get task with all informations from the insertion', async () => {
      const task = await getState();

      expect(task).have.property('done').equal(true);
      expect(task).have.property('createdAt');
      expect(task).have.property('endAt');
      expect(task).have.property('steps');
      expect(task).have.property('took');
      expect(task).have.property('error').equal(false);

      expect(task.steps[0]).have.property('task').equal('insert');
      expect(task.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(task.steps[0]).have.property('linesRead').equal(50);
      expect(task.steps[0]).have.property('percent').equal(100);
      expect(task.steps[0]).have.property('took');
      expect(task.steps[0]).have.property('status').equal('success');
    });

    // test Report
    it('Should get report with all informations from the insertion', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('steps');
      expect(report).have.property('createdAt');
      expect(report).have.property('endAt');
      expect(report).have.property('took');

      expect(report.steps[0]).have.property('task').equal('insert');
      expect(report.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[0]).have.property('percent').equal(100);
      expect(report.steps[0]).have.property('linesRead').equal(50);
      expect(report.steps[0]).have.property('took');
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
      const task = await getState();

      expect(task).have.property('done').equal(true);
      expect(task).have.property('steps');
      expect(task).have.property('createdAt');
      expect(task).have.property('endAt');
      expect(task).have.property('took');

      expect(task.steps[0]).have.property('task').equal('insert');
      expect(task.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(task.steps[0]).have.property('percent').equal(100);
      expect(task.steps[0]).have.property('linesRead').equal(10);
      expect(task.steps[0]).have.property('took');
      expect(task.steps[0]).have.property('status').equal('success');
    });

    // test report
    it('Should get report with all informations from the insertion', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('steps');
      expect(report).have.property('createdAt');
      expect(report).have.property('endAt');
      expect(report).have.property('took');

      expect(report.steps[0]).have.property('task').equal('insert');
      expect(report.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[0]).have.property('percent').equal(100);
      expect(report.steps[0]).have.property('linesRead').equal(10);
      expect(report.steps[0]).have.property('took');
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
      const task = await getState();

      expect(task).have.property('done').equal(true);
      expect(task).have.property('steps');
      expect(task).have.property('createdAt');
      expect(task).have.property('endAt');
      expect(task).have.property('took');

      expect(task.steps[0]).have.property('task').equal('insert');
      expect(task.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(task.steps[0]).have.property('percent').equal(100);
      expect(task.steps[0]).have.property('linesRead').equal(50);
      expect(task.steps[0]).have.property('took');
      expect(task.steps[0]).have.property('status').equal('success');
    });

    // test report
    it('Should get task with all informations from the insertion', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('steps');
      expect(report).have.property('createdAt');
      expect(report).have.property('endAt');
      expect(report).have.property('took');

      expect(report.steps[0]).have.property('task').equal('insert');
      expect(report.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[0]).have.property('percent').equal(100);
      expect(report.steps[0]).have.property('linesRead').equal(50);
      expect(report.steps[0]).have.property('took');
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
      const task = await getState();

      expect(task).have.property('done').equal(true);
      expect(task).have.property('steps');
      expect(task).have.property('createdAt');
      expect(task).have.property('endAt');
      expect(task).have.property('took');

      expect(task.steps[0]).have.property('task').equal('insert');
      expect(task.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(task.steps[0]).have.property('percent').equal(100);
      expect(task.steps[0]).have.property('linesRead').equal(20);
      expect(task.steps[0]).have.property('took');
      expect(task.steps[0]).have.property('status').equal('success');
    });

    // test report
    it('Should get report with all informations from the insertion', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('steps');
      expect(report).have.property('createdAt');
      expect(report).have.property('endAt');
      expect(report).have.property('took');

      expect(report.steps[0]).have.property('task').equal('insert');
      expect(report.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[0]).have.property('percent').equal(100);
      expect(report.steps[0]).have.property('linesRead').equal(20);
      expect(report.steps[0]).have.property('took');
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
      expect(res.body.message).be.equal('name of file is in bad format (accepted a .gz file)');
    });
  });

  describe('Don\'t do a insertion of a file already installed because the file doesn\'t exist on ezunpaywall', () => {
    // test return message
    it('Should return a error message', async () => {
      const res = await chai.request(ezunpaywallURL)
        .post('/update/fileDoesntExist.jsonl.gz')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');

      expect(res).have.status(404);
      expect(res.body.message).be.equal('file doesn\'t exist');
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
    await deleteIndex('task');
    await deleteFile('fake1.jsonl.gz');
  });
});
