/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const indexUnpawall = require('../index/unpaywall.json');

const {
  createIndex,
  countDocuments,
  checkIfInUpdate,
  getState,
  getReport,
  addSnapshot,
  resetAll,
} = require('./utils/update');

const {
  initializeDate,
} = require('./utils/file');

const {
  ping,
} = require('./utils/ping');

chai.use(chaiHttp);

describe('Test: weekly update route test', () => {
  const ezunpaywallURL = process.env.EZUNPAYWALL_URL;

  before(async () => {
    await ping();
    initializeDate();
  });

  describe('Do a classic weekly update', () => {
    before(async () => {
      await resetAll();
      await createIndex('unpaywall', indexUnpawall);
    });

    // test response
    it('Should return the process start', async () => {
      const res = await chai.request(ezunpaywallURL)
        .post('/update')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('api_key', 'admin');

      expect(res).have.status(200);
      expect(res.body.message).be.equal('weekly update has begun, list of task has been created on elastic');
    });

    // test insertion
    it('Should insert 50 data', async () => {
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall');
      expect(count).to.equal(50);
    });

    // test task
    it('Should get task with all informations from the weekly update', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').be.equal('askUnpaywall');
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').be.equal('success');

      expect(state.steps[1]).have.property('task').be.equal('download');
      expect(state.steps[1]).have.property('file').be.equal('fake1.jsonl.gz');
      expect(state.steps[1]).have.property('percent').be.equal(100);
      expect(state.steps[1]).have.property('took').to.not.equal(undefined);
      expect(state.steps[1]).have.property('status').be.equal('success');

      expect(state.steps[2]).have.property('task').be.equal('insert');
      expect(state.steps[2]).have.property('file').be.equal('fake1.jsonl.gz');
      expect(state.steps[2]).have.property('percent').be.equal(100);
      expect(state.steps[2]).have.property('linesRead').be.equal(50);
      expect(state.steps[2]).have.property('took').to.not.equal(undefined);
      expect(state.steps[2]).have.property('status').be.equal('success');

      expect(state.done).be.equal(true);
    });

    // test report
    it('Should get report with all informations from the weekly update', async () => {
      const report = await getReport();

      expect(report).have.property('done');
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').be.equal('askUnpaywall');
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').be.equal('success');

      expect(report.steps[1]).have.property('task').be.equal('download');
      expect(report.steps[1]).have.property('file').be.equal('fake1.jsonl.gz');
      expect(report.steps[1]).have.property('percent').be.equal(100);
      expect(report.steps[1]).have.property('took').to.not.equal(undefined);
      expect(report.steps[1]).have.property('status').be.equal('success');

      expect(report.steps[2]).have.property('task').be.equal('insert');
      expect(report.steps[2]).have.property('file').be.equal('fake1.jsonl.gz');
      expect(report.steps[2]).have.property('percent').be.equal(100);
      expect(report.steps[2]).have.property('linesRead').be.equal(50);
      expect(report.steps[2]).have.property('took').to.not.equal(undefined);
      expect(report.steps[2]).have.property('status').be.equal('success');
    });

    after(async () => {
      await resetAll();
    });
  });

  describe('Do a weekly update but the file is already installed', () => {
    before(async () => {
      await resetAll();
      await createIndex('unpaywall', indexUnpawall);
      await addSnapshot('fake1.jsonl.gz');
    });

    // test return message
    it('Should return the process start', async () => {
      const res = await chai.request(ezunpaywallURL)
        .post('/update')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('api_key', 'admin');

      // test response
      expect(res).have.status(200);
      expect(res.body).have.property('message').equal('weekly update has begun, list of task has been created on elastic');
    });

    // test insertion
    it('should insert 50 data', async () => {
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall');
      expect(count).to.equal(50);
    });

    // test task
    it('Should get task with all informations from the weekly update', async () => {
      const state = await getState();

      expect(state).have.property('done').equal(true);
      expect(state).have.property('steps').to.be.an('array');
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('error').equal(false);
      expect(state).have.property('took').to.not.equal(undefined);

      expect(state.steps[0]).have.property('task').equal('askUnpaywall');
      expect(state.steps[0]).have.property('took').to.not.equal(undefined);
      expect(state.steps[0]).have.property('status').equal('success');

      expect(state.steps[1]).have.property('task').equal('insert');
      expect(state.steps[1]).have.property('file').equal('fake1.jsonl.gz');
      expect(state.steps[1]).have.property('percent').equal(100);
      expect(state.steps[1]).have.property('linesRead').equal(50);
      expect(state.steps[1]).have.property('took').to.not.equal(undefined);
      expect(state.steps[1]).have.property('status').equal('success');
    });

    // test Report
    it('Should get report with all informations from the weekly update', async () => {
      const report = await getReport();

      expect(report).have.property('done').equal(true);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('askUnpaywall');
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('success');

      expect(report.steps[1]).have.property('task').equal('insert');
      expect(report.steps[1]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[1]).have.property('percent').equal(100);
      expect(report.steps[1]).have.property('linesRead').equal(50);
      expect(report.steps[1]).have.property('took').to.not.equal(undefined);
      expect(report.steps[1]).have.property('status').equal('success');
    });

    after(async () => {
      await resetAll();
    });
  });

  describe('Don\'t a classic weekly update because wrong api_key', () => {
    it('Should return a error message', async () => {
      const res = await chai.request(ezunpaywallURL)
        .post('/update')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('api_key', 'wrong api_key');

      expect(res).have.status(401);
      expect(res?.body).have.property('message').eq('Not authorized');
    });

    it('Should return a error message', async () => {
      const res = await chai.request(ezunpaywallURL)
        .post('/update')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
        .set('api_key', 'wrong api_key');

      expect(res).have.status(401);
      expect(res?.body).have.property('message').eq('Not authorized');
    });
  });

  after(async () => {
    await resetAll();
  });
});
