/* eslint-disable no-await-in-loop */
const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs-extra');
const path = require('path');
const mappingUnpaywall = require('./mapping/unpaywall.json');

chai.use(chaiHttp);

const {
  binaryParser,
  compareFile,
} = require('./utils/file');

const {
  createIndex,
  deleteIndex,
  insertDataUnpaywall,
  countDocuments,
} = require('./utils/elastic');

const ping = require('./utils/ping');

const {
  loadDevAPIKey,
  deleteAllAPIKey,
} = require('./utils/apikey');

const enrichHost = process.env.ENRICH_HOST || 'http://localhost:59703';
const enrichDir = path.resolve(__dirname, 'sources');

describe('Test: enrich service csv', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
    await deleteAllAPIKey();
    await loadDevAPIKey();
    await deleteIndex('unpaywall-test');
    await createIndex('unpaywall-test', mappingUnpaywall);
    await insertDataUnpaywall();
    const ndData = await countDocuments('unpaywall-test');
    expect(ndData).eq(50);
  });

  describe('Test: enrichment with a csv file', () => {
    describe('Do a enrichment of a csv file with all unpaywall attributes', () => {
      let id;
      let enrichedFile;

      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichHost)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
          .set('Content-Type', 'text/csv')
          .set('x-api-key', 'user');

        expect(res1).have.status(200);

        id = res1?.body;
      });

      it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
        // start enrich process
        const res2 = await chai
          .request(enrichHost)
          .post(`/job/${id}`)
          .send({
            type: 'csv',
            index: 'unpaywall-test',
          })
          .set('x-api-key', 'user');

        expect(res2).have.status(200);
      });

      it('Should get the state of enrich', async () => {
        let res3;
        do {
          res3 = await chai
            .request(enrichHost)
            .get(`/states/${id}.json`)
            .set('x-api-key', 'user');
          expect(res3).have.status(200);
          await new Promise((resolve) => setTimeout(resolve, 100));
        } while (!res3?.body?.done);

        const state = res3?.body;

        expect(state).have.property('done').equal(true);
        expect(state).have.property('loaded').to.not.equal(undefined);
        expect(state).have.property('linesRead').equal(3);
        expect(state).have.property('enrichedLines').equal(3);
        expect(state).have.property('createdAt').to.not.equal(undefined);
        expect(state).have.property('endAt').to.not.equal(undefined);
        expect(state).have.property('error').equal(false);
      });

      it('Should download the enrichedfile', async () => {
        const res4 = await chai
          .request(enrichHost)
          .get(`/enriched/${id}.csv`)
          .set('x-api-key', 'user')
          .buffer()
          .parse(binaryParser);

        enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
        try {
          await fs.writeFile(enrichedFile, res4.body.toString());
        } catch (err) {
          console.error(`writeFile: ${err}`);
        }
      });

      it('Should be the same', async () => {
        const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file01.csv');
        const same = await compareFile(reference, enrichedFile);
        expect(same).to.be.equal(true);
      });
    });

    describe('Do a enrichment of a csv file with all unpaywall attributes', () => {
      let id;
      let enrichedFile;

      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichHost)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file02.csv'), 'file02.csv')
          .set('Content-Type', 'text/csv')
          .set('x-api-key', 'user');

        expect(res1).have.status(200);

        id = res1?.body;
      });
      it('Should enrich the file on 2 lines with all unpaywall attributes and download it', async () => {
        const res2 = await chai
          .request(enrichHost)
          .post(`/job/${id}`)
          .send({
            type: 'csv',
            index: 'unpaywall-test',
          })
          .set('x-api-key', 'user');

        expect(res2).have.status(200);
      });

      it('Should get the state of enrich', async () => {
        let res3;

        do {
          res3 = await chai
            .request(enrichHost)
            .get(`/states/${id}.json`)
            .set('x-api-key', 'user');
          expect(res3).have.status(200);
          await new Promise((resolve) => setTimeout(resolve, 100));
        } while (!res3?.body?.done);

        const state = res3?.body;

        expect(state).have.property('done').equal(true);
        expect(state).have.property('loaded').to.not.equal(undefined);
        expect(state).have.property('linesRead').equal(3);
        expect(state).have.property('enrichedLines').equal(2);
        expect(state).have.property('createdAt').to.not.equal(undefined);
        expect(state).have.property('endAt').to.not.equal(undefined);
        expect(state).have.property('error').equal(false);
      });

      it('Should download the enrichedfile', async () => {
        const res4 = await chai
          .request(enrichHost)
          .get(`/enriched/${id}.csv`)
          .set('x-api-key', 'user')
          .buffer()
          .parse(binaryParser);

        enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
        try {
          await fs.writeFile(enrichedFile, res4.body.toString());
        } catch (err) {
          console.error(`writeFile: ${err}`);
        }
      });

      it('Should be the same', async () => {
        const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file02.csv');

        const same = await compareFile(reference, enrichedFile);
        expect(same).to.be.equal(true);
      });
    });

    describe('Do a enrichment of a csv file with some unpaywall attributes (is_oa, best_oa_location.license, z_authors.family)', () => {
      let id;
      let enrichedFile;
      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichHost)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
          .set('Content-Type', 'text/csv')
          .set('x-api-key', 'user');

        expect(res1).have.status(200);

        id = res1?.body;
      });

      it('Should enrich the file on 3 lines with args {is_oa} and download it', async () => {
        const res2 = await chai
          .request(enrichHost)
          .post(`/job/${id}`)
          .send({
            type: 'csv',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('x-api-key', 'user');

        expect(res2).have.status(200);
      });

      it('Should get the state of enrich', async () => {
        let res3;

        do {
          res3 = await chai
            .request(enrichHost)
            .get(`/states/${id}.json`)
            .set('x-api-key', 'user');
          expect(res3).have.status(200);
          await new Promise((resolve) => setTimeout(resolve, 100));
        } while (!res3?.body?.done);

        const state = res3?.body;

        expect(state).have.property('done').equal(true);
        expect(state).have.property('loaded').to.not.equal(undefined);
        expect(state).have.property('linesRead').equal(3);
        expect(state).have.property('enrichedLines').equal(3);
        expect(state).have.property('createdAt').to.not.equal(undefined);
        expect(state).have.property('endAt').to.not.equal(undefined);
        expect(state).have.property('error').equal(false);
      });

      it('Should download the enrichedfile', async () => {
        const res4 = await chai
          .request(enrichHost)
          .get(`/enriched/${id}.csv`)
          .set('x-api-key', 'user')
          .buffer()
          .parse(binaryParser);

        enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
        try {
          await fs.writeFile(enrichedFile, res4.body.toString());
        } catch (err) {
          console.error(`writeFile: ${err}`);
        }
      });

      it('Should be the same', async () => {
        const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file03.csv');

        const same = await compareFile(reference, enrichedFile);
        expect(same).to.be.equal(true);
      });
    });

    describe('Do a enrichment of a csv file with some unpaywall attributes best_oa_location.license', () => {
      let id;
      let enrichedFile;
      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichHost)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
          .set('Content-Type', 'text/csv')
          .set('x-api-key', 'user');

        expect(res1).have.status(200);

        id = res1?.body;
      });

      it('Should enrich the file on 3 lines with args { best_oa_location { license } } and download it', async () => {
        const res2 = await chai
          .request(enrichHost)
          .post(`/job/${id}`)
          .send({
            type: 'csv',
            index: 'unpaywall-test',
            args: '{ best_oa_location { license } }',
          })
          .set('x-api-key', 'user');

        expect(res2).have.status(200);
      });

      it('Should get the state of enrich', async () => {
        let res3;
        do {
          res3 = await chai
            .request(enrichHost)
            .get(`/states/${id}.json`)
            .set('x-api-key', 'user');
          expect(res3).have.status(200);
          await new Promise((resolve) => setTimeout(resolve, 100));
        } while (!res3?.body?.done);

        const state = res3?.body;

        expect(state).have.property('done').equal(true);
        expect(state).have.property('loaded').to.not.equal(undefined);
        expect(state).have.property('linesRead').equal(3);
        expect(state).have.property('enrichedLines').equal(3);
        expect(state).have.property('createdAt').to.not.equal(undefined);
        expect(state).have.property('endAt').to.not.equal(undefined);
        expect(state).have.property('error').equal(false);
      });

      it('Should download the enrichedfile', async () => {
        const res4 = await chai
          .request(enrichHost)
          .get(`/enriched/${id}.csv`)
          .set('x-api-key', 'user')
          .buffer()
          .parse(binaryParser);

        enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
        try {
          await fs.writeFile(enrichedFile, res4.body.toString());
        } catch (err) {
          console.error(`writeFile: ${err}`);
        }
      });

      it('Should be the same', async () => {
        const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file04.csv');

        const same = await compareFile(reference, enrichedFile);
        expect(same).to.be.equal(true);
      });
    });

    describe('Do a enrichment of a csv file with some unpaywall attributes z_authors.given', () => {
      let id;
      let enrichedFile;

      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichHost)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
          .set('Content-Type', 'text/csv')
          .set('x-api-key', 'user');

        expect(res1).have.status(200);

        id = res1?.body;
      });

      it('Should enrich the file on 3 lines with args { z_authors { given } } and download it', async () => {
        const res2 = await chai
          .request(enrichHost)
          .post(`/job/${id}`)
          .send({
            type: 'csv',
            index: 'unpaywall-test',
            args: '{ z_authors { given } }',
          })
          .set('x-api-key', 'user');

        expect(res2).have.status(200);
      });

      it('Should get the state of enrich', async () => {
        let res3;
        do {
          res3 = await chai
            .request(enrichHost)
            .get(`/states/${id}.json`)
            .set('x-api-key', 'user');
          expect(res3).have.status(200);
          await new Promise((resolve) => setTimeout(resolve, 100));
        } while (!res3?.body?.done);

        const state = res3?.body;

        expect(state).have.property('done').equal(true);
        expect(state).have.property('loaded').to.not.equal(undefined);
        expect(state).have.property('linesRead').equal(3);
        expect(state).have.property('enrichedLines').equal(3);
        expect(state).have.property('createdAt').to.not.equal(undefined);
        expect(state).have.property('endAt').to.not.equal(undefined);
        expect(state).have.property('error').equal(false);
      });

      it('Should download the enrichedfile', async () => {
        const res4 = await chai
          .request(enrichHost)
          .get(`/enriched/${id}.csv`)
          .set('x-api-key', 'user')
          .buffer()
          .parse(binaryParser);

        enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
        try {
          await fs.writeFile(enrichedFile, res4.body.toString());
        } catch (err) {
          console.error(`writeFile: ${err}`);
        }
      });

      it('Should be the same', async () => {
        const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file05.csv');

        const same = await compareFile(reference, enrichedFile);
        expect(same).to.be.equal(true);
      });
    });

    describe('Do a enrichment of a csv file with some unpaywall attributes is_oa, best_oa_location.license, z_authors.family', () => {
      let id;
      let enrichedFile;

      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichHost)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
          .set('Content-Type', 'text/csv')
          .set('x-api-key', 'user');

        expect(res1).have.status(200);

        id = res1?.body;
      });

      it('Should enrich the file on 3 lines with args { is_oa, best_oa_location { license }, z_authors { family } } and download it', async () => {
        const res2 = await chai
          .request(enrichHost)
          .post(`/job/${id}`)
          .send({
            type: 'csv',
            index: 'unpaywall-test',
            args: '{ is_oa, best_oa_location { license }, z_authors { family } }',
          })
          .set('x-api-key', 'user');

        expect(res2).have.status(200);
      });

      it('Should get the state of enrich', async () => {
        let res3;
        do {
          res3 = await chai
            .request(enrichHost)
            .get(`/states/${id}.json`)
            .set('x-api-key', 'user');
          expect(res3).have.status(200);
          await new Promise((resolve) => setTimeout(resolve, 100));
        } while (!res3?.body?.done);

        const state = res3?.body;

        expect(state).have.property('done').equal(true);
        expect(state).have.property('loaded').to.not.equal(undefined);
        expect(state).have.property('linesRead').equal(3);
        expect(state).have.property('enrichedLines').equal(3);
        expect(state).have.property('createdAt').to.not.equal(undefined);
        expect(state).have.property('endAt').to.not.equal(undefined);
        expect(state).have.property('error').equal(false);
      });

      it('Should download the enrichedfile', async () => {
        const res4 = await chai
          .request(enrichHost)
          .get(`/enriched/${id}.csv`)
          .set('x-api-key', 'user')
          .buffer()
          .parse(binaryParser);

        enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
        try {
          await fs.writeFile(enrichedFile, res4.body.toString());
        } catch (err) {
          console.error(`writeFile: ${err}`);
        }
      });

      it('Should be the same', async () => {
        const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file06.csv');

        const same = await compareFile(reference, enrichedFile);
        expect(same).to.be.equal(true);
      });
    });

    describe('Do a enrichment of a csv file with all unpaywall attributes and with semi colomn separator', () => {
      let id;
      let enrichedFile;

      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichHost)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
          .set('Content-Type', 'text/csv')
          .set('x-api-key', 'user');

        expect(res1).have.status(200);

        id = res1?.body;
      });

      it('Should enrich the file on 3 lines with all unpaywall attributes with ";" separator', async () => {
        const res2 = await chai
          .request(enrichHost)
          .post(`/job/${id}`)
          .send({
            type: 'csv',
            index: 'unpaywall-test',
            separator: ';',
          })
          .set('x-api-key', 'user');

        expect(res2).have.status(200);
      });

      it('Should get the state of enrich', async () => {
        let res3;
        do {
          res3 = await chai
            .request(enrichHost)
            .get(`/states/${id}.json`)
            .set('x-api-key', 'user');
          expect(res3).have.status(200);
          await new Promise((resolve) => setTimeout(resolve, 100));
        } while (!res3?.body?.done);

        const state = res3?.body;

        expect(state).have.property('done').equal(true);
        expect(state).have.property('loaded').to.not.equal(undefined);
        expect(state).have.property('linesRead').equal(3);
        expect(state).have.property('enrichedLines').equal(3);
        expect(state).have.property('createdAt').to.not.equal(undefined);
        expect(state).have.property('endAt').to.not.equal(undefined);
        expect(state).have.property('error').equal(false);
      });

      it('Should download the enrichedfile', async () => {
        const res4 = await chai
          .request(enrichHost)
          .get(`/enriched/${id}.csv`)
          .set('x-api-key', 'user')
          .buffer()
          .parse(binaryParser);

        enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
        try {
          await fs.writeFile(enrichedFile, res4.body.toString());
        } catch (err) {
          console.error(`writeFile: ${err}`);
        }
      });

      it('Should be the same', async () => {
        const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file07.csv');

        const same = await compareFile(reference, enrichedFile);
        expect(same).to.be.equal(true);
      });
    });

    describe('Do a enrichment of a csv file with same doi', () => {
      let id;
      let enrichedFile;
      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichHost)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file03.csv'), 'file03.csv')
          .set('Content-Type', 'text/csv')
          .set('x-api-key', 'user');

        expect(res1).have.status(200);

        id = res1?.body;
      });

      it('Should enrich the file on 3 lines with args {is_oa} and download it', async () => {
        const res2 = await chai
          .request(enrichHost)
          .post(`/job/${id}`)
          .send({
            type: 'csv',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('x-api-key', 'user');

        expect(res2).have.status(200);
      });

      it('Should get the state of enrich', async () => {
        let res3;

        do {
          res3 = await chai
            .request(enrichHost)
            .get(`/states/${id}.json`)
            .set('x-api-key', 'user');
          expect(res3).have.status(200);
          await new Promise((resolve) => setTimeout(resolve, 100));
        } while (!res3?.body?.done);

        const state = res3?.body;

        expect(state).have.property('done').equal(true);
        expect(state).have.property('loaded').to.not.equal(undefined);
        expect(state).have.property('linesRead').equal(3);
        expect(state).have.property('enrichedLines').equal(3);
        expect(state).have.property('createdAt').to.not.equal(undefined);
        expect(state).have.property('endAt').to.not.equal(undefined);
        expect(state).have.property('error').equal(false);
      });

      it('Should download the enrichedfile', async () => {
        const res4 = await chai
          .request(enrichHost)
          .get(`/enriched/${id}.csv`)
          .set('x-api-key', 'user')
          .buffer()
          .parse(binaryParser);

        enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
        try {
          await fs.writeFile(enrichedFile, res4.body.toString());
        } catch (err) {
          console.error(`writeFile: ${err}`);
        }
      });

      it('Should be the same', async () => {
        const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file08.csv');
        const same = await compareFile(reference, enrichedFile);
        expect(same).to.be.equal(true);
      });
    });

    describe('Do a enrichment of a csv file with 1200 lines', () => {
      let id;
      let enrichedFile;
      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichHost)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file04.csv'), 'file04.csv')
          .set('Content-Type', 'text/csv')
          .set('x-api-key', 'user');

        expect(res1).have.status(200);

        id = res1?.body;
      });

      it('Should enrich the file on 1200 lines with args {is_oa} and download it', async () => {
        const res2 = await chai
          .request(enrichHost)
          .post(`/job/${id}`)
          .send({
            type: 'csv',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('x-api-key', 'user');

        expect(res2).have.status(200);
      });

      it('Should get the state of enrich', async () => {
        let res3;

        do {
          res3 = await chai
            .request(enrichHost)
            .get(`/states/${id}.json`)
            .set('x-api-key', 'user');
          expect(res3).have.status(200);
          await new Promise((resolve) => setTimeout(resolve, 100));
        } while (!res3?.body?.done);

        const state = res3?.body;

        expect(state).have.property('done').equal(true);
        expect(state).have.property('loaded').to.not.equal(undefined);
        expect(state).have.property('linesRead').equal(1200);
        expect(state).have.property('enrichedLines').equal(1200);
        expect(state).have.property('createdAt').to.not.equal(undefined);
        expect(state).have.property('endAt').to.not.equal(undefined);
        expect(state).have.property('error').equal(false);
      });

      it('Should download the enrichedfile', async () => {
        const res4 = await chai
          .request(enrichHost)
          .get(`/enriched/${id}.csv`)
          .set('x-api-key', 'user')
          .buffer()
          .parse(binaryParser);

        enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
        try {
          await fs.writeFile(enrichedFile, res4.body.toString());
        } catch (err) {
          console.error(`writeFile: ${err}`);
        }
      });

      it('Should be the same', async () => {
        const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file09.csv');
        const same = await compareFile(reference, enrichedFile);
        expect(same).to.be.equal(true);
      });
    });

    describe('Don\'t do a enrichment of a csv file because the arguments doesn\'t exist on ezunpaywall index', () => {
      let id;

      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichHost)
          .post('/upload')
          .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
          .set('Content-Type', 'text/csv')
          .set('x-api-key', 'user');

        expect(res1).have.status(200);

        id = res1?.body;
      });

      it('Should return a error message', async () => {
        const res2 = await chai
          .request(enrichHost)
          .post(`/job/${id}`)
          .send({
            type: 'csv',
            index: 'unpaywall-test',
            args: '{ coin }',
          })
          .set('x-api-key', 'user');

        // TODO mettre une erreur 401
        expect(res2).have.status(200);
      });
    });

    describe('Don\'t do a enrichment of a csv file because the file doesn\'t exist', () => {
      const id = 'test';
      it('Should upload the file', async () => {
        const res1 = await chai
          .request(enrichHost)
          .post(`/job/${id}`)
          .send({
            type: 'csv',
            index: 'unpaywall-test',
            args: '{ is_oa }',
          })
          .set('x-api-key', 'user');

        expect(res1).have.status(404);
      });
    });
  });

  describe('Do a enrichment of a csv file with 1200 lines with all unpaywall attributes sended on body', () => {
    let id;
    let enrichedFile;

    it('Should upload the file', async () => {
      const res1 = await chai
        .request(enrichHost)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file04.csv'), 'file04.csv')
        .set('Content-Type', 'text/csv')
        .set('x-api-key', 'user');

      expect(res1).have.status(200);

      id = res1?.body;
    });

    it('Should enrich the file on 1200 lines with all unpaywall attributes and download it', async () => {
      // start enrich process
      const res2 = await chai
        .request(enrichHost)
        .post(`/job/${id}`)
        .send({
          type: 'csv',
          index: 'unpaywall-test',
          args: '{ doi, data_standard, doi_url, genre, is_oa, is_paratext, journal_is_in_doaj, journal_is_oa, journal_issn_l, journal_issns, journal_name, oa_status, published_date, publisher, title, updated, year, best_oa_location { evidence, host_type, is_best, license, pmh_id, updated, url, url_for_landing_page, url_for_pdf, version }, first_oa_location { evidence, host_type, is_best, license, pmh_id, updated, url, url_for_landing_page, url_for_pdf, version }, z_authors { family, given, ORCID } }',
        })
        .set('x-api-key', 'user');

      expect(res2).have.status(200);
    });

    it('Should get the state of enrich', async () => {
      let res3;
      do {
        res3 = await chai
          .request(enrichHost)
          .get(`/states/${id}.json`)
          .set('x-api-key', 'user');
        expect(res3).have.status(200);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!res3?.body?.done);

      const state = res3?.body;

      expect(state).have.property('done').equal(true);
      expect(state).have.property('loaded').to.not.equal(undefined);
      expect(state).have.property('linesRead').equal(1200);
      expect(state).have.property('enrichedLines').equal(1200);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('error').equal(false);
    });

    it('Should download the enrichedfile', async () => {
      const res4 = await chai
        .request(enrichHost)
        .get(`/enriched/${id}.csv`)
        .set('x-api-key', 'user')
        .buffer()
        .parse(binaryParser);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
      try {
        await fs.writeFile(enrichedFile, res4.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file10.csv');
      const same = await compareFile(reference, enrichedFile);
      expect(same).to.be.equal(true);
    });
  });

  describe('Do a enrichment of a csv file with 1 line with all unpaywall attributes equal to null', () => {
    let id;
    let enrichedFile;

    it('Should upload the file', async () => {
      const res1 = await chai
        .request(enrichHost)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file05.csv'), 'file05.csv')
        .set('Content-Type', 'text/csv')
        .set('x-api-key', 'user');

      expect(res1).have.status(200);

      id = res1?.body;
    });

    it('Should enrich the file with 1 line with all unpaywall attributes and download it but z_authors is null', async () => {
      // start enrich process
      const res2 = await chai
        .request(enrichHost)
        .post(`/job/${id}`)
        .send({
          type: 'csv',
          index: 'unpaywall-test',
          args: '{ doi, data_standard, doi_url, genre, is_oa, is_paratext, journal_is_in_doaj, journal_is_oa, journal_issn_l, journal_issns, journal_name, oa_status, published_date, publisher, title, updated, year, best_oa_location { evidence, host_type, is_best, license, pmh_id, updated, url, url_for_landing_page, url_for_pdf, version }, first_oa_location { evidence, host_type, is_best, license, pmh_id, updated, url, url_for_landing_page, url_for_pdf, version }, z_authors { family, given, ORCID } }',
        })
        .set('x-api-key', 'user');

      expect(res2).have.status(200);
    });

    it('Should get the state of enrich', async () => {
      let res3;
      do {
        res3 = await chai
          .request(enrichHost)
          .get(`/states/${id}.json`)
          .set('x-api-key', 'user');
        expect(res3).have.status(200);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!res3?.body?.done);

      const state = res3?.body;

      expect(state).have.property('done').equal(true);
      expect(state).have.property('loaded').to.not.equal(undefined);
      expect(state).have.property('linesRead').equal(1);
      expect(state).have.property('enrichedLines').equal(1);
      expect(state).have.property('createdAt').to.not.equal(undefined);
      expect(state).have.property('endAt').to.not.equal(undefined);
      expect(state).have.property('error').equal(false);
    });

    it('Should download the enrichedfile', async () => {
      const res4 = await chai
        .request(enrichHost)
        .get(`/enriched/${id}.csv`)
        .set('x-api-key', 'user')
        .buffer()
        .parse(binaryParser);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
      try {
        await fs.writeFile(enrichedFile, res4.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file11.csv');
      const same = await compareFile(reference, enrichedFile);
      expect(same).to.be.equal(true);
    });
  });

  after(async () => {
    await deleteIndex('unpaywall-test');
    await deleteAllAPIKey();
  });
});
