const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const api = require('../app');
// const fakeUnpaywall = require('../../fakeUnpaywall/app');
const client = require('../lib/client');

chai.should();
chai.use(chaiHttp);

describe('test weekly update', () => {
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

  describe('/update weekly update', async () => {
    it('should return the process start', async () => {
      const server = 'http://localhost:8080';
      const response = await chai.request(server)
        .post('/update')
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json')

      // test responses
      response.should.have.status(200);
      response.body.should.have.property('message');
      response.body.message.should.be.equal('weekly update has begun, list of task has been created on elastic');
    });

    // test if all datas be inserted
    it('should insert 2000 datas', async () => {
      let data;
      while (data?.body?.count !== 2000) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        try {
          data = await client.count({
            index: 'unpaywall',
          });
        } catch (err) {
          console.log(err);
        }
      }
      await expect(data.body.count).to.equal(2000);

      // test if task is update
      let data2
      try {
        data2 = await client.search({
          index: 'task',
        });
      } catch (err) {
        console.log(err);
      }
      console.log('================')
      console.log(data2.body.hits.hits[0]._source);
      console.log('================')
      data2.body.hits.hits[0]._source.should.have.property('done');
      data2.body.hits.hits[0]._source.should.have.property('currentTask');
      data2.body.hits.hits[0]._source.should.have.property('steps');
      data2.body.hits.hits[0]._source.steps[0].should.have.property('task');
      data2.body.hits.hits[0]._source.steps[0].should.have.property('took');
      data2.body.hits.hits[0]._source.steps[0].should.have.property('status');

      data2.body.hits.hits[0]._source.steps[1].should.have.property('task');
      data2.body.hits.hits[0]._source.steps[1].should.have.property('file');
      data2.body.hits.hits[0]._source.steps[1].should.have.property('percent');
      data2.body.hits.hits[0]._source.steps[1].should.have.property('lineRead');
      data2.body.hits.hits[0]._source.steps[1].should.have.property('took');
      data2.body.hits.hits[0]._source.steps[1].should.have.property('status');

      data2.body.hits.hits[0]._source.done.should.be.equal(true);
      data2.body.hits.hits[0]._source.currentTask.should.be.equal('end');
      data2.body.hits.hits[0]._source.steps[0].task.should.be.equal('fetchUnpaywall');
      data2.body.hits.hits[0]._source.steps[0].status.should.be.equal('success');

      data2.body.hits.hits[0]._source.steps[1].task.should.be.equal('insert');
      data2.body.hits.hits[0]._source.steps[1].file.should.be.equal('fake1.jsonl.gz');
      data2.body.hits.hits[0]._source.steps[1].percent.should.be.equal(100);
      data2.body.hits.hits[0]._source.steps[1].lineRead.should.be.equal(2000);
      data2.body.hits.hits[0]._source.steps[1].status.should.be.equal('success');


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
      } catch (err) { }

      if (res.body != false) {
        console.log('Index wasn\'t deleted, the next tests will lapse')
      }
    });
  });
});
