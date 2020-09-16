const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../app');

chai.should();
chai.use(chaiHttp);

const doi1 = '10.1901/jaba.2006.153-04';
const doi2 = '10.1128/aac.01305-10';

// TODO faire un elaticsearch
describe('test API', () => {
  it('It should get empty tab because doi not found on database', async () => {
    const response = await chai.request(server)
      .get('/graphql?query={getDatasUPW(dois:["Coin Coin"]){doi, is_oa, genre, oa_status}}');
    response.should.have.status(200);
    response.body.data.getDatasUPW.should.be.an('array');
    response.body.data.getDatasUPW.should.eql([]);
  });

  describe('get datas UnPayWall with more dois', () => {
    it('It should get 2 datas', async () => {
      const response = await chai.request(server)
        .get(`/graphql?query={getDatasUPW(dois:["${doi1}","${doi2}"]){doi, is_oa, genre, oa_status}}`);
      response.should.have.status(200);
      response.body.data.getDatasUPW.should.be.a('array');
      response.body.data.getDatasUPW[0].should.have.property('is_oa').eq(true);
      response.body.data.getDatasUPW[1].should.have.property('is_oa').eq(false);
    });

    it('It should get 1 data', async () => {
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
