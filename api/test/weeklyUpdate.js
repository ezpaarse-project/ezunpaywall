/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const api = require('../app');
const fakeUnpaywall = require('../../fakeUnpaywall/app');

const indexUnpawall = require('../index/unpaywall.json');
const indexTask = require('../index/task.json');

const client = require('../lib/client');

const {
  createIndex,
  deleteIndex,
  countDocuments,
  isTaskEnd,
  getTask,
  deleteFile,
  initializeDate,
  getLatestReport,
} = require('./utils');

const { logger } = require('../lib/logger');

chai.should();
chai.use(chaiHttp);

describe('test weekly update', () => {
  const ezunpaywallURL = 'http://localhost:8080';
  const fakeUnpaywallURL = 'http://localhost:12000';

  before(async () => {
    // wait ezunpaywall
    let res1;
    while (res1?.status !== 200 && res1?.body?.data !== 'pong') {
      try {
        res1 = await chai.request(ezunpaywallURL).get('/ping');
      } catch (err) {
        logger.error(`Error in ezunpaywall ping : ${err}`);
      }
      await new Promise((resolve) => setTimeout(resolve(), 1000));
    }
    // wait fakeUnpaywall
    let res2;
    while (res2?.body?.data !== 'pong') {
      try {
        res2 = await chai.request(fakeUnpaywallURL).get('/ping');
      } catch (err) {
        logger.error(`Error in fakeUnpaywall ping : ${err}`);
      }
      await new Promise((resolve) => setTimeout(resolve(), 1000));
    }
    // wait elastic started
    let res3;
    while (res3?.statusCode !== 200) {
      try {
        res3 = await client.ping();
      } catch (err) {
        logger.error(`Error in elastic ping : ${err}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    initializeDate();
    await deleteFile('fake1.jsonl.gz');
  });

  describe('/update weekly update', () => {
    before(async () => {
      await createIndex('task', indexTask);
      await createIndex('unpaywall', indexUnpawall);
    });

    // test response
    it('should return the process start', async () => {
      const response = await chai.request(ezunpaywallURL)
        .post('/update')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');

      response.should.have.status(200);
      response.body.should.have.property('message');
      response.body.message.should.be.equal('weekly update has begun, list of task has been created on elastic');
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
    it('should get task3 with all informations', async () => {
      const task = await getTask();

      task.should.have.property('done');
      task.should.have.property('currentTask');
      task.should.have.property('steps');
      task.should.have.property('createdAt');
      task.should.have.property('endAt');
      task.should.have.property('took');
      task.steps[0].should.have.property('task');
      task.steps[0].should.have.property('took');
      task.steps[0].should.have.property('status');

      task.steps[1].should.have.property('task');
      task.steps[1].should.have.property('file');
      task.steps[1].should.have.property('percent');
      task.steps[1].should.have.property('took');
      task.steps[1].should.have.property('status');

      task.steps[2].should.have.property('task');
      task.steps[2].should.have.property('file');
      task.steps[2].should.have.property('percent');
      task.steps[2].should.have.property('lineRead');
      task.steps[2].should.have.property('took');
      task.steps[2].should.have.property('status');

      task.done.should.be.equal(true);
      task.currentTask.should.be.equal('end');
      task.steps[0].task.should.be.equal('fetchUnpaywall');
      task.steps[0].status.should.be.equal('success');

      task.steps[1].task.should.be.equal('download');
      task.steps[1].file.should.be.equal('fake1.jsonl.gz');
      task.steps[1].percent.should.be.equal(100);
      task.steps[1].status.should.be.equal('success');

      task.steps[2].task.should.be.equal('insert');
      task.steps[2].file.should.be.equal('fake1.jsonl.gz');
      task.steps[2].percent.should.be.equal(100);
      task.steps[2].lineRead.should.be.equal(50);
      task.steps[2].status.should.be.equal('success');
    });

    // test report
    it('should get report with all informations', async () => {
      const report = await getLatestReport();

      report.should.have.property('done');
      report.should.have.property('currentTask');
      report.should.have.property('steps');
      report.should.have.property('createdAt');
      report.should.have.property('endAt');
      report.should.have.property('took');
      report.steps[0].should.have.property('task');
      report.steps[0].should.have.property('took');
      report.steps[0].should.have.property('status');

      report.steps[1].should.have.property('task');
      report.steps[1].should.have.property('file');
      report.steps[1].should.have.property('percent');
      report.steps[1].should.have.property('took');
      report.steps[1].should.have.property('status');

      report.steps[2].should.have.property('task');
      report.steps[2].should.have.property('file');
      report.steps[2].should.have.property('percent');
      report.steps[2].should.have.property('lineRead');
      report.steps[2].should.have.property('took');
      report.steps[2].should.have.property('status');

      report.done.should.be.equal(true);
      report.currentTask.should.be.equal('end');
      report.steps[0].task.should.be.equal('fetchUnpaywall');
      report.steps[0].status.should.be.equal('success');

      report.steps[1].task.should.be.equal('download');
      report.steps[1].file.should.be.equal('fake1.jsonl.gz');
      report.steps[1].percent.should.be.equal(100);
      report.steps[1].status.should.be.equal('success');

      report.steps[2].task.should.be.equal('insert');
      report.steps[2].file.should.be.equal('fake1.jsonl.gz');
      report.steps[2].percent.should.be.equal(100);
      report.steps[2].lineRead.should.be.equal(50);
      report.steps[2].status.should.be.equal('success');
    });
  });

  describe('/update weekly update with a file already installed', () => {
    before(async () => {
      await createIndex('task', indexTask);
      await createIndex('unpaywall', indexUnpawall);
    });

    // test return message
    it('should return the process start', async () => {
      const response = await chai.request(ezunpaywallURL)
        .post('/update')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');

      // test responses
      response.should.have.status(200);
      response.body.should.have.property('message').equal('weekly update has begun, list of task has been created on elastic');
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
    it('should get task with all informations', async () => {
      const task = await getTask();

      task.should.have.property('done').equal(true);
      task.should.have.property('currentTask').equal('end');
      task.should.have.property('steps');
      task.should.have.property('createdAt');
      task.should.have.property('endAt');
      task.should.have.property('took');

      task.steps[0].should.have.property('task').equal('fetchUnpaywall');
      task.steps[0].should.have.property('took');
      task.steps[0].should.have.property('status').equal('success');

      task.steps[1].should.have.property('task').equal('insert');
      task.steps[1].should.have.property('file').equal('fake1.jsonl.gz');
      task.steps[1].should.have.property('percent').equal(100);
      task.steps[1].should.have.property('lineRead').equal(50);
      task.steps[1].should.have.property('took');
      task.steps[1].should.have.property('status').equal('success');
    });

    // test Report
    it('should get report with all informations', async () => {
      const report = await getLatestReport();

      report.should.have.property('done').equal(true);
      report.should.have.property('currentTask').equal('end');
      report.should.have.property('steps');
      report.should.have.property('createdAt');
      report.should.have.property('endAt');
      report.should.have.property('took');

      report.steps[0].should.have.property('task').equal('fetchUnpaywall');
      report.steps[0].should.have.property('took');
      report.steps[0].should.have.property('status').equal('success');

      report.steps[1].should.have.property('task').equal('insert');
      report.steps[1].should.have.property('file').equal('fake1.jsonl.gz');
      report.steps[1].should.have.property('percent').equal(100);
      report.steps[1].should.have.property('lineRead').equal(50);
      report.steps[1].should.have.property('took');
      report.steps[1].should.have.property('status').equal('success');
    });
    // TODO test Mail
  });

  after(async () => {
    await deleteIndex('unpaywall');
    await deleteIndex('task');
    await deleteFile('fake1.jsonl.gz');
    await deleteFile('fake2.jsonl.gz');
    await deleteFile('fake3.jsonl.gz');
  });
});
