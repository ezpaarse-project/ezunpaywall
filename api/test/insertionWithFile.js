const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const api = require('../app');
// const fakeUnpaywall = require('../../fakeUnpaywall/app');
const client = require('../lib/client');

chai.should();
chai.use(chaiHttp);
// TODO date des fichier à jour

describe('test /update', () => {
  before(async () => {
    // wait ezunpaywall
    await new Promise((resolve) => api.on('ready', resolve()));
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
  });

  describe('/update/fake1.jsonl.gz insert a file already installed', async () => {
    it('should return the process start', async () => {
      const server = 'http://localhost:8080';
      const response = await chai.request(server)
        .post('/update/fake1.jsonl.gz')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
      response.should.have.status(200);
      response.body.should.have.property('message');
      response.body.message.should.be.equal('start upsert with fake1.jsonl.gz');
    });

    it('should insert 2000 datas', async () => {
      let data;
      while (data?.body?.count !== 2000) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        try {
          data = await client.count({
            index: 'unpaywall',
          });
        } catch (err) { }
      }
      await expect(data.body.count).to.equal(2000)
    });

    after(async () => {
      try {
        await client.indices.delete({
          index: 'unpaywall',
        });
      } catch (err) {}

      try {
        await client.indices.delete({
          index: 'task',
        });
      } catch (err) {}

      let res;
      try {
        res = await client.indices.exists({
          index: 'unpaywall',
        });
      } catch (err) {}

      if (res.body != false) {
        console.log('Index wasn\'t deleted, the next tests will lapse')
      }
    });
  });

  describe('/update/fake1.jsonl try to insert a file that is in the wrong format', async () => {
    it('should return a error message', async () => {
      const server = 'http://localhost:8080';
      const response = await chai.request(server)
        .post('/update/fake1.jsonl')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
      response.should.have.status(400);
      response.body.should.have.property('message');
      response.body.message.should.be.equal('name of file is in bad format (accepted a .gz file)');
    });
  });

  describe('/update/fileDoesntExist.jsonl.gz try to insert a file that does not exist', async () => {
    it('should return a error message', async () => {
      const server = 'http://localhost:8080';
      const response = await chai.request(server)
        .post('/update/fileDoesntExist.jsonl.gz')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
      response.should.have.status(404);
      response.body.should.have.property('message');
      response.body.message.should.be.equal('file doesn\'t exist');
    });
  });

  describe('/update/fake1.jsonl.gz?offset=100&limit=50 try to insert a file that does not exist', async () => {
    it('should return a error message', async () => {
      const server = 'http://localhost:8080';
      const response = await chai.request(server)
        .post('/update/fake1.jsonl.gz?offset=100&limit=50')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
      response.should.have.status(400);
      response.body.should.have.property('message');
      response.body.message.should.be.equal('limit can\t be lower than offset or 0');
    });
  });

  describe('/update/fake1.jsonl.gz?limit=100 insert a file already installed with limit 100', async () => {
    it('should return the process start', async () => {
      const server = 'http://localhost:8080';
      const response = await chai.request(server)
        .post('/update/fake1.jsonl.gz?limit=100')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
      response.should.have.status(200);
      response.body.should.have.property('message');
      response.body.message.should.be.equal('start upsert with fake1.jsonl.gz');
    });

    it('should insert 100 datas', async () => {
      let data;
      while (data?.body?.count !== 100) {

        await new Promise((resolve) => setTimeout(resolve, 1000));
        try {
          data = await client.count({
            index: 'unpaywall',
          });
        } catch (err) { }
      }
      await expect(data.body.count).to.equal(100)
    });

    after(async () => {
      try {
        await client.indices.delete({
          index: 'unpaywall',
        });
      } catch (err) {}

      try {
        await client.indices.delete({
          index: 'task',
        });
      } catch (err) {}

      let res;
      try {
        res = await client.indices.exists({
          index: 'unpaywall',
        });
      } catch (err) {}

      if (res.body != false) {
        console.log('Index wasn\'t deleted, the next tests will lapse')
      }
    });
  });

  describe('/update/fake1.jsonl.gz?offset=1500 insert a file already installed with offset 1500', async () => {
    it('should return the process start', async () => {
      const server = 'http://localhost:8080';
      const response = await chai.request(server)
        .post('/update/fake1.jsonl.gz?offset=500')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
      response.should.have.status(200);
      response.body.should.have.property('message');
      response.body.message.should.be.equal('start upsert with fake1.jsonl.gz');
    });

    it('should insert 1500 datas', async () => {
      let data;
      while (data?.body?.count !== 1500) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        try {
          data = await client.count({
            index: 'unpaywall',
          });
        } catch (err) {
        }
      }
      await expect(data.body.count).to.equal(1500)
    });

    after(async () => {
      try {
        await client.indices.delete({
          index: 'unpaywall',
        });
      } catch (err) {}

      try {
        await client.indices.delete({
          index: 'task',
        });
      } catch (err) {}

      let res;
      try {
        res = await client.indices.exists({
          index: 'unpaywall',
        });
      } catch (err) {}

      if (res.body != false) {
        console.log('Index wasn\'t deleted, the next tests will lapse')
      }
    });
  });

  describe('/update/fake1.jsonl.gz?offset=50&limit=70 insert a file already installed with limit=50 and offset=70', async () => {
    it('should return the process start', async () => {
      const server = 'http://localhost:8080';
      const response = await chai.request(server)
        .post('/update/fake1.jsonl.gz?offset=50&limit=70')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')
      response.should.have.status(200);
      response.body.should.have.property('message');
      response.body.message.should.be.equal('start upsert with fake1.jsonl.gz');
    });

    it('should insert 20 datas', async () => {
      let data;
      while (data?.body?.count !== 20) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        try {
          data = await client.count({
            index: 'unpaywall',
          });
        } catch (err) {
        }
      }
      await expect(data.body.count).to.equal(20)
    });

    after(async () => {
      try {
        await client.indices.delete({
          index: 'unpaywall',
        });
      } catch (err) {}

      try {
        await client.indices.delete({
          index: 'task',
        });
      } catch (err) {}

      let res;

      try {
        res = await client.indices.exists({
          index: 'unpaywall',
        });
      } catch (err) {}

      if (res.body != false) {
        console.log('Index wasn\'t deleted, the next tests will lapse')
      }
    });
  });
});
