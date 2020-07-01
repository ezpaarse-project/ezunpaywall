const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../app');
const database = require('../database/database');
const UnPayWallModel = require('../api/unpaywall/model');

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

// const metadatas = [
//   'data_standard',
//   'doi',
//   'genre',
//   'is_paratext',
//   'is_oa',
//   'journal_is_in_doaj',
//   'journal_is_oa',
//   'journal_issns',
//   'journal_name',
//   'oa_locations',
//   'best_oa_location',
//   'oa_status',
//   'published_date',
//   'publisher',
//   'title',
//   'updated',
//   'year',
//   'z_authors',
//   'journal_issn_l',
// ];

describe('test API', () => {
  describe('Connect to database postgresql', () => {
    it('should connected to database postgres', (done) => {
      database.authenticate()
        .then(() => done())
        .catch((err) => done(err));
    });
  });

  describe('insert datatest on database and test if it possible to get one by one', () => {
    it('should insert first data', (done) => {
      insertDataTest(dataTest1);
      chai.request(server)
        .get(`/graphql?query={getDatasUPW(dois:["${dataTest1.doi}"]){doi, is_oa, genre, oa_status}}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.data.getDatasUPW.should.be.a('array');
          response.body.data.getDatasUPW[0].should.have.property('doi').eq('doi-test1');
          response.body.data.getDatasUPW[0].should.have.property('is_oa').eq(true);
          done();
        });
    });

    it('should insert second data', (done) => {
      insertDataTest(dataTest2);
      chai.request(server)
        .get(`/graphql?query={getDatasUPW(dois:["${dataTest2.doi}"]){doi, is_oa, genre, oa_status}}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.data.getDatasUPW.should.be.a('array');
          response.body.data.getDatasUPW[0].should.have.property('doi').eq('doi-test2');
          response.body.data.getDatasUPW[0].should.have.property('is_oa').eq(false);
          done();
        });
    });

    it('It should get empty tab because doi not found on database', (done) => {
      chai.request(server)
        .get('/graphql?query={getDatasUPW(dois:["Coin Coin"]){doi, is_oa, genre, oa_status}}')
        .end((err, response) => {
          response.should.have.status(200);
          response.body.data.getDatasUPW.should.be.an('array');
          response.body.data.getDatasUPW.should.eql([]);
          done();
        });
    });
  });

  describe('get datas UnPayWall with more dois', () => {
    it('It should get 2 datas', (done) => {
      chai.request(server)
        .get(`/graphql?query={getDatasUPW(dois:["${dataTest1.doi}","${dataTest2.doi}"]){doi, is_oa, genre, oa_status}}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.data.getDatasUPW.should.be.a('array');
          response.body.data.getDatasUPW[0].should.have.property('is_oa').eq(true);
          response.body.data.getDatasUPW[1].should.have.property('is_oa').eq(false);
          done();
        });
    });

    it('It should get 1 data', (done) => {
      chai.request(server)
        .get(`/graphql?query={getDatasUPW(dois:["${dataTest1.doi}","Coin Coin"]){doi, is_oa, genre, oa_status}}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.data.getDatasUPW.should.be.a('array');
          response.body.data.getDatasUPW[0].should.have.property('is_oa').eq(true);
          done();
        });
    });

    it('It should get empty tab', (done) => {
      chai.request(server)
        .get('/graphql?query={getDatasUPW(dois:["Coin Coin","Coin Coin2"]){doi, is_oa, genre, oa_status}}')
        .end((err, response) => {
          response.should.have.status(200);
          response.body.data.getDatasUPW.should.be.an('array');
          response.body.data.getDatasUPW.should.eql([]);
          done();
        });
    });
  });

  describe('delete datatest and verify if their be deleted', () => {
    it('should return empty tab', (done) => {
      deleteDataTest(dataTest1.doi);
      chai.request(server)
        .get(`/graphql?query={getDatasUPW(dois:["${dataTest1.doi}"]){doi, is_oa, genre, oa_status}}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.data.getDatasUPW.should.be.an('array');
          response.body.data.getDatasUPW.should.eql([]);
          done();
        });
    });

    it('should return empty tab', (done) => {
      deleteDataTest(dataTest2.doi);
      chai.request(server)
        .get(`/graphql?query={getDatasUPW(dois:["${dataTest2.doi}"]){doi, is_oa, genre, oa_status}}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.data.getDatasUPW.should.be.an('array');
          response.body.data.getDatasUPW.should.eql([]);
          done();
        });
    });
  });
});
