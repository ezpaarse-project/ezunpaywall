const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const unpaywallEnrichedMapping = require('../../mapping/unpaywall.json');
const unpaywallHistoryMapping = require('../../mapping/unpaywall-history.json');

const {
  countDocuments,
  insertHistoryDataUnpaywall,
  deleteIndex,
  getAllData,
  createIndex,
} = require('./utils/elastic');

const adminURL = process.env.ADMIN_URL || 'http://localhost:59703';

chai.use(chaiHttp);

describe('Test: rollback history test', () => {
  const date1 = '2020-01-04T01:00:00.000';
  const date2 = '2020-01-03T01:00:00.000';
  const date3 = '2020-01-02T01:00:00.000';
  const date4 = '2020-01-01T01:00:00.000';

  describe(`Rollback: history rollback at ${date1}`, () => {
    before(async () => {
      await deleteIndex('unpaywall-base');
      await deleteIndex('unpaywall-history');
      await createIndex('unpaywall-base', unpaywallEnrichedMapping);
      await createIndex('unpaywall-history', unpaywallHistoryMapping);
      await insertHistoryDataUnpaywall();
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(adminURL)
        .post('/job/history/reset')
        .send({
          startDate: date1,
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should get state with all information', async () => {
      const res = await chai.request(adminURL)
        .post('/job/history/reset')
        .send({
          startDate: date1,
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should get report with all information', async () => {
      const res = await chai.request(adminURL)
        .post('/job/history/reset')
        .send({
          startDate: date1,
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should get unpaywall data', async () => {
      const count1 = await countDocuments('unpaywall-base');
      expect(count1).to.equal(2);

      const count2 = await countDocuments('unpaywall-history');
      expect(count2).to.equal(4);

      const data = await getAllData('unpaywall-base');

      data.forEach((e) => {
        expect(e.genre).to.equal('v3');
      });
    });

    after(async () => {
      await deleteIndex('unpaywall-base');
      await deleteIndex('unpaywall-history');
    });
  });

  describe(`Rollback: history rollback at ${date2}`, () => {
    before(async () => {
      await deleteIndex('unpaywall-base');
      await deleteIndex('unpaywall-history');
      await createIndex('unpaywall-base', unpaywallEnrichedMapping);
      await createIndex('unpaywall-history', unpaywallHistoryMapping);
      await insertHistoryDataUnpaywall();
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(adminURL)
        .post('/job/history/reset')
        .send({
          startDate: date2,
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should get unpaywall data', async () => {
      const count1 = await countDocuments('unpaywall-base');
      expect(count1).to.equal(2);

      const count2 = await countDocuments('unpaywall-history');
      expect(count2).to.equal(2);

      const data = await getAllData('unpaywall-base');

      data.forEach((e) => {
        expect(e.genre).to.equal('v2');
      });
    });

    after(async () => {
      await deleteIndex('unpaywall-base');
      await deleteIndex('unpaywall-history');
    });
  });

  describe(`Rollback: history rollback at ${date3}`, () => {
    before(async () => {
      await deleteIndex('unpaywall-base');
      await deleteIndex('unpaywall-history');
      await createIndex('unpaywall-base', unpaywallEnrichedMapping);
      await createIndex('unpaywall-history', unpaywallHistoryMapping);
      await insertHistoryDataUnpaywall();
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(adminURL)
        .post('/job/history/reset')
        .send({
          startDate: date3,
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should get unpaywall data', async () => {
      const count1 = await countDocuments('unpaywall-base');
      expect(count1).to.equal(2);

      const count2 = await countDocuments('unpaywall-history');
      expect(count2).to.equal(0);

      const data = await getAllData('unpaywall-base');

      data.forEach((e) => {
        expect(e.genre).to.equal('v1');
      });
    });

    after(async () => {
      await deleteIndex('unpaywall-base');
      await deleteIndex('unpaywall-history');
    });
  });

  describe(`Rollback: history rollback at ${date4}`, () => {
    before(async () => {
      await deleteIndex('unpaywall-base');
      await deleteIndex('unpaywall-history');
      await createIndex('unpaywall-base', unpaywallEnrichedMapping);
      await createIndex('unpaywall-history', unpaywallHistoryMapping);
      await insertHistoryDataUnpaywall();
    });

    it('Should return a status code 202', async () => {
      const res = await chai.request(adminURL)
        .post('/job/history/reset')
        .send({
          startDate: date4,
        })
        .set('x-api-key', 'changeme');

      expect(res).have.status(202);
    });

    it('Should get unpaywall data', async () => {
      const count1 = await countDocuments('unpaywall-base');
      expect(count1).to.equal(0);

      const count2 = await countDocuments('unpaywall-history');
      expect(count2).to.equal(0);
    });

    after(async () => {
      await deleteIndex('unpaywall-base');
      await deleteIndex('unpaywall-history');
    });
  });
});
