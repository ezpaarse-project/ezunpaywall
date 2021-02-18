/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const indexUnpawall = require('../index/unpaywall.json');
const indexTask = require('../index/task.json');

const {
  createIndex,
  deleteIndex,
  countDocuments,
  isTaskEnd,
  getTask,
} = require('./utils/elastic');

const {
  deleteFile,
  initializeDate,
} = require('./utils/file');

const {
  getLatestReport,
} = require('./utils/report');

const {
  ping,
} = require('./utils/ping');

chai.should();
chai.use(chaiHttp);

describe('Test: weekly update route test', () => {
  const ezunpaywallURL = 'http://localhost:8080';

  before(async () => {
    await ping();
    initializeDate();
    await deleteFile('fake1.jsonl.gz');
  });

  describe('Do a classic weekly update', () => {
    before(async () => {
      await createIndex('task', indexTask);
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
      let taskEnd;
      while (!taskEnd) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        taskEnd = await isTaskEnd();
      }
      const count = await countDocuments();
      expect(count).to.equal(50);
    });

    // test task
    it('Should get task with all informations from the weekly update', async () => {
      const task = await getTask();

      expect(task).have.property('done');
      expect(task).have.property('currentTask');
      expect(task).have.property('steps');
      expect(task).have.property('createdAt');
      expect(task).have.property('endAt');
      expect(task).have.property('took');
      expect(task.steps[0]).have.property('task');
      expect(task.steps[0]).have.property('took');
      expect(task.steps[0]).have.property('status');

      expect(task.steps[1]).have.property('task');
      expect(task.steps[1]).have.property('file');
      expect(task.steps[1]).have.property('percent');
      expect(task.steps[1]).have.property('took');
      expect(task.steps[1]).have.property('status');

      expect(task.steps[2]).have.property('task');
      expect(task.steps[2]).have.property('file');
      expect(task.steps[2]).have.property('percent');
      expect(task.steps[2]).have.property('lineRead');
      expect(task.steps[2]).have.property('took');
      expect(task.steps[2]).have.property('status');

      expect(task.done).be.equal(true);
      expect(task.currentTask).be.equal('end');
      expect(task.steps[0].task).be.equal('fetchUnpaywall');
      expect(task.steps[0].status).be.equal('success');

      expect(task.steps[1].task).be.equal('download');
      expect(task.steps[1].file).be.equal('fake1.jsonl.gz');
      expect(task.steps[1].percent).be.equal(100);
      expect(task.steps[1].status).be.equal('success');

      expect(task.steps[2].task).be.equal('insert');
      expect(task.steps[2].file).be.equal('fake1.jsonl.gz');
      expect(task.steps[2].percent).be.equal(100);
      expect(task.steps[2].lineRead).be.equal(50);
      expect(task.steps[2].status).be.equal('success');
    });

    // test report
    it('Should get report with all informations from the weekly update', async () => {
      const report = await getLatestReport();

      expect(report).have.property('done');
      expect(report).have.property('currentTask');
      expect(report).have.property('steps');
      expect(report).have.property('createdAt');
      expect(report).have.property('endAt');
      expect(report).have.property('took');
      expect(report.steps[0]).have.property('task');
      expect(report.steps[0]).have.property('took');
      expect(report.steps[0]).have.property('status');

      expect(report.steps[1]).have.property('task');
      expect(report.steps[1]).have.property('file');
      expect(report.steps[1]).have.property('percent');
      expect(report.steps[1]).have.property('took');
      expect(report.steps[1]).have.property('status');

      expect(report.steps[2]).have.property('task');
      expect(report.steps[2]).have.property('file');
      expect(report.steps[2]).have.property('percent');
      expect(report.steps[2]).have.property('lineRead');
      expect(report.steps[2]).have.property('took');
      expect(report.steps[2]).have.property('status');

      expect(report.done).be.equal(true);
      expect(report.currentTask).be.equal('end');
      expect(report.steps[0].task).be.equal('fetchUnpaywall');
      expect(report.steps[0].status).be.equal('success');

      expect(report.steps[1].task).be.equal('download');
      expect(report.steps[1].file).be.equal('fake1.jsonl.gz');
      expect(report.steps[1].percent).be.equal(100);
      expect(report.steps[1].status).be.equal('success');

      expect(report.steps[2].task).be.equal('insert');
      expect(report.steps[2].file).be.equal('fake1.jsonl.gz');
      expect(report.steps[2].percent).be.equal(100);
      expect(report.steps[2].lineRead).be.equal(50);
      expect(report.steps[2].status).be.equal('success');
    });
  });

  describe('Do a weekly update but the file is already installed', () => {
    before(async () => {
      await createIndex('task', indexTask);
      await createIndex('unpaywall', indexUnpawall);
    });

    // test return message
    it('Should return the process start', async () => {
      const res = await chai.request(ezunpaywallURL)
        .post('/update')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');

      // test response
      expect(res).have.status(200);
      expect(res.body).have.property('message').equal('weekly update has begun, list of task has been created on elastic');
    });

    // test insertion
    it('should insert 50 datas', async () => {
      let taskEnd;
      while (!taskEnd) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        taskEnd = await isTaskEnd();
      }
      const count = await countDocuments();
      expect(count).to.equal(50);
    });

    // test task
    it('Should get task with all informations from the weekly update', async () => {
      const task = await getTask();

      expect(task).have.property('done').equal(true);
      expect(task).have.property('currentTask').equal('end');
      expect(task).have.property('steps');
      expect(task).have.property('createdAt');
      expect(task).have.property('endAt');
      expect(task).have.property('took');

      expect(task.steps[0]).have.property('task').equal('fetchUnpaywall');
      expect(task.steps[0]).have.property('took');
      expect(task.steps[0]).have.property('status').equal('success');

      expect(task.steps[1]).have.property('task').equal('insert');
      expect(task.steps[1]).have.property('file').equal('fake1.jsonl.gz');
      expect(task.steps[1]).have.property('percent').equal(100);
      expect(task.steps[1]).have.property('lineRead').equal(50);
      expect(task.steps[1]).have.property('took');
      expect(task.steps[1]).have.property('status').equal('success');
    });

    // test Report
    it('Should get report with all informations from the weekly update', async () => {
      const report = await getLatestReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('currentTask').equal('end');
      expect(report).have.property('steps');
      expect(report).have.property('createdAt');
      expect(report).have.property('endAt');
      expect(report).have.property('took');

      expect(report.steps[0]).have.property('task').equal('fetchUnpaywall');
      expect(report.steps[0]).have.property('took');
      expect(report.steps[0]).have.property('status').equal('success');

      expect(report.steps[1]).have.property('task').equal('insert');
      expect(report.steps[1]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[1]).have.property('percent').equal(100);
      expect(report.steps[1]).have.property('lineRead').equal(50);
      expect(report.steps[1]).have.property('took');
      expect(report.steps[1]).have.property('status').equal('success');
    });
    // TODO test Mail
  });

  after(async () => {
    await deleteIndex('unpaywall');
    await deleteIndex('task');
    await deleteFile('fake1.jsonl.gz');
  });
});
