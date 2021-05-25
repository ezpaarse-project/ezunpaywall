/* eslint-disable no-await-in-loop */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const indexUnpawall = require('../index/unpaywall.json');

const client = require('../lib/client');
const { logger } = require('../lib/logger');

const {
  deleteIndex,
  createIndex,
  countDocuments,
  isInUpdate,
} = require('./utils/update');

const {
  initializeDate,
  deleteFile,
} = require('./utils/file');

chai.use(chaiHttp);

describe('test graphqlRequest update', () => {
  const ezunpaywallURL = process.env.EZUNPAYWALL_URL;
  const fakeUnpaywallURL = process.env.FAKE_UNPAYWALL_URL;

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
    await deleteFile('fake2.jsonl.gz');
    await deleteFile('fake3.jsonl.gz');
  });

  describe('Test: weekly update route test', () => {
    describe('Do a classic weekly update', () => {
      before(async () => {
        await createIndex('unpaywall', indexUnpawall);
      });

      // test res
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
        let isUpdate = true;
        while (isUpdate) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          isUpdate = await isInUpdate();
        }
        const count = await countDocuments();
        expect(count).to.equal(50);
      });
    });

    describe('get unpaywall data with one DOI', () => {
      it('should get unpaywall data', async () => {
        const res = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"]){doi, is_oa}}`);

        expect(res).have.status(200);

        const data = res?.body?.data?.getDataUPW;
        expect(data).be.a('array');
        expect(data[0]).have.property('doi').eq(doi1);
        expect(data[0]).have.property('is_oa').eq(true);
      });

      it('It should get empty tab because doi not found on database', async () => {
        const res = await chai.request(ezunpaywallURL)
          .get('/graphql?query={getDataUPW(dois:["Coin Coin"]){doi, is_oa}}');
        expect(res).have.status(200);

        const data = res?.body?.data?.getDataUPW;
        expect(data).be.an('array');
        expect(data).eql([]);
      });
    });

    describe('get unpaywall data with two DOI', () => {
      it('should get unpaywall data', async () => {
        const res = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}","${doi2}"]){doi, is_oa}}`);
        expect(res).have.status(200);

        const data = res?.body?.data?.getDataUPW;
        expect(data).be.a('array');
        expect(data[0]).have.property('is_oa').eq(true);
        expect(data[1]).have.property('is_oa').eq(false);
      });

      it('should get unpaywall data', async () => {
        const res = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}","Coin Coin"]){doi, is_oa}}`);
        expect(res).have.status(200);

        const data = res?.body?.data?.getDataUPW;
        expect(data).be.a('array');
        expect(data[0]).have.property('is_oa').eq(true);
      });

      it('It should get empty tab', async () => {
        const res = await chai.request(ezunpaywallURL)
          .get('/graphql?query={getDataUPW(dois:["Coin Coin","Coin Coin2"]){doi, is_oa}}');
        expect(res).have.status(200);

        const data = res?.body?.data?.getDataUPW;
        expect(data).be.a('array').eql([]);
      });
    });

    describe('get unpaywall data with one DOI and year', () => {
      it('should get unpaywall data', async () => {
        const res = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], year:"2015"){doi, is_oa, year}}`);
        expect(res).have.status(200);

        const data = res?.body?.data?.getDataUPW;
        expect(data).be.a('array');
        expect(data[0]).have.property('doi').eq(doi1);
        expect(data[0]).have.property('is_oa').eq(true);
        expect(data[0]).have.property('year').eq('2015');
      });

      it('should get unpaywall data', async () => {
        const res = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}","${doi2}"], year:"2015"){doi, is_oa, year}}`);
        expect(res).have.status(200);

        const data = res?.body?.data?.getDataUPW;
        expect(data).be.a('array');
        expect(data[0]).have.property('doi').eq(doi1);
        expect(data[0]).have.property('is_oa').eq(true);
        expect(data[0]).have.property('year').eq('2015');
      });

      it('It should get empty tab', async () => {
        const res = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], year:"2016"){doi, is_oa, year}}`);
        expect(res).have.status(200);

        const data = res?.body?.data?.getDataUPW;
        expect(data).be.a('array').eql([]);
      });
    });

    describe('get unpaywall data with one DOI and range_year', () => {
      it('should get unpaywall data', async () => {
        const res = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], year_range:{gte:"2014"}){doi, is_oa, year}}`);
        expect(res).have.status(200);

        const data = res?.body?.data?.getDataUPW;
        expect(data).be.a('array');
        expect(data[0]).have.property('doi').eq(doi1);
        expect(data[0]).have.property('is_oa').eq(true);
        expect(data[0]).have.property('year').eq('2015');
      });

      it('should get unpaywall data', async () => {
        const res = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], year_range:{gte:"2015"}){doi, is_oa, year}}`);
        expect(res).have.status(200);

        const data = res?.body?.data?.getDataUPW;
        expect(data).be.a('array');
        expect(data[0]).have.property('doi').eq(doi1);
        expect(data[0]).have.property('is_oa').eq(true);
        expect(data[0]).have.property('year').eq('2015');
      });

      it('It should get empty tab', async () => {
        const res = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], year_range:{gte:"2016"}){doi, is_oa, year}}`);
        expect(res).have.status(200);

        const data = res?.body?.data?.getDataUPW;
        expect(data).be.a('array').eql([]);
      });

      it('should get unpaywall data', async () => {
        const res = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], year_range:{lte:"2016"}){doi, is_oa, year}}`);
        expect(res).have.status(200);

        const data = res?.body?.data?.getDataUPW;
        expect(data).be.a('array');
        expect(data[0]).have.property('doi').eq(doi1);
        expect(data[0]).have.property('is_oa').eq(true);
        expect(data[0]).have.property('year').eq('2015');
      });

      it('should get unpaywall data', async () => {
        const res = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], year_range:{lte:"2015"}){doi, is_oa, year}}`);
        expect(res).have.status(200);

        const data = res?.body?.data?.getDataUPW;
        expect(data).be.a('array');
        expect(data[0]).have.property('doi').eq(doi1);
        expect(data[0]).have.property('is_oa').eq(true);
        expect(data[0]).have.property('year').eq('2015');
      });

      it('It should get empty tab', async () => {
        const res = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], year_range:{lte:"2014"}){doi, is_oa, year}}`);
        expect(res).have.status(200);

        const data = res?.body?.data?.getDataUPW;
        expect(data).be.a('array').eql([]);
      });

      it('should get unpaywall data', async () => {
        const res = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], year_range:{gte:"2014" lte:"2016"}){doi, is_oa, year}}`);
        expect(res).have.status(200);

        const data = res?.body?.data?.getDataUPW;
        expect(data).be.a('array');
        expect(data[0]).have.property('doi').eq(doi1);
        expect(data[0]).have.property('is_oa').eq(true);
        expect(data[0]).have.property('year').eq('2015');
      });

      it('It should get empty tab', async () => {
        const res = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], year_range:{gte:"2016", lte:"2018"}){doi, is_oa, year}}`);
        expect(res).have.status(200);

        const data = res?.body?.data?.getDataUPW;
        expect(data).be.a('array').eql([]);
      });
    });

    describe('get unpaywall data with one DOI and best_oa_location:{licence}', () => {
      it('should get unpaywall data', async () => {
        const res = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], best_oa_location:{license: "cc-by"}){doi, is_oa, best_oa_location {license}}}`);
        expect(res).have.status(200);

        const data = res?.body?.data?.getDataUPW;
        expect(data).be.a('array');
        expect(data[0]).have.property('doi').eq(doi1);
        expect(data[0]).have.property('is_oa').eq(true);
        expect(data[0]).have.property('best_oa_location').have.property('license').eq('cc-by');
      });

      it('It should get empty tab', async () => {
        const res = await chai.request(ezunpaywallURL)
          .get(`/graphql?query={getDataUPW(dois:["${doi1}"], best_oa_location:{license: "coin coin"}){doi, is_oa, best_oa_location {license}}}`);
        expect(res).have.status(200);

        const data = res?.body?.data?.getDataUPW;
        expect(data).be.a('array').eql([]);
      });
    });
  });
  after(async () => {
    await deleteIndex('unpaywall');
    await deleteFile('fake1.jsonl.gz');
    await deleteFile('fake2.jsonl.gz');
    await deleteFile('fake3.jsonl.gz');
  });
});
