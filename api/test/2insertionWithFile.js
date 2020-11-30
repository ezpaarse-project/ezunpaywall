const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const api = require('../app');
// const fakeUnpaywall = require('../../fakeUnpaywall/app');
const client = require('../lib/client');
const {
  createIndexUnpaywall,
  createIndexTask,
  deleteIndexUnpaywall,
  deleteIndexTask,
  countIndexUnpaywall,
  isTaskEnd,
  deleteFile,
  getTask,
} = require('./utils');
const { processLogger } = require('../lib/logger');

chai.should();
chai.use(chaiHttp);
// TODO date des fichier à jour

describe('test /update', () => {

  before(async () => {
    // wait ezunpaywall
    // await new Promise((resolve) => api.on('ready', resolve));
    // wait fakeUnpaywall
    // await new Promise((resolve) => fakeUnpaywall.on('ready', resolve()));
    // wait elastic started
    let response;
    while (response?.statusCode !== 200) {
      try {
        response = await client.ping();
      } catch (err) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        processLogger.error(`Error in before: ${err}`);
      }
    }
    await createIndexUnpaywall();
    await createIndexTask();
  });

  describe('/update/fake1.jsonl.gz insert a file already installed', async () => {
    it('should return the process start', async () => {
      const server = 'http://localhost:8080';
      const response = await chai.request(server)
        .post('/update/fake1.jsonl.gz')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
      response.should.have.status(200);
      response.body.should.have.property('message');
      response.body.message.should.be.equal('start upsert with fake1.jsonl.gz');
    });

    // test insertion
    it('should insert 2000 datas', async () => {
      let taskEnd;
      while (!taskEnd) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        taskEnd = await isTaskEnd()
      }
      count = await countIndexUnpaywall();
      expect(count).to.equal(2000)
    });

    // test task
    it('should get task with all informations', async () => {
      let task = await getTask();

      task.should.have.property('done');
      task.should.have.property('currentTask');
      task.should.have.property('steps');
      task.should.have.property('createdAt');
      task.should.have.property('endAt');
      task.should.have.property('took');

      task.steps[0].should.have.property('task');
      task.steps[0].should.have.property('file');
      task.steps[0].should.have.property('percent');
      task.steps[0].should.have.property('lineRead');
      task.steps[0].should.have.property('took');
      task.steps[0].should.have.property('status');

      task.done.should.be.equal(true);
      task.currentTask.should.be.equal('end');

      task.steps[0].task.should.be.equal('insert');
      task.steps[0].file.should.be.equal('fake1.jsonl.gz');
      task.steps[0].percent.should.be.equal(100);
      task.steps[0].lineRead.should.be.equal(2000);
      task.steps[0].status.should.be.equal('success');
    });

    // TODO test Report

    after(async () => {
      await deleteIndexUnpaywall();
      await deleteIndexTask();
    });
  });

  describe('/update/fake1.jsonl try to insert a file that is in the wrong format', async () => {
    it('should return a error message', async () => {
      const server = 'http://localhost:8080';
      const response = await chai.request(server)
        .post('/update/fake1.jsonl')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')

      response.should.have.status(400);
      response.body.should.have.property('message');
      response.body.message.should.be.equal('name of file is in bad format (accepted a .gz file)');
    });
  });

  describe('/update/fileDoesntExist.jsonl.gz try to insert a file that does not exist', async () => {
    it('should return a error message', async () => {
      const server = 'http://localhost:8080';
      const response = await chai.request(server)
        .post('/update/fileDoesntExist.jsonl.gz')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')

      response.should.have.status(404);
      response.body.should.have.property('message');
      response.body.message.should.be.equal('file doesn\'t exist');
    });
  });

  describe('/update/fake1.jsonl.gz?offset=100&limit=50 try to insert a file that does not exist', async () => {
    it('should return a error message', async () => {
      const server = 'http://localhost:8080';
      const response = await chai.request(server)
        .post('/update/fake1.jsonl.gz?offset=100&limit=50')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')

      response.should.have.status(400);
      response.body.should.have.property('message');
      response.body.message.should.be.equal('limit can\t be lower than offset or 0');
    });
  });

  describe('/update/fake1.jsonl.gz?limit=100 insert a file already installed with limit 100', async () => {
    it('should return the process start', async () => {
      const server = 'http://localhost:8080';
      const response = await chai.request(server)
        .post('/update/fake1.jsonl.gz?limit=100')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')

      response.should.have.status(200);
      response.body.should.have.property('message');
      response.body.message.should.be.equal('start upsert with fake1.jsonl.gz');
    });

    // test insertion
    it('should insert 100 datas', async () => {
      let taskEnd;
      while (!taskEnd) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        taskEnd = await isTaskEnd()
      }
      count = await countIndexUnpaywall();
      expect(count).to.equal(100)
    });

    // test task
    it('should get task with all informations', async () => {
      let task = await getTask();

      task.should.have.property('done');
      task.should.have.property('currentTask');
      task.should.have.property('steps');
      task.should.have.property('createdAt');
      task.should.have.property('endAt');
      task.should.have.property('took');

      task.steps[0].should.have.property('task');
      task.steps[0].should.have.property('file');
      task.steps[0].should.have.property('percent');
      task.steps[0].should.have.property('lineRead');
      task.steps[0].should.have.property('took');
      task.steps[0].should.have.property('status');

      task.done.should.be.equal(true);
      task.currentTask.should.be.equal('end');

      task.steps[0].task.should.be.equal('insert');
      task.steps[0].file.should.be.equal('fake1.jsonl.gz');
      task.steps[0].percent.should.be.equal(100);
      task.steps[0].lineRead.should.be.equal(100);
      task.steps[0].status.should.be.equal('success');
    });

    // TODO test Report

    after(async () => {
      await deleteIndexUnpaywall();
      await deleteIndexTask();
    });
  });

  describe('/update/fake1.jsonl.gz?offset=1500 insert a file already installed with offset 1500', async () => {
    it('should return the process start', async () => {
      const server = 'http://localhost:8080';
      const response = await chai.request(server)
        .post('/update/fake1.jsonl.gz?offset=1500')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
      response.should.have.status(200);
      response.body.should.have.property('message');
      response.body.message.should.be.equal('start upsert with fake1.jsonl.gz');
    });

    // test insertion
    it('should insert 500 datas', async () => {
      let taskEnd;
      while (!taskEnd) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        taskEnd = await isTaskEnd()
      }
      count = await countIndexUnpaywall();
      expect(count).to.equal(500)
    });


    // test task
    it('should get task with all informations', async () => {
      let task = await getTask();

      task.should.have.property('done');
      task.should.have.property('currentTask');
      task.should.have.property('steps');
      task.should.have.property('createdAt');
      task.should.have.property('endAt');
      task.should.have.property('took');

      task.steps[0].should.have.property('task');
      task.steps[0].should.have.property('file');
      task.steps[0].should.have.property('percent');
      task.steps[0].should.have.property('lineRead');
      task.steps[0].should.have.property('took');
      task.steps[0].should.have.property('status');

      task.done.should.be.equal(true);
      task.currentTask.should.be.equal('end');

      task.steps[0].task.should.be.equal('insert');
      task.steps[0].file.should.be.equal('fake1.jsonl.gz');
      task.steps[0].percent.should.be.equal(100);
      task.steps[0].lineRead.should.be.equal(2000);
      task.steps[0].status.should.be.equal('success');
    });

    // TODO test Report

    after(async () => {
      await deleteIndexUnpaywall();
      await deleteIndexTask();
    });
  });

  describe('/update/fake1.jsonl.gz?offset=50&limit=70 insert a file already installed with limit=50 and offset=70', async () => {
    it('should return the process start', async () => {
      const server = 'http://localhost:8080';
      const response = await chai.request(server)
        .post('/update/fake1.jsonl.gz?offset=50&limit=70')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
      response.should.have.status(200);
      response.body.should.have.property('message');
      response.body.message.should.be.equal('start upsert with fake1.jsonl.gz');
    });

    // test insertion
    it('should insert 20 datas', async () => {
      let taskEnd;
      while (!taskEnd) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        taskEnd = await isTaskEnd()
      }
      count = await countIndexUnpaywall();
      expect(count).to.equal(20)
    });

    // test task
    it('should get task with all informations', async () => {
      let task = await getTask();

      task.should.have.property('done');
      task.should.have.property('currentTask');
      task.should.have.property('steps');
      task.should.have.property('createdAt');
      task.should.have.property('endAt');
      task.should.have.property('took');

      task.steps[0].should.have.property('task');
      task.steps[0].should.have.property('file');
      task.steps[0].should.have.property('percent');
      task.steps[0].should.have.property('lineRead');
      task.steps[0].should.have.property('took');
      task.steps[0].should.have.property('status');

      task.done.should.be.equal(true);
      task.currentTask.should.be.equal('end');

      task.steps[0].task.should.be.equal('insert');
      task.steps[0].file.should.be.equal('fake1.jsonl.gz');
      task.steps[0].percent.should.be.equal(100);
      task.steps[0].lineRead.should.be.equal(70);
      task.steps[0].status.should.be.equal('success');
    });

    // TODO test Report

    after(async () => {
      await deleteIndexUnpaywall();
      await deleteIndexTask();
      await deleteFile('fake1.jsonl.gz')
    });
  });
});
