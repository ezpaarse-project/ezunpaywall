const chai = require('chai');
const chaiHttp = require('chai-http');

const client = require('../lib/client');

chai.should();
chai.use(chaiHttp);

const { processLogger } = require('../lib/logger');

describe('Test api ez-unpaywall ', () => {

  const server = 'http://localhost:8080';

  const doi1 = '10.1016/j.ygcen.2017.01.004'; // ligne 1 of fake1.jsonl.gz
  const doi2 = '10.1002/ange.200460179'; // line 1937 of fake1.jsonl.gz

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
  });

  describe(`get unpaywall data with one DOI`, () => {
    it('should get unpaywall data', async () => {
      const response = await chai.request(server)
        .get(`/graphql?query={getDatasUPW(dois:["${doi1}"]){doi, is_oa, genre, oa_status}}`);
      response.should.have.status(200);
      response.body.data.getDatasUPW.should.be.a('array');
      response.body.data.getDatasUPW[0].should.have.property('doi').eq(doi1);
      response.body.data.getDatasUPW[0].should.have.property('is_oa').eq(true);
    });

    it('It should get empty tab because doi not found on database', async () => {
      const response = await chai.request(server)
        .get('/graphql?query={getDatasUPW(dois:["Coin Coin"]){doi, is_oa, genre, oa_status}}');
      response.should.have.status(200);
      response.body.data.getDatasUPW.should.be.an('array');
      response.body.data.getDatasUPW.should.eql([]);
    });
  });

  describe('get unpaywall data with two DOI', () => {
    it('should get unpaywall datas', async () => {
      const response = await chai.request(server)
        .get(`/graphql?query={getDatasUPW(dois:["${doi1}","${doi2}"]){doi, is_oa, genre, oa_status}}`);
      response.should.have.status(200);
      response.body.data.getDatasUPW.should.be.a('array');
      response.body.data.getDatasUPW[0].should.have.property('is_oa').eq(true);
      response.body.data.getDatasUPW[1].should.have.property('is_oa').eq(false);
    });

    it('should get unpaywall data', async () => {
      const response = await chai.request(server)
        .get(`/graphql?query={getDatasUPW(dois:["${doi1}","Coin Coin"]){doi, is_oa, genre, oa_status}}`);
      response.should.have.status(200);
      response.body.data.getDatasUPW.should.be.a('array');
      response.body.data.getDatasUPW[0].should.have.property('is_oa').eq(true);
    });

    it('It should get empty tab', async () => {
      const response = await chai.request(server)
        .get('/graphql?query={getDatasUPW(dois:["Coin Coin","Coin Coin2"]){doi, is_oa, genre, oa_status}}');
      response.should.have.status(200);
      response.body.data.getDatasUPW.should.be.an('array');
      response.body.data.getDatasUPW.should.eql([]);
    });
  });
});