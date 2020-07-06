const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../app');
const database = require('../database/database');
const UnPayWallModel = require('../api/graphql/unpaywall/model');

chai.should();
chai.use(chaiHttp);

const dataTest1 = require('./dataTest1.json');
const dataTest2 = require('./dataTest2.json');

function insertDataTest(data) {
  UnPayWallModel.create({
    best_of_location: data.best_of_location,
    data_standard: data.data_standard,
    doi: data.doi,
    doi_url: data.doi_url,
    genre: data.genre,
    is_paratext: data.is_paratext,
    is_oa: data.is_oa,
    journal_is_in_doaj: data.journal_is_in_doaj,
    journal_is_oa: data.journal_is_,
    journal_issns: data.journal_issns,
    journal_issn: data.journal_issn,
    journal_name: data.journal_name,
    oa_locations: data.oa_locations,
    oa_status: data.oa_status,
    published_date: data.published_date,
    publisher: data.publisher,
    title: data.title,
    updated: data.updated,
    year: data.year,
    z_authors: data.z_authors,
  });
}

function deleteDataTest(doi) {
  UnPayWallModel.destroy({
    where: {
      doi,
    },
  });
}

describe('test API', () => {
  before(async () => {
    await database.authenticate();
    await insertDataTest(dataTest1);
    await insertDataTest(dataTest2);
  });

  describe('insert datatest on database and test if it possible to get one by one', () => {
    it('should insert first data', async () => {
      const response = await chai.request(server)
        .get(`/graphql?query={getDatasUPW(dois:["${dataTest1.doi}"]){doi, is_oa, genre, oa_status}}`);
      response.should.have.status(200);
      response.body.data.getDatasUPW.should.be.a('array');
      response.body.data.getDatasUPW[0].should.have.property('doi').eq('doi-test1');
      response.body.data.getDatasUPW[0].should.have.property('is_oa').eq(true);
    });

    it('should insert second data', async () => {
      const response = await chai.request(server)
        .get(`/graphql?query={getDatasUPW(dois:["${dataTest2.doi}"]){doi, is_oa, genre, oa_status}}`);
      response.should.have.status(200);
      response.body.data.getDatasUPW.should.be.a('array');
      response.body.data.getDatasUPW[0].should.have.property('doi').eq('doi-test2');
      response.body.data.getDatasUPW[0].should.have.property('is_oa').eq(false);
    });

    it('It should get empty tab because doi not found on database', async () => {
      const response = await chai.request(server)
        .get('/graphql?query={getDatasUPW(dois:["Coin Coin"]){doi, is_oa, genre, oa_status}}');
      response.should.have.status(200);
      response.body.data.getDatasUPW.should.be.an('array');
      response.body.data.getDatasUPW.should.eql([]);
    });
  });

  describe('get datas UnPayWall with more dois', () => {
    it('It should get 2 datas', async () => {
      const response = await chai.request(server)
        .get(`/graphql?query={getDatasUPW(dois:["${dataTest1.doi}","${dataTest2.doi}"]){doi, is_oa, genre, oa_status}}`);
      response.should.have.status(200);
      response.body.data.getDatasUPW.should.be.a('array');
      response.body.data.getDatasUPW[0].should.have.property('is_oa').eq(true);
      response.body.data.getDatasUPW[1].should.have.property('is_oa').eq(false);
    });

    it('It should get 1 data', async () => {
      const response = await chai.request(server)
        .get(`/graphql?query={getDatasUPW(dois:["${dataTest1.doi}","Coin Coin"]){doi, is_oa, genre, oa_status}}`);
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

  describe('delete datatest and verify if their be deleted', () => {
    it('should return empty tab', async () => {
      await deleteDataTest(dataTest1.doi);
      const response = await chai.request(server)
        .get(`/graphql?query={getDatasUPW(dois:["${dataTest1.doi}"]){doi, is_oa, genre, oa_status}}`);
      response.should.have.status(200);
      response.body.data.getDatasUPW.should.be.an('array');
      response.body.data.getDatasUPW.should.eql([]);
    });

    it('should return empty tab', async () => {
      await deleteDataTest(dataTest2.doi);
      const response = await chai.request(server)
        .get(`/graphql?query={getDatasUPW(dois:["${dataTest2.doi}"]){doi, is_oa, genre, oa_status}}`);
      response.should.have.status(200);
      response.body.data.getDatasUPW.should.be.an('array');
      response.body.data.getDatasUPW.should.eql([]);
    });
  });
});
