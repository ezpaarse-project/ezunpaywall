/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');

const api = require('../app');
const fakeUnpaywall = require('../../fakeUnpaywall/app');

const indexUnpawall = require('../index/unpaywall.json');
const indexTask = require('../index/task.json');

const client = require('../lib/client');
const { logger } = require('../lib/logger');

const {
  createIndex,
  countDocuments,
  isTaskEnd,
  getTask,
} = require('./utils/elastic');

const {
  initializeDate,
  deleteFile,
} = require('./utils/file');

describe('test weekly update', () => {
  const ezunpaywallURL = 'http://localhost:8080';
  const fakeUnpaywallURL = 'http://localhost:12000';

  const doi1 = '10.1186/s40510-015-0109-6'; // ligne 1 of fake1.jsonl.gz
  const doi2 = '10.14393/ufu.di.2018.728'; // line 35 of fake1.jsonl.gz

  before(async () => {
    // wait ezunpaywall
    let res1;
    while (res1?.status !== 200 && res1?.body?.data !== 'pong') {
      try {
        res1 = await chai.request(ezunpaywallURL).get('/ping');
      } catch (err) {
        logger.error(`ezunpaywall ping : ${err}`);
      }
      await new Promise((resolve) => setTimeout(resolve(), 1000));
    }
    // wait fakeUnpaywall
    let res2;
    while (res2?.body?.data !== 'pong') {
      try {
        res2 = await chai.request(fakeUnpaywallURL).get('/ping');
      } catch (err) {
        logger.error(`fakeUnpaywall ping : ${err}`);
      }
      await new Promise((resolve) => setTimeout(resolve(), 1000));
    }
    // wait elastic started
    let res3;
    while (res3?.statusCode !== 200) {
      try {
        res3 = await client.ping();
      } catch (err) {
        logger.error(`elastic ping : ${err}`);
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
    it('should get task with all informations', async () => {
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
      task.steps[2].should.have.property('linesRead');
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
      task.steps[2].linesRead.should.be.equal(50);
      task.steps[2].status.should.be.equal('success');
    });

    describe('get unpaywall data with one DOI', () => {
      it('should get unpaywall data', async () => {
        const response = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"]){doi, is_oa}}`);
        response.should.have.status(200);
        response.body.data.getDataUPW.should.be.a('array');
        response.body.data.getDataUPW[0].should.have.property('doi').eq(doi1);
        response.body.data.getDataUPW[0].should.have.property('is_oa').eq(true);
      });

      it('It should get empty tab because doi not found on database', async () => {
        const response = await chai.request(ezunpaywallURL)
          .get('/graphql?query={getDataUPW(dois:["Coin Coin"]){doi, is_oa}}');
        response.should.have.status(200);
        response.body.data.getDataUPW.should.be.an('array');
        response.body.data.getDataUPW.should.eql([]);
      });
    });

    describe('get unpaywall data with two DOI', () => {
      it('should get unpaywall datas', async () => {
        const response = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}","${doi2}"]){doi, is_oa}}`);
        response.should.have.status(200);
        response.body.data.getDataUPW.should.be.a('array');
        response.body.data.getDataUPW[0].should.have.property('is_oa').eq(true);
        response.body.data.getDataUPW[1].should.have.property('is_oa').eq(false);
      });

      it('should get unpaywall data', async () => {
        const response = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}","Coin Coin"]){doi, is_oa}}`);
        response.should.have.status(200);
        response.body.data.getDataUPW.should.be.a('array');
        response.body.data.getDataUPW[0].should.have.property('is_oa').eq(true);
      });

      it('It should get empty tab', async () => {
        const response = await chai.request(ezunpaywallURL)
          .get('/graphql?query={getDataUPW(dois:["Coin Coin","Coin Coin2"]){doi, is_oa}}');
        response.should.have.status(200);
        response.body.data.getDataUPW.should.be.an('array');
        response.body.data.getDataUPW.should.eql([]);
      });
    });

    describe('get unpaywall data with one DOI and year', () => {
      it('should get unpaywall data', async () => {
        const response = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], year:"2015"){doi, is_oa, year}}`);
        response.should.have.status(200);
        response.body.data.getDataUPW.should.be.a('array');
        response.body.data.getDataUPW[0].should.have.property('doi').eq(doi1);
        response.body.data.getDataUPW[0].should.have.property('is_oa').eq(true);
        response.body.data.getDataUPW[0].should.have.property('year').eq('2015');
      });

      it('should get unpaywall data', async () => {
        const response = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}","${doi2}"], year:"2015"){doi, is_oa, year}}`);
        response.should.have.status(200);
        response.body.data.getDataUPW.should.be.a('array');
        response.body.data.getDataUPW[0].should.have.property('doi').eq(doi1);
        response.body.data.getDataUPW[0].should.have.property('is_oa').eq(true);
        response.body.data.getDataUPW[0].should.have.property('year').eq('2015');
      });

      it('It should get empty tab', async () => {
        const response = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], year:"2016"){doi, is_oa, year}}`);
        response.should.have.status(200);
        response.body.data.getDataUPW.should.be.a('array');
        response.body.data.getDataUPW.should.eql([]);
      });
    });

    describe('get unpaywall data with one DOI and range_year', () => {
      it('should get unpaywall data', async () => {
        const response = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], year_range:{gte:"2014"}){doi, is_oa, year}}`);
        response.should.have.status(200);
        response.body.data.getDataUPW.should.be.a('array');
        response.body.data.getDataUPW[0].should.have.property('doi').eq(doi1);
        response.body.data.getDataUPW[0].should.have.property('is_oa').eq(true);
        response.body.data.getDataUPW[0].should.have.property('year').eq('2015');
      });

      it('should get unpaywall data', async () => {
        const response = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], year_range:{gte:"2015"}){doi, is_oa, year}}`);
        response.should.have.status(200);
        response.body.data.getDataUPW.should.be.a('array');
        response.body.data.getDataUPW[0].should.have.property('doi').eq(doi1);
        response.body.data.getDataUPW[0].should.have.property('is_oa').eq(true);
        response.body.data.getDataUPW[0].should.have.property('year').eq('2015');
      });

      it('It should get empty tab', async () => {
        const response = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], year_range:{gte:"2016"}){doi, is_oa, year}}`);
        response.should.have.status(200);
        response.body.data.getDataUPW.should.be.a('array');
        response.body.data.getDataUPW.should.eql([]);
      });

      it('should get unpaywall data', async () => {
        const response = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], year_range:{lte:"2016"}){doi, is_oa, year}}`);
        response.should.have.status(200);
        response.body.data.getDataUPW.should.be.a('array');
        response.body.data.getDataUPW[0].should.have.property('doi').eq(doi1);
        response.body.data.getDataUPW[0].should.have.property('is_oa').eq(true);
        response.body.data.getDataUPW[0].should.have.property('year').eq('2015');
      });

      it('should get unpaywall data', async () => {
        const response = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], year_range:{lte:"2015"}){doi, is_oa, year}}`);
        response.should.have.status(200);
        response.body.data.getDataUPW.should.be.a('array');
        response.body.data.getDataUPW[0].should.have.property('doi').eq(doi1);
        response.body.data.getDataUPW[0].should.have.property('is_oa').eq(true);
        response.body.data.getDataUPW[0].should.have.property('year').eq('2015');
      });

      it('It should get empty tab', async () => {
        const response = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], year_range:{lte:"2014"}){doi, is_oa, year}}`);
        response.should.have.status(200);
        response.body.data.getDataUPW.should.be.a('array');
        response.body.data.getDataUPW.should.eql([]);
      });

      it('should get unpaywall data', async () => {
        const response = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], year_range:{gte:"2014" lte:"2016"}){doi, is_oa, year}}`);
        response.should.have.status(200);
        response.body.data.getDataUPW.should.be.a('array');
        response.body.data.getDataUPW[0].should.have.property('doi').eq(doi1);
        response.body.data.getDataUPW[0].should.have.property('is_oa').eq(true);
        response.body.data.getDataUPW[0].should.have.property('year').eq('2015');
      });

      it('It should get empty tab', async () => {
        const response = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], year_range:{gte:"2016", lte:"2018"}){doi, is_oa, year}}`);
        response.should.have.status(200);
        response.body.data.getDataUPW.should.be.a('array');
        response.body.data.getDataUPW.should.eql([]);
      });
    });

    describe('get unpaywall data with one DOI and best_oa_location:{licence}', () => {
      it('should get unpaywall data', async () => {
        const response = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], best_oa_location:{license: "cc-by"}){doi, is_oa, best_oa_location {license}}}`);
        response.should.have.status(200);
        response.body.data.getDataUPW.should.be.a('array');
        response.body.data.getDataUPW[0].should.have.property('doi').eq(doi1);
        response.body.data.getDataUPW[0].should.have.property('is_oa').eq(true);
        response.body.data.getDataUPW[0].should.have.property('best_oa_location');
        response.body.data.getDataUPW[0].best_oa_location.should.have.property('license').eq('cc-by');
      });

      it('It should get empty tab', async () => {
        const response = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], best_oa_location:{license: "coin coin"}){doi, is_oa, best_oa_location {license}}}`);
        response.should.have.status(200);
        response.body.data.getDataUPW.should.be.a('array');
        response.body.data.getDataUPW.should.eql([]);
      });
    });
  });
});
