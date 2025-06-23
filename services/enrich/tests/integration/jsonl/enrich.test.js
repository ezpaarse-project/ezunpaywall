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

  describe('[job][jsonl]: Enrich 3/3 lines with all unpaywall attributes', () => {
    let id;
    let enrichedFile;

    it('Should upload the file', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.jsonl'), 'file01.jsonl')
        .set('Content-Type', 'application/x-ndjson')
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      id = response?.body;
    });

    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      // start enrich process
      const response = await request(app)
        .post(`/job/${id}`)
        .send({
          type: 'jsonl',
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
        .get(`/enriched/${id}.jsonl`)
        .set('x-api-key', apikey1)
        .buffer()
        .parse(binaryParser);

      expect(response.statusCode).toBe(200);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.jsonl');
      try {
        await fsp.writeFile(enrichedFile, response.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file01.jsonl');
      const same = await compareFile(reference, enrichedFile);
      expect(same).toBe(true);
    });
  });

  describe('[job][jsonl]: Enrich 2/3 lines with all unpaywall attributes', () => {
    let id;
    let enrichedFile;

    it('Should upload the file', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file02.jsonl'), 'file02.jsonl')
        .set('Content-Type', 'application/x-ndjson')
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      id = response?.body;
    });

    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      // start enrich process
      const response = await request(app)
        .post(`/job/${id}`)
        .send({
          type: 'jsonl',
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
        .get(`/enriched/${id}.jsonl`)
        .set('x-api-key', apikey1)
        .buffer()
        .parse(binaryParser);

      expect(response.statusCode).toBe(200);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.jsonl');
      try {
        await fsp.writeFile(enrichedFile, response.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file02.jsonl');
      const same = await compareFile(reference, enrichedFile);
      expect(same).toBe(true);
    });
  });

  describe('[job][jsonl]: Enrich 3/3 lines with is_oa', () => {
    let id;
    let enrichedFile;

    it('Should upload the file', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.jsonl'), 'file01.jsonl')
        .set('Content-Type', 'application/x-ndjson')
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      id = response?.body;
    });

    it('Should enrich the file on 3 lines with all { is_oa } and download it', async () => {
      // start enrich process
      const response = await request(app)
        .post(`/job/${id}`)
        .send({
          type: 'jsonl',
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
        .get(`/enriched/${id}.jsonl`)
        .set('x-api-key', apikey1)
        .buffer()
        .parse(binaryParser);

      expect(response.statusCode).toBe(200);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.jsonl');
      try {
        await fsp.writeFile(enrichedFile, response.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file03.jsonl');
      const same = await compareFile(reference, enrichedFile);
      expect(same).toBe(true);
    });
  });

  describe('[job][jsonl]: Enrich 3/3 lines with best_oa_location.license', () => {
    let id;
    let enrichedFile;

    it('Should upload the file', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.jsonl'), 'file01.jsonl')
        .set('Content-Type', 'application/x-ndjson')
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      id = response?.body;
    });

    it('Should enrich the file on 3 lines with all { best_oa_location { license } } and download it', async () => {
      // start enrich process
      const response = await request(app)
        .post(`/job/${id}`)
        .send({
          type: 'jsonl',
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
        .get(`/enriched/${id}.jsonl`)
        .set('x-api-key', apikey1)
        .buffer()
        .parse(binaryParser);

      expect(response.statusCode).toBe(200);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.jsonl');
      try {
        await fsp.writeFile(enrichedFile, response.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file04.jsonl');
      const same = await compareFile(reference, enrichedFile);
      expect(same).toBe(true);
    });
  });

  describe('[job][jsonl]: Enrich 3/3 lines with z_authors.raw_author_name', () => {
    let id;
    let enrichedFile;

    it('Should upload the file', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.jsonl'), 'file01.jsonl')
        .set('Content-Type', 'application/x-ndjson')
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      id = response?.body;
    });

    it('Should enrich the file on 3 lines with all { z_authors { raw_author_name } } and download it', async () => {
      // start enrich process
      const response = await request(app)
        .post(`/job/${id}`)
        .send({
          type: 'jsonl',
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
        .get(`/enriched/${id}.jsonl`)
        .set('x-api-key', apikey1)
        .buffer()
        .parse(binaryParser);

      expect(response.statusCode).toBe(200);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.jsonl');
      try {
        await fsp.writeFile(enrichedFile, response.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file05.jsonl');
      const same = await compareFile(reference, enrichedFile);
      expect(same).toBe(true);
    });
  });

  describe('[job][jsonl]: Enrich 3/3 lines with is_oa, z_authors.raw_author_name best_oa_location.license', () => {
    let id;
    let enrichedFile;

    it('Should upload the file', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.jsonl'), 'file01.jsonl')
        .set('Content-Type', 'application/x-ndjson')
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      id = response?.body;
    });

    it('Should enrich the file on 3 lines with all { is_oa, best_oa_location { license }, z_authors { raw_author_name } } and download it', async () => {
      // start enrich process
      const response = await request(app)
        .post(`/job/${id}`)
        .send({
          type: 'jsonl',
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
        .get(`/enriched/${id}.jsonl`)
        .set('x-api-key', apikey1)
        .buffer()
        .parse(binaryParser);

      expect(response.statusCode).toBe(200);

      enrichedFile = path.resolve(enrichDir, 'tmp', 'enriched.jsonl');
      try {
        await fsp.writeFile(enrichedFile, response.body.toString());
      } catch (err) {
        console.error(`writeFile: ${err}`);
      }
    });

    it('Should be the same', async () => {
      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file06.jsonl');
      const same = await compareFile(reference, enrichedFile);
      expect(same).toBe(true);
    });
  });
});
