/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const api = require('../app');
const fakeUnpaywall = require('../../fakeUnpaywall/app');

const client = require('../lib/client');

const {
  createIndexUnpaywall,
  createIndexTask,
  deleteIndexUnpaywall,
  deleteIndexTask,
  countIndexUnpaywall,
  isTaskEnd,
  deleteFile,
  downloadFile,
  getTask,
} = require('./utils');
const { logger } = require('../lib/logger');

chai.should();
chai.use(chaiHttp);
// TODO date des fichier à jour

describe('test insertion with a file already installed in ez-unpaywall', () => {
  const ezunpaywallURL = 'http://localhost:8080';
  const fakeUnpaywallURL = 'http://localhost:12000';

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
    await downloadFile('fake1.jsonl.gz');
  });

  describe('/update/fake1.jsonl.gz insert a file already installed', () => {
    before(async () => {
      await createIndexUnpaywall();
      await createIndexTask();
    });
    // test return message
    it('should return the process start', async () => {
      const response = await chai.request(ezunpaywallURL)
        .post('/update/fake1.jsonl.gz')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');
      response.should.have.status(200);
      response.body.should.have.property('message').equal('start upsert with fake1.jsonl.gz');
    });

    // test insertion
    it('should insert 50 datas', async () => {
      let taskEnd;
      while (!taskEnd) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        taskEnd = await isTaskEnd();
      }
      const count = await countIndexUnpaywall();
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

      task.steps[0].should.have.property('task').equal('insert');
      task.steps[0].should.have.property('file').equal('fake1.jsonl.gz');
      task.steps[0].should.have.property('percent').equal(100);
      task.steps[0].should.have.property('lineRead').equal(50);
      task.steps[0].should.have.property('took');
      task.steps[0].should.have.property('status').equal('success');
    });

    // TODO test Report

    after(async () => {
      await deleteIndexUnpaywall();
      await deleteIndexTask();
    });
  });

  describe('/update/fake1.jsonl.gz?limit=10 insert a file already installed with limit 10', () => {
    // test return message
    it('should return the process start', async () => {
      const response = await chai.request(ezunpaywallURL)
        .post('/update/fake1.jsonl.gz?limit=10')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');

      response.should.have.status(200);
      response.body.should.have.property('message').equal('start upsert with fake1.jsonl.gz');
    });

    // test insertion
    it('should insert 10 datas', async () => {
      let taskEnd;
      while (!taskEnd) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        taskEnd = await isTaskEnd();
      }
      const count = await countIndexUnpaywall();
      expect(count).to.equal(10);
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

      task.steps[0].should.have.property('task').equal('insert');
      task.steps[0].should.have.property('file').equal('fake1.jsonl.gz');
      task.steps[0].should.have.property('percent').equal(100);
      task.steps[0].should.have.property('lineRead').equal(10);
      task.steps[0].should.have.property('took');
      task.steps[0].should.have.property('status').equal('success');
    });

    // TODO test Report

    after(async () => {
      await deleteIndexUnpaywall();
      await deleteIndexTask();
    });
  });

  describe('/update/fake1.jsonl.gz?offset=40 insert a file already installed with offset 40', () => {
    before(async () => {
      await createIndexUnpaywall();
      await createIndexTask();
    });
    // test return message
    it('should return the process start', async () => {
      const response = await chai.request(ezunpaywallURL)
        .post('/update/fake1.jsonl.gz?offset=40')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');
      response.should.have.status(200);
      response.body.should.have.property('message').equal('start upsert with fake1.jsonl.gz');
    });

    // test insertion
    it('should insert 10 datas', async () => {
      let taskEnd;
      while (!taskEnd) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        taskEnd = await isTaskEnd();
      }
      const count = await countIndexUnpaywall();
      expect(count).to.equal(10);
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

      task.steps[0].should.have.property('task').equal('insert');
      task.steps[0].should.have.property('file').equal('fake1.jsonl.gz');
      task.steps[0].should.have.property('percent').equal(100);
      task.steps[0].should.have.property('lineRead').equal(50);
      task.steps[0].should.have.property('took');
      task.steps[0].should.have.property('status').equal('success');
    });

    // TODO test Report

    after(async () => {
      await deleteIndexUnpaywall();
      await deleteIndexTask();
    });
  });

  describe('/update/fake1.jsonl.gz?offset=10&limit=20 insert a file already installed with limit=10 and offset=20', () => {
    before(async () => {
      await createIndexUnpaywall();
      await createIndexTask();
    });
    // test return message
    it('should return the process start', async () => {
      const response = await chai.request(ezunpaywallURL)
        .post('/update/fake1.jsonl.gz?offset=10&limit=20')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');
      response.should.have.status(200);
      response.body.should.have.property('message').equal('start upsert with fake1.jsonl.gz');
    });

    // test insertion
    it('should insert 10 datas', async () => {
      let taskEnd;
      while (!taskEnd) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        taskEnd = await isTaskEnd();
      }
      const count = await countIndexUnpaywall();
      expect(count).to.equal(10);
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

      task.steps[0].should.have.property('task').equal('insert');
      task.steps[0].should.have.property('file').equal('fake1.jsonl.gz');
      task.steps[0].should.have.property('percent').equal(100);
      task.steps[0].should.have.property('lineRead').equal(20);
      task.steps[0].should.have.property('took');
      task.steps[0].should.have.property('status').equal('success');
    });

    // TODO test Report

    after(async () => {
      await deleteIndexUnpaywall();
      await deleteIndexTask();
    });
  });

  describe('/update/fake1.jsonl try to insert a file that is in the wrong format', () => {
    // test return message
    it('should return a error message', async () => {
      const response = await chai.request(ezunpaywallURL)
        .post('/update/fake1.jsonl')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');

      response.should.have.status(400);
      response.body.should.have.property('message').equal('name of file is in bad format (accepted a .gz file)');
    });
  });

  describe('/update/fileDoesntExist.jsonl.gz try to insert a file that does not exist', () => {
    // test return message
    it('should return a error message', async () => {
      const response = await chai.request(ezunpaywallURL)
        .post('/update/fileDoesntExist.jsonl.gz')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');

      response.should.have.status(404);
      response.body.should.have.property('message').equal('file doesn\'t exist');
    });
  });

  describe('/update/fake1.jsonl.gz?offset=100&limit=50 try to insert a file with limit < offset', () => {
    // test return message
    it('should return a error message', async () => {
      const response = await chai.request(ezunpaywallURL)
        .post('/update/fake1.jsonl.gz?offset=100&limit=50')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');

      response.should.have.status(400);
      response.body.should.have.property('message').equal('limit can\t be lower than offset or 0');
    });
  });

  after(async () => {
    await deleteIndexUnpaywall();
    await deleteIndexTask();
    await deleteFile('fake1.jsonl.gz');
    await deleteFile('fake2.jsonl.gz');
    await deleteFile('fake3.jsonl.gz');
  });
});
