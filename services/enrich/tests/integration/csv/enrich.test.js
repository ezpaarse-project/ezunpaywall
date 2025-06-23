const path = require('path');
const request = require('supertest');
const fsp = require('fs/promises');
const { setTimeout } = require('timers/promises');

const app = require('../../../src/app');

const { loadApikey } = require('../../utils/apikey');

const { binaryParser, compareFile } = require('../../utils/file');

const enrichDir = path.resolve(__dirname, '..', '..', 'utils', 'sources');

describe('Enrich: job on csv file', () => {
  const apikey1 = 'apikey1';

  const fieldToBeDefined = ['id', 'path', 'filename', 'loaded', 'createdAt', 'endAt'];
  beforeAll(async () => {
    await setTimeout(10);
    await loadApikey();
  });

  afterAll(async () => {
    app.close();
  });

  describe('[job][csv]: Enrich 3/3 lines with all unpaywall attributes', () => {
    let id;
    let enrichedFile;

    it('Should upload the file', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
        .set('Content-Type', 'text/csv')
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      id = response?.body;
    });

    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      // start enrich process
      const response = await request(app)
        .post(`/job/${id}`)
        .send({
          type: 'csv',
          index: 'unpaywall-test',
        })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);
    });

    it('Should get the state of enrich', async () => {
      let response;
      do {
        response = await request(app)
          .get(`/states/${id}.json`)
          .set('x-api-key', apikey1);
        expect(response.statusCode).toBe(200);
        await setTimeout(100);
      } while (!response?.body?.done);

      const state = response?.body;

      expect(state).toMatchObject({
        done: true,
        apikey: apikey1,
        linesRead: 3,
        enrichedLines: 3,
        error: false,
      });

      fieldToBeDefined.forEach((key) => {
        expect(state).toHaveProperty(key);
        expect(state[key]).not.toBeUndefined();
      });
    });

    it('Should download the enriched file', async () => {
      const response = await request(app)
        .get(`/enriched/${id}.csv`)
        .set('x-api-key', apikey1)
        .buffer()
        .parse(binaryParser);

      expect(response.statusCode).toBe(200);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
      try {
        await fsp.writeFile(enrichedFile, response.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file01.csv');
      const same = await compareFile(reference, enrichedFile);
      expect(same).toBe(true);
    });
  });

  describe('[job][csv]: Enrich 2/3 lines with all unpaywall attributes', () => {
    let id;
    let enrichedFile;

    it('Should upload the file', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file02.csv'), 'file02.csv')
        .set('Content-Type', 'text/csv')
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      id = response?.body;
    });

    it('Should enrich the file on 2 lines with all unpaywall attributes and download it', async () => {
      // start enrich process
      const response = await request(app)
        .post(`/job/${id}`)
        .send({
          type: 'csv',
          index: 'unpaywall-test',
        })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);
    });

    it('Should get the state of enrich', async () => {
      let response;
      do {
        response = await request(app)
          .get(`/states/${id}.json`)
          .set('x-api-key', apikey1);
        expect(response.statusCode).toBe(200);
        await setTimeout(100);
      } while (!response?.body?.done);

      const state = response?.body;

      expect(state).toMatchObject({
        done: true,
        apikey: apikey1,
        linesRead: 3,
        enrichedLines: 2,
        error: false,
      });

      fieldToBeDefined.forEach((key) => {
        expect(state).toHaveProperty(key);
        expect(state[key]).not.toBeUndefined();
      });
    });

    it('Should download the enriched file', async () => {
      const response = await request(app)
        .get(`/enriched/${id}.csv`)
        .set('x-api-key', apikey1)
        .buffer()
        .parse(binaryParser);

      expect(response.statusCode).toBe(200);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
      try {
        await fsp.writeFile(enrichedFile, response.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file02.csv');
      const same = await compareFile(reference, enrichedFile);
      expect(same).toBe(true);
    });
  });

  describe('[job][csv]: Enrich 3/3 lines with is_oa', () => {
    let id;
    let enrichedFile;
    it('Should upload the file', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
        .set('Content-Type', 'text/csv')
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      id = response?.body;
    });

    it('Should enrich the file on 3 lines with args {is_oa} and download it', async () => {
      const response = await request(app)
        .post(`/job/${id}`)
        .send({
          type: 'csv',
          index: 'unpaywall-test',
          args: '{ is_oa }',
        })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);
    });

    it('Should get the state of enrich', async () => {
      let response;

      do {
        response = await request(app)
          .get(`/states/${id}.json`)
          .set('x-api-key', apikey1);
        expect(response.statusCode).toBe(200);
        await setTimeout(100);
      } while (!response?.body?.done);

      const state = response?.body;

      expect(state).toMatchObject({
        done: true,
        apikey: apikey1,
        linesRead: 3,
        enrichedLines: 3,
        error: false,
      });

      fieldToBeDefined.forEach((key) => {
        expect(state).toHaveProperty(key);
        expect(state[key]).not.toBeUndefined();
      });
    });

    it('Should download the enriched file', async () => {
      const response = await request(app)
        .get(`/enriched/${id}.csv`)
        .set('x-api-key', apikey1)
        .buffer()
        .parse(binaryParser);

      expect(response.statusCode).toBe(200);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
      try {
        await fsp.writeFile(enrichedFile, response.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file03.csv');

      const same = await compareFile(reference, enrichedFile);
      expect(same).toBe(true);
    });
  });

  describe('[job][csv]: Enrich 3/3 lines with best_oa_location.license', () => {
    let id;
    let enrichedFile;
    it('Should upload the file', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
        .set('Content-Type', 'text/csv')
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      id = response?.body;
    });

    it('Should enrich the file on 3 lines with args { best_oa_location { license } } and download it', async () => {
      const response = await request(app)
        .post(`/job/${id}`)
        .send({
          type: 'csv',
          index: 'unpaywall-test',
          args: '{ best_oa_location { license } }',
        })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);
    });

    it('Should get the state of enrich', async () => {
      let response;
      do {
        response = await request(app)
          .get(`/states/${id}.json`)
          .set('x-api-key', apikey1);
        expect(response.statusCode).toBe(200);
        await setTimeout(100);
      } while (!response?.body?.done);

      const state = response?.body;

      expect(state).toMatchObject({
        done: true,
        apikey: apikey1,
        linesRead: 3,
        enrichedLines: 3,
        error: false,
      });

      fieldToBeDefined.forEach((key) => {
        expect(state).toHaveProperty(key);
        expect(state[key]).not.toBeUndefined();
      });
    });

    it('Should download the enriched file', async () => {
      const response = await request(app)
        .get(`/enriched/${id}.csv`)
        .set('x-api-key', apikey1)
        .buffer()
        .parse(binaryParser);

      expect(response.statusCode).toBe(200);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
      try {
        await fsp.writeFile(enrichedFile, response.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file04.csv');

      const same = await compareFile(reference, enrichedFile);
      expect(same).toBe(true);
    });
  });

  describe('[job][csv]: Enrich 3/3 lines with z_authors.raw_author_name', () => {
    let id;
    let enrichedFile;

    it('Should upload the file', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
        .set('Content-Type', 'text/csv')
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      id = response?.body;
    });

    it('Should enrich the file on 3 lines with args { z_authors { raw_author_name } } and download it', async () => {
      const response = await request(app)
        .post(`/job/${id}`)
        .send({
          type: 'csv',
          index: 'unpaywall-test',
          args: '{ z_authors { raw_author_name } }',
        })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);
    });

    it('Should get the state of enrich', async () => {
      let response;
      do {
        response = await request(app)
          .get(`/states/${id}.json`)
          .set('x-api-key', apikey1);
        expect(response.statusCode).toBe(200);
        await setTimeout(100);
      } while (!response?.body?.done);

      const state = response?.body;

      expect(state).toMatchObject({
        done: true,
        apikey: apikey1,
        linesRead: 3,
        enrichedLines: 3,
        error: false,
      });

      fieldToBeDefined.forEach((key) => {
        expect(state).toHaveProperty(key);
        expect(state[key]).not.toBeUndefined();
      });
    });

    it('Should download the enriched file', async () => {
      const response = await request(app)
        .get(`/enriched/${id}.csv`)
        .set('x-api-key', apikey1)
        .buffer()
        .parse(binaryParser);

      expect(response.statusCode).toBe(200);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
      try {
        await fsp.writeFile(enrichedFile, response.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file05.csv');

      const same = await compareFile(reference, enrichedFile);
      expect(same).toBe(true);
    });
  });

  describe('[job][csv]: Enrich 3/3 lines with is_oa, best_oa_location.license, z_authors.raw_author_name', () => {
    let id;
    let enrichedFile;

    it('Should upload the file', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
        .set('Content-Type', 'text/csv')
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      id = response?.body;
    });

    it('Should enrich the file on 3 lines with args { is_oa, best_oa_location { license }, z_authors { raw_author_name } } and download it', async () => {
      const response = await request(app)
        .post(`/job/${id}`)
        .send({
          type: 'csv',
          index: 'unpaywall-test',
          args: '{ is_oa, best_oa_location { license }, z_authors { raw_author_name } }',
        })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);
    });

    it('Should get the state of enrich', async () => {
      let response;
      do {
        response = await request(app)
          .get(`/states/${id}.json`)
          .set('x-api-key', apikey1);
        expect(response.statusCode).toBe(200);
        await setTimeout(100);
      } while (!response?.body?.done);

      const state = response?.body;

      expect(state).toMatchObject({
        done: true,
        apikey: apikey1,
        linesRead: 3,
        enrichedLines: 3,
        error: false,
      });

      fieldToBeDefined.forEach((key) => {
        expect(state).toHaveProperty(key);
        expect(state[key]).not.toBeUndefined();
      });
    });

    it('Should download the enriched file', async () => {
      const response = await request(app)
        .get(`/enriched/${id}.csv`)
        .set('x-api-key', apikey1)
        .buffer()
        .parse(binaryParser);

      expect(response.statusCode).toBe(200);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
      try {
        await fsp.writeFile(enrichedFile, response.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file06.csv');

      const same = await compareFile(reference, enrichedFile);
      expect(same).toBe(true);
    });
  });

  describe('[job][csv]: Enrich 3/3 lines with all unpaywall attributes and ";" as separator', () => {
    let id;
    let enrichedFile;

    it('Should upload the file', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
        .set('Content-Type', 'text/csv')
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      id = response?.body;
    });

    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      // start enrich process
      const response = await request(app)
        .post(`/job/${id}`)
        .send({
          type: 'csv',
          index: 'unpaywall-test',
          separator: ';',
        })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);
    });

    it('Should get the state of enrich', async () => {
      let response;
      do {
        response = await request(app)
          .get(`/states/${id}.json`)
          .set('x-api-key', apikey1);
        expect(response.statusCode).toBe(200);
        await setTimeout(100);
      } while (!response?.body?.done);

      const state = response?.body;

      expect(state).toMatchObject({
        done: true,
        apikey: apikey1,
        linesRead: 3,
        enrichedLines: 3,
        error: false,
      });

      fieldToBeDefined.forEach((key) => {
        expect(state).toHaveProperty(key);
        expect(state[key]).not.toBeUndefined();
      });
    });

    it('Should download the enriched file', async () => {
      const response = await request(app)
        .get(`/enriched/${id}.csv`)
        .set('x-api-key', apikey1)
        .buffer()
        .parse(binaryParser);

      expect(response.statusCode).toBe(200);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
      try {
        await fsp.writeFile(enrichedFile, response.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file07.csv');
      const same = await compareFile(reference, enrichedFile);
      expect(same).toBe(true);
    });
  });

  describe('[job][csv]: Enrich 3/3 same lines with is_oa', () => {
    let id;
    let enrichedFile;

    it('Should upload the file', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file03.csv'), 'file03.csv')
        .set('Content-Type', 'text/csv')
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      id = response?.body;
    });

    it('Should enrich the file on 3 lines with { is_oa } attributes and download it', async () => {
      // start enrich process
      const response = await request(app)
        .post(`/job/${id}`)
        .send({
          type: 'csv',
          index: 'unpaywall-test',
          args: '{ is_oa }',
        })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);
    });

    it('Should get the state of enrich', async () => {
      let response;
      do {
        response = await request(app)
          .get(`/states/${id}.json`)
          .set('x-api-key', apikey1);
        expect(response.statusCode).toBe(200);
        await setTimeout(100);
      } while (!response?.body?.done);

      const state = response?.body;

      expect(state).toMatchObject({
        done: true,
        apikey: apikey1,
        linesRead: 3,
        enrichedLines: 3,
        error: false,
      });

      fieldToBeDefined.forEach((key) => {
        expect(state).toHaveProperty(key);
        expect(state[key]).not.toBeUndefined();
      });
    });

    it('Should download the enriched file', async () => {
      const response = await request(app)
        .get(`/enriched/${id}.csv`)
        .set('x-api-key', apikey1)
        .buffer()
        .parse(binaryParser);

      expect(response.statusCode).toBe(200);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
      try {
        await fsp.writeFile(enrichedFile, response.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file08.csv');
      const same = await compareFile(reference, enrichedFile);
      expect(same).toBe(true);
    });
  });

  describe('[job][csv]: Enrich 1200/1200 lines with is_oa', () => {
    let id;
    let enrichedFile;

    it('Should upload the file', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file04.csv'), 'file04.csv')
        .set('Content-Type', 'text/csv')
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      id = response?.body;
    });

    it('Should enrich the file on 1200 lines with { is_oa } and download it', async () => {
      // start enrich process
      const response = await request(app)
        .post(`/job/${id}`)
        .send({
          type: 'csv',
          index: 'unpaywall-test',
          args: '{ is_oa }',
        })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);
    });

    it('Should get the state of enrich', async () => {
      let response;
      do {
        response = await request(app)
          .get(`/states/${id}.json`)
          .set('x-api-key', apikey1);
        expect(response.statusCode).toBe(200);
        await setTimeout(100);
      } while (!response?.body?.done);

      const state = response?.body;

      expect(state).toMatchObject({
        done: true,
        apikey: apikey1,
        linesRead: 1200,
        enrichedLines: 1200,
        error: false,
      });

      fieldToBeDefined.forEach((key) => {
        expect(state).toHaveProperty(key);
        expect(state[key]).not.toBeUndefined();
      });
    });

    it('Should download the enriched file', async () => {
      const response = await request(app)
        .get(`/enriched/${id}.csv`)
        .set('x-api-key', apikey1)
        .buffer()
        .parse(binaryParser);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
      try {
        await fsp.writeFile(enrichedFile, response.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file09.csv');
      const same = await compareFile(reference, enrichedFile);
      expect(same).toBe(true);
    });
  });

  describe('[job][csv]: Enrich 1200/1200 lines with all unpaywall attributes sended on body', () => {
    let id;
    let enrichedFile;

    it('Should upload the file', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file04.csv'), 'file04.csv')
        .set('Content-Type', 'text/csv')
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      id = response?.body;
    });

    it('Should enrich the file on 1200 lines with all unpaywall attributes and download it', async () => {
      // start enrich process
      const response = await request(app)
        .post(`/job/${id}`)
        .send({
          type: 'csv',
          index: 'unpaywall-test',
          args: `{ 
          doi, data_standard, title, genre, is_paratext, published_date, year, doi_url, 
          journal_name, journal_issns, journal_issn_l,journal_is_oa, journal_is_in_doaj,  
          best_oa_location { url, url_for_landing_page, url_for_pdf, license, host_type, is_best, pmh_id, endpoint_id, repository_institution, oa_date }, 
          first_oa_location { url, url_for_landing_page, url_for_pdf, license, host_type, is_best, pmh_id, endpoint_id, repository_institution, oa_date },
          z_authors { author_position, raw_author_name, is_corresponding } 
          }`,
        })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);
    });

    it('Should get the state of enrich', async () => {
      let response;
      do {
        response = await request(app)
          .get(`/states/${id}.json`)
          .set('x-api-key', apikey1);
        expect(response.statusCode).toBe(200);
        await setTimeout(100);
      } while (!response?.body?.done);

      const state = response?.body;

      expect(state).toMatchObject({
        done: true,
        apikey: apikey1,
        linesRead: 1200,
        enrichedLines: 1200,
        error: false,
      });

      fieldToBeDefined.forEach((key) => {
        expect(state).toHaveProperty(key);
        expect(state[key]).not.toBeUndefined();
      });
    });

    it('Should download the enriched file', async () => {
      const response = await request(app)
        .get(`/enriched/${id}.csv`)
        .set('x-api-key', apikey1)
        .buffer()
        .parse(binaryParser);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
      try {
        await fsp.writeFile(enrichedFile, response.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file10.csv');
      const same = await compareFile(reference, enrichedFile);
      expect(same).toBe(true);
    });
  });

  describe('[job][csv]: Enrich 1/1 line as empty with all unpaywall attributes', () => {
    let id;
    let enrichedFile;

    it('Should upload the file', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file05.csv'), 'file05.csv')
        .set('Content-Type', 'text/csv')
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      id = response?.body;
    });

    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      // start enrich process
      const response = await request(app)
        .post(`/job/${id}`)
        .send({
          type: 'csv',
          index: 'unpaywall-test',
          args: `{ 
          doi, data_standard, title, genre, is_paratext, published_date, year, doi_url, 
          journal_name, journal_issns, journal_issn_l,journal_is_oa, journal_is_in_doaj,  
          best_oa_location { url, url_for_landing_page, url_for_pdf, license, host_type, is_best, pmh_id, endpoint_id, repository_institution, oa_date }, 
          first_oa_location { url, url_for_landing_page, url_for_pdf, license, host_type, is_best, pmh_id, endpoint_id, repository_institution, oa_date },
          z_authors { author_position, raw_author_name, is_corresponding } 
          }`,
        })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);
    });

    it('Should get the state of enrich', async () => {
      let response;
      do {
        response = await request(app)
          .get(`/states/${id}.json`)
          .set('x-api-key', apikey1);
        expect(response.statusCode).toBe(200);
        await setTimeout(100);
      } while (!response?.body?.done);

      const state = response?.body;

      expect(state).toMatchObject({
        done: true,
        apikey: apikey1,
        linesRead: 1,
        enrichedLines: 1,
        error: false,
      });

      fieldToBeDefined.forEach((key) => {
        expect(state).toHaveProperty(key);
        expect(state[key]).not.toBeUndefined();
      });
    });

    it('Should download the enriched file', async () => {
      const response = await request(app)
        .get(`/enriched/${id}.csv`)
        .set('x-api-key', apikey1)
        .buffer()
        .parse(binaryParser);

      expect(response.statusCode).toBe(200);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.csv');
      try {
        await fsp.writeFile(enrichedFile, response.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file11.csv');
      const same = await compareFile(reference, enrichedFile);
      expect(same).toBe(true);
    });
  });
});
