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
  getTask,
  deleteFile,
  initializeDate,
} = require('./utils');

chai.should();
chai.use(chaiHttp);

describe('test weekly update', () => {
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
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve(), 1000));
      }
    }
    initializeDate();
    await deleteFile('fake1.jsonl.gz');
    await deleteFile('fake2.jsonl.gz')
    await deleteFile('fake3.jsonl.gz')
  });

  describe('/update weekly update', () => {
    before(async () => {
      await createIndexUnpaywall();
      await createIndexTask();
    });
  
    // test response
    it('should return the process start', async () => {
      const task = await getTask();
      const server = 'http://localhost:8080';
      const response = await chai.request(server)
        .post('/update')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')

      
      response.should.have.status(200);
      response.body.should.have.property('message');
      response.body.message.should.be.equal('weekly update has begun, list of task has been created on elastic');
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
      task.steps[2].lineRead.should.be.equal(2000);
      task.steps[2].status.should.be.equal('success');
    });

    // TODO test Report

    after(async () => {
      await deleteIndexUnpaywall();
      await deleteIndexTask();
    });
  });

  describe('/update weekly update with a file already installed', () => {
    before(async () => {
      await createIndexUnpaywall();
      await createIndexTask();
    });
    
    // test return message
    it('should return the process start', async () => {
      const task = await getTask();
      const server = 'http://localhost:8080';
      const response = await chai.request(server)
        .post('/update')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')

      // test responses
      response.should.have.status(200);
      response.body.should.have.property('message');
      response.body.message.should.be.equal('weekly update has begun, list of task has been created on elastic');
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
      task.steps[0].should.have.property('took');
      task.steps[0].should.have.property('status');

      task.steps[1].should.have.property('task');
      task.steps[1].should.have.property('file');
      task.steps[1].should.have.property('percent');
      task.steps[1].should.have.property('lineRead');
      task.steps[1].should.have.property('took');
      task.steps[1].should.have.property('status');

      task.done.should.be.equal(true);
      task.currentTask.should.be.equal('end');
      task.steps[0].task.should.be.equal('fetchUnpaywall');
      task.steps[0].status.should.be.equal('success');

      task.steps[1].task.should.be.equal('insert');
      task.steps[1].file.should.be.equal('fake1.jsonl.gz');
      task.steps[1].percent.should.be.equal(100);
      task.steps[1].lineRead.should.be.equal(2000);
      task.steps[1].status.should.be.equal('success');
    });
    // TODO test Report

    after(async () => {
      await deleteIndexUnpaywall();
      await deleteIndexTask();
    });
  });
});
