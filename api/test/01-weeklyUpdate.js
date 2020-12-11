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
  getTask,
  deleteFile,
  initializeDate,
} = require('./utils');

const { logger } = require('../lib/logger');

chai.should();
chai.use(chaiHttp);

describe('test weekly update', () => {
  const ezunpaywall = 'http://localhost:8080';
  const fakeUnpaywall = 'http://localhost:12000';

  const doi1 = '10.1186/s40510-015-0109-6'; // ligne 1 of fake1.jsonl.gz
  const doi2 = '10.14393/ufu.di.2018.728'; // line 35 of fake1.jsonl.gz

  before(async () => {
    // wait ezunpaywall
    let res1;
    while (res1?.status !== 200 && res1?.body?.data !== 'pong') {
      try {
        res1 = await chai.request(ezunpaywall).get('/ping');
      } catch (err) {
        logger.error(`Error in ezunpaywall ping : ${err}`);
      }
      await new Promise((resolve) => setTimeout(resolve(), 1000));
    }
    // wait fakeUnpaywall
    let res2;
    while (res2?.body?.data !== 'pong') {
      try {
        res2 = await chai.request(fakeUnpaywall).get('/ping');
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
      } catch (error) {
        logger.error(`Error in elastic ping : ${err}`);
      }
      await new Promise((resolve) => setTimeout(resolve(), 1000));
    }
    initializeDate();
    await deleteFile('fake1.jsonl.gz');
  });

  describe('/update weekly update', () => {
    before(async () => {
      await createIndexUnpaywall();
      await createIndexTask();
    });
  
    // test response
    it('should return the process start', async () => {
      const task = await getTask();
     
      const response = await chai.request(ezunpaywall)
        .post('/update')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')

      
      response.should.have.status(200);
      response.body.should.have.property('message');
      response.body.message.should.be.equal('weekly update has begun, list of task has been created on elastic');
    });

    // test insertion
    it('should insert 50 datas', async () => {
      let taskEnd;
      while (!taskEnd) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        taskEnd = await isTaskEnd()
      }
      count = await countIndexUnpaywall();
      expect(count).to.equal(50)
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
      task.steps[2].lineRead.should.be.equal(50);
      task.steps[2].status.should.be.equal('success');
    });

    // TODO test Report

  });

  describe('/update weekly update with a file already installed', () => {
    before(async () => {
      await createIndexUnpaywall();
      await createIndexTask();
    });
    
    // test return message
    it('should return the process start', async () => {
      const task = await getTask();
      const response = await chai.request(ezunpaywall)
        .post('/update')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')

      // test responses
      response.should.have.status(200);
      response.body.should.have.property('message').equal('weekly update has begun, list of task has been created on elastic');
    });

    // test insertion
    it('should insert 50 datas', async () => {
      let taskEnd;
      while (!taskEnd) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        taskEnd = await isTaskEnd()
      }
      count = await countIndexUnpaywall();
      expect(count).to.equal(50)
    });

    // test task
    it('should get task with all informations', async () => {
      let task = await getTask();

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
    // TODO test Report

  });

  describe(`get unpaywall data with one DOI`, () => {
    it('should get unpaywall data', async () => {
      const response = await chai.request(ezunpaywall)
        .get(`/graphql?query={getDatasUPW(dois:["${doi1}"]){doi, is_oa, genre, oa_status}}`);
      response.should.have.status(200);
      response.body.data.getDatasUPW.should.be.a('array');
      response.body.data.getDatasUPW[0].should.have.property('doi').eq(doi1);
      response.body.data.getDatasUPW[0].should.have.property('is_oa').eq(true);
    });

    it('It should get empty tab because doi not found on database', async () => {
      const response = await chai.request(ezunpaywall)
        .get('/graphql?query={getDatasUPW(dois:["Coin Coin"]){doi, is_oa, genre, oa_status}}');
      response.should.have.status(200);
      response.body.data.getDatasUPW.should.be.an('array');
      response.body.data.getDatasUPW.should.eql([]);
    });
  });

  describe('get unpaywall data with two DOI', () => {
    it('should get unpaywall datas', async () => {
      const response = await chai.request(ezunpaywall)
        .get(`/graphql?query={getDatasUPW(dois:["${doi1}","${doi2}"]){doi, is_oa, genre, oa_status}}`);
      response.should.have.status(200);
      response.body.data.getDatasUPW.should.be.a('array');
      response.body.data.getDatasUPW[0].should.have.property('is_oa').eq(true);
      response.body.data.getDatasUPW[1].should.have.property('is_oa').eq(false);
    });

    it('should get unpaywall data', async () => {
      const response = await chai.request(ezunpaywall)
        .get(`/graphql?query={getDatasUPW(dois:["${doi1}","Coin Coin"]){doi, is_oa, genre, oa_status}}`);
      response.should.have.status(200);
      response.body.data.getDatasUPW.should.be.a('array');
      response.body.data.getDatasUPW[0].should.have.property('is_oa').eq(true);
    });

    it('It should get empty tab', async () => {
      const response = await chai.request(ezunpaywall)
        .get('/graphql?query={getDatasUPW(dois:["Coin Coin","Coin Coin2"]){doi, is_oa, genre, oa_status}}');
      response.should.have.status(200);
      response.body.data.getDatasUPW.should.be.an('array');
      response.body.data.getDatasUPW.should.eql([]);
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
