/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const api = require('../app');
const fakeUnpaywall = require('../../fakeUnpaywall/app');

const client = require('../lib/client');

const indexUnpawall = require('../index/unpaywall.json');
const indexTask = require('../index/task.json');

const {
  createIndex,
  deleteIndex,
  countDocuments,
  isTaskEnd,
  getTask,
  deleteFile,
} = require('./utils');

const { logger } = require('../lib/logger');

chai.should();
chai.use(chaiHttp);

describe('test insertion between a period', () => {
  const ezunpaywallURL = 'http://localhost:8080';
  const fakeUnpaywallURL = 'http://localhost:12000';

  const now = Date.now();
  const oneDay = (1 * 24 * 60 * 60 * 1000);

  // create date in a format (YYYY-mm-dd) to be use by ezunpaywall
  const dateNow = new Date(now).toISOString().slice(0, 10);
  // yersterday
  const date1 = new Date(now - (1 * oneDay)).toISOString().slice(0, 10);
  // yersterday - one week
  const date2 = new Date(now - (8 * oneDay)).toISOString().slice(0, 10);
  // yersterday - two weeks
  const date3 = new Date(now - (15 * oneDay)).toISOString().slice(0, 10);
  // theses dates are for test between a short period
  const date4 = new Date(now - (4 * oneDay)).toISOString().slice(0, 10);
  const date5 = new Date(now - (5 * oneDay)).toISOString().slice(0, 10);
  const tomorrow = new Date(now + (1 * oneDay)).toISOString().slice(0, 10);

  before(async () => {
    // wait ezunpaywall
    let res1;
    while (res1?.body?.data !== 'pong') {
      try {
        res1 = await chai.request(ezunpaywallURL).get('/ping');
      } catch (err) {
        logger.error(`Error in ezunpaywall ping : ${err}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    // wait fakeUnpaywall
    let res2;
    while (res2?.body?.data !== 'pong') {
      try {
        res2 = await chai.request(fakeUnpaywallURL).get('/ping');
      } catch (err) {
        logger.error(`Error in fakeUnpaywall ping : ${err}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
    await deleteFile('fake1.jsonl.gz');
    await deleteFile('fake2.jsonl.gz');
    await deleteFile('fake3.jsonl.gz');
  });

  describe(`/update?startDate=${date2} download and insert files between a period with startDate`, async () => {
    before(async () => {
      await createIndex('task', indexTask);
      await createIndex('unpaywall', indexUnpawall);
    });

    // test return message
    it('should return the process start', async () => {
      const response = await chai.request(ezunpaywallURL)
        .post(`/update?startDate=${date2}`)
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');
      response.should.have.status(200);
      response.body.should.have.property('message').equal(`insert snapshot beetween ${date2} and ${dateNow} has begun, list of task has been created on elastic`);
    });

    // test insertion
    it('should insert 150 datas', async () => {
      let taskEnd;
      while (!taskEnd) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        taskEnd = await isTaskEnd();
      }
      const count = await countDocuments();
      expect(count).to.equal(150);
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

      task.steps[1].should.have.property('task').equal('download');
      task.steps[1].should.have.property('file').equal('fake2.jsonl.gz');
      task.steps[1].should.have.property('percent').equal(100);
      task.steps[1].should.have.property('took');
      task.steps[1].should.have.property('status').equal('success');

      task.steps[2].should.have.property('task').equal('insert');
      task.steps[2].should.have.property('file').equal('fake2.jsonl.gz');
      task.steps[2].should.have.property('percent').equal(100);
      task.steps[2].should.have.property('lineRead').equal(100);
      task.steps[2].should.have.property('took');
      task.steps[2].should.have.property('status').equal('success');

      task.steps[3].should.have.property('task').equal('download');
      task.steps[3].should.have.property('file').equal('fake1.jsonl.gz');
      task.steps[3].should.have.property('percent').equal(100);
      task.steps[3].should.have.property('took');
      task.steps[3].should.have.property('status').equal('success');

      task.steps[4].should.have.property('task').equal('insert');
      task.steps[4].should.have.property('file').equal('fake1.jsonl.gz');
      task.steps[4].should.have.property('percent').equal(100);
      task.steps[4].should.have.property('lineRead').equal(50);
      task.steps[4].should.have.property('took');
      task.steps[4].should.have.property('status').equal('success');
    });

    // TODO test Report
  });

  describe(`/update?startDate=${date3}&endDate=${date2} download and insert files between a period with startDate and endDate`, () => {
    before(async () => {
      await deleteFile('fake1.jsonl.gz');
      await deleteFile('fake2.jsonl.gz');
      await createIndex('task', indexTask);
      await createIndex('unpaywall', indexUnpawall);
    });

    // test return message
    it('should return the process start', async () => {
      const response = await chai.request(ezunpaywallURL)
        .post(`/update?startDate=${date3}&endDate=${date2}`)
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');
      response.should.have.status(200);
      response.body.should.have.property('message').equal(`insert snapshot beetween ${date3} and ${date2} has begun, list of task has been created on elastic`);
    });

    // test insertion
    it('should insert 2100 datas', async () => {
      let taskEnd;
      while (!taskEnd) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        taskEnd = await isTaskEnd();
      }
      const count = await countDocuments();
      expect(count).to.equal(2100);
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

      task.steps[1].should.have.property('task').equal('download');
      task.steps[1].should.have.property('file').equal('fake3.jsonl.gz');
      task.steps[1].should.have.property('percent').equal(100);
      task.steps[1].should.have.property('took');
      task.steps[1].should.have.property('status').equal('success');

      task.steps[2].should.have.property('task').equal('insert');
      task.steps[2].should.have.property('file').equal('fake3.jsonl.gz');
      task.steps[2].should.have.property('percent').equal(100);
      task.steps[2].should.have.property('lineRead').equal(2000);
      task.steps[2].should.have.property('took');
      task.steps[2].should.have.property('status').equal('success');

      task.steps[3].should.have.property('task').equal('download');
      task.steps[3].should.have.property('file').equal('fake2.jsonl.gz');
      task.steps[3].should.have.property('percent').equal(100);
      task.steps[3].should.have.property('took');
      task.steps[3].should.have.property('status').equal('success');

      task.steps[4].should.have.property('task').equal('insert');
      task.steps[4].should.have.property('file').equal('fake2.jsonl.gz');
      task.steps[4].should.have.property('percent').equal(100);
      task.steps[4].should.have.property('lineRead').equal(100);
      task.steps[4].should.have.property('took');
      task.steps[4].should.have.property('status').equal('success');
    });

    // TODO test Report
  });

  describe(`/update?startDate=${date5}&endDate=${date4} try to download and insert files between a short period with startDate and endDate`, () => {
    before(async () => {
      await deleteFile('fake2.jsonl.gz');
      await deleteFile('fake3.jsonl.gz');
      await createIndex('task', indexTask);
      await createIndex('unpaywall', indexUnpawall);
    });

    // test return message
    it('should return the process start', async () => {
      const response = await chai.request(ezunpaywallURL)
        .post(`/update?startDate=${date5}&endDate=${date4}`)
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');
      response.should.have.status(200);
      response.body.should.have.property('message').equal(`insert snapshot beetween ${date5} and ${date4} has begun, list of task has been created on elastic`);
    });

    // test insertion
    it('should insert nothing', async () => {
      let taskEnd;
      while (!taskEnd) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        taskEnd = await isTaskEnd();
      }
      const count = await countDocuments();
      expect(count).to.equal(null);
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
    });
  });

  describe(`/update?endDate=${date1} try to download and insert snapshot with only a endDate`, () => {
    // test return message
    it('should return a error message', async () => {
      const response = await chai.request(ezunpaywallURL)
        .post(`/update?endDate=${date1}`)
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');
      response.should.have.status(400);
      response.body.should.have.property('message').equal('start date is missing');
    });
  });

  describe('/update?startDate="WrongDate" try to download and insert snapshot with a date in bad format', () => {
    // test return message
    it('should return a error message', async () => {
      const response = await chai.request(ezunpaywallURL)
        .post('/update?startDate=LookAtMyDab')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');
      response.should.have.status(400);
      response.body.should.have.property('message').equal('startDate are in bad format, date need to be in format YYYY-mm-dd');
    });

    // test return message
    it('should return a error message', async () => {
      const response = await chai.request(ezunpaywallURL)
        .post('/update?startDate=01-01-2000')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');
      response.should.have.status(400);
      response.body.should.have.property('message').equal('startDate are in bad format, date need to be in format YYYY-mm-dd');
    });

    // test return message
    it('should return a error message', async () => {
      const response = await chai.request(ezunpaywallURL)
        .post('/update?startDate=2000-50-50')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');
      response.should.have.status(400);
      response.body.should.have.property('message').equal('startDate are in bad format, date need to be in format YYYY-mm-dd');
    });
  });

  describe(`/update?startDate=${date2}&endDate=${date3} try to download and insert files between a period with endDate < startDate`, () => {
    // test return message
    it('should return a error message', async () => {
      const response = await chai.request(ezunpaywallURL)
        .post(`/update?startDate=${date2}&endDate=${date3}`)
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');
      response.should.have.status(400);
      response.body.should.have.property('message').equal('endDate is lower than startDate');
    });
  });

  describe(`/update?startDate=${tomorrow} try to download and insert files with a startDate in the futur`, () => {
    // test return message
    it('should return a error message', async () => {
      const response = await chai.request(ezunpaywallURL)
        .post(`/update?startDate=${tomorrow}`)
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');
      response.should.have.status(400);
      response.body.should.have.property('message').equal('startDate is in the futur');
    });
  });

  after(async () => {
    await deleteIndex('unpaywall');
    await deleteIndex('task');
    await deleteFile('fake1.jsonl.gz');
    await deleteFile('fake2.jsonl.gz');
    await deleteFile('fake3.jsonl.gz');
  });
});
