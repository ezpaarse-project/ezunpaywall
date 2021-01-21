/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const api = require('../app');
const fakeUnpaywall = require('../../fakeUnpaywall/app');

const indexUnpawall = require('./index/unpaywall.json');
const indexTask = require('./index/task.json');

const client = require('../lib/client');

const {
  createIndex,
  deleteIndex,
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
      const count = await countIndexUnpaywall();
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
    // TODO test Mail
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

// {"doi":"10.1186/s40510-015-0109-6","year":2015,"genre":"journal-article","is_oa":true,"title":"Synergistic effect of wire bending and salivary pH on surface properties and mechanical properties of orthodontic stainless steel archwires","doi_url":"https://doi.org/10.1186/s40510-015-0109-6","updated":"2020-11-01T19:27:41.080986","oa_status":"gold","publisher":"Springer Science and Business Media LLC","z_authors":[{"given":"Marieke G.","family":"Hobbelink","sequence":"first"},{"given":"Yan","family":"He","sequence":"additional"},{"given":"Jia","family":"Xu","sequence":"additional"},{"given":"Huixu","family":"Xie","sequence":"additional"},{"given":"Richard","family":"Stoll","sequence":"additional"},{"given":"Qingsong","family":"Ye","sequence":"additional"}],"is_paratext":false,"journal_name":"Progress in Orthodontics","oa_locations":[{"url":"https://doi.org/10.1186/s40510-015-0109-6","pmh_id":null,"is_best":true,"license":"cc-by","oa_date":"2015-10-26","updated":"2020-11-01T19:27:40.270925","version":"publishedVersion","evidence":"oa journal (via doaj)","host_type":"publisher","endpoint_id":null,"url_for_pdf":null,"url_for_landing_page":"https://doi.org/10.1186/s40510-015-0109-6","repository_institution":null},{"url":"http://europepmc.org/articles/pmc4621974?pdf=render","pmh_id":"oai:europepmc.org:NW9rLbsGY7CncqCRefdW","is_best":false,"license":"cc-by","oa_date":null,"updated":null,"version":"publishedVersion","evidence":"oa repository (via OAI-PMH doi match)","host_type":"repository","endpoint_id":"b5e840539009389b1a6","url_for_pdf":"http://europepmc.org/articles/pmc4621974?pdf=render","url_for_landing_page":"http://europepmc.org/articles/pmc4621974","repository_institution":"PubMed Central - Europe PMC"},{"url":"https://pure.rug.nl/ws/files/67598823/s40510_015_0109_6.pdf","pmh_id":"oai:pure.rug.nl:publications/d3c2ac08-64c1-4194-b054-b41a3c4e749a","is_best":false,"license":"cc-by","oa_date":null,"updated":"2020-07-26T14:25:34.143808","version":"publishedVersion","evidence":"oa repository (via OAI-PMH doi match)","host_type":"repository","endpoint_id":"7f0825cc41e4f9abd9e","url_for_pdf":"https://pure.rug.nl/ws/files/67598823/s40510_015_0109_6.pdf","url_for_landing_page":"https://pure.rug.nl/ws/files/67598823/s40510_015_0109_6.pdf","repository_institution":"University of Groningen / Centre for Information Technology - University of Groningen research database"},{"url":"https://www.rug.nl/research/portal/files/67598823/s40510_015_0109_6.pdf","pmh_id":"rug:oai:pure.rug.nl:publications/d3c2ac08-64c1-4194-b054-b41a3c4e749a","is_best":false,"license":"cc-by","oa_date":null,"updated":"2020-06-07T12:24:19.876345","version":"publishedVersion","evidence":"oa repository (via OAI-PMH doi match)","host_type":"repository","endpoint_id":"bfa41bc4dfeca7f7fae","url_for_pdf":"https://www.rug.nl/research/portal/files/67598823/s40510_015_0109_6.pdf","url_for_landing_page":"https://www.rug.nl/research/portal/en/publications/synergistic-effect-of-wire-bending-and-salivary-ph-on-surface-properties-and-mechanical-properties-of-orthodontic-stainless-steel-archwires(d3c2ac08-64c1-4194-b054-b41a3c4e749a).html","repository_institution":"DANS - Data Archiving and Networked Services - NARCIS - National Academic Research and Collaborations Information System"},{"url":"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4621974","pmh_id":null,"is_best":false,"license":null,"oa_date":null,"updated":"2020-11-01T19:27:40.271198","version":"publishedVersion","evidence":"oa repository (via pmcid lookup)","host_type":"repository","endpoint_id":null,"url_for_pdf":null,"url_for_landing_page":"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4621974","repository_institution":null},{"url":"https://researchonline.jcu.edu.au/41861/1/Hobbelink_et_%20al-2015-Progress_%20in_%20Orthodontics%2016.pdf","pmh_id":"oai:researchonline.jcu.edu.au:41861","is_best":false,"license":"cc-by","oa_date":null,"updated":"2020-10-02T21:36:03.353114","version":"acceptedVersion","evidence":"oa repository (via OAI-PMH doi match)","host_type":"repository","endpoint_id":"fs4fwvjhwujmmpdysncr","url_for_pdf":"https://researchonline.jcu.edu.au/41861/1/Hobbelink_et_%20al-2015-Progress_%20in_%20Orthodontics%2016.pdf","url_for_landing_page":"https://researchonline.jcu.edu.au/41861/1/Hobbelink_et_%20al-2015-Progress_%20in_%20Orthodontics%2016.pdf","repository_institution":"James Cook University - ResearchOnline at James Cook University"}],"data_standard":2,"journal_is_oa":true,"journal_issns":"2196-1042","journal_issn_l":"2196-1042","published_date":"2015-10-26","best_oa_location":{"url":"https://doi.org/10.1186/s40510-015-0109-6","pmh_id":null,"is_best":true,"license":"cc-by","oa_date":"2015-10-26","updated":"2020-11-01T19:27:40.270925","version":"publishedVersion","evidence":"oa journal (via doaj)","host_type":"publisher","endpoint_id":null,"url_for_pdf":null,"url_for_landing_page":"https://doi.org/10.1186/s40510-015-0109-6","repository_institution":null},"first_oa_location":{"url":"https://doi.org/10.1186/s40510-015-0109-6","pmh_id":null,"is_best":true,"license":"cc-by","oa_date":"2015-10-26","updated":"2020-11-01T19:27:40.270925","version":"publishedVersion","evidence":"oa journal (via doaj)","host_type":"publisher","endpoint_id":null,"url_for_pdf":null,"url_for_landing_page":"https://doi.org/10.1186/s40510-015-0109-6","repository_institution":null},"journal_is_in_doaj":true,"has_repository_copy":true}
// {"doi":"10.14393/ufu.di.2018.728","year":null,"genre":"dissertation","is_oa":false,"title":"Qualidade do solo em local de disposição inadequada de resíduos sólidos em um município de pequeno porte","doi_url":"https://doi.org/10.14393/ufu.di.2018.728","updated":"2020-10-29T18:43:15.096282","oa_status":"closed","publisher":"EDUFU - Editora da Universidade Federal de Uberlandia","z_authors":[{"given":"Daniela","family":"Rezende","sequence":"first"}],"is_paratext":false,"journal_name":null,"oa_locations":[],"data_standard":2,"journal_is_oa":false,"journal_issns":null,"journal_issn_l":null,"published_date":null,"best_oa_location":null,"first_oa_location":null,"journal_is_in_doaj":false,"has_repository_copy":false}

  after(async () => {
    await deleteIndex('unpaywall');
    await deleteIndex('task');
    await deleteFile('fake1.jsonl.gz');
    await deleteFile('fake2.jsonl.gz');
    await deleteFile('fake3.jsonl.gz');
  });
});
