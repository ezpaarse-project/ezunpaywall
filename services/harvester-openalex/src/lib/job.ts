import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import readline from 'readline';

import { createIndex, bulk } from '~/lib/elastic';
import { getFilenamesBetweenDate } from '~/lib/file';
import appLogger from '~/lib/logger/appLogger';

import openAlexMapping from '~/../mappings/works.json';

import { config } from '~/lib/config';
const { paths } = config;

export async function insertWorksOpenalexJob(indexName: string, startDate: string, endDate: string) {

  // create index
  try {
    await createIndex(indexName, openAlexMapping);
  } catch (err) {
    appLogger.error(`[job][elastic][index]: Cannot create index [${indexName}]`, err);
    throw err;
  }


  const filenames = await getFilenamesBetweenDate(startDate, endDate) 

  if (filenames.length === 0) {
    appLogger.info(`[job][insert]: No file found between [${startDate}] and [${endDate}]`);
    return;
  }

  appLogger.info(`[job][insert]: Found ${filenames.length} files between [${startDate}] and [${endDate}]`);

  for (const filename of filenames) {
    const filePath = path.resolve(paths.data.openalexDir, filename);
    try {
      await insertWorksOpenalexProcess(filePath, indexName);
    } catch (err) {
      appLogger.error(`[job][insert]: Cannot insert [${filePath}]`, err);
      throw err;
    }
  }
}



async function insertWorksOpenalexProcess(filePath: string, index: string) {
  appLogger.info(`[job][insert]: Start insert with [${filePath}]`);

  // read file with stream
  let readStream;
  try {
    readStream = fs.createReadStream(filePath);
  } catch (err) {
    appLogger.error(`[job][insert]: Cannot read [${filePath}]`, err);
    throw err;
  }

  // get information "loaded" for state
  let loaded = 0;
  readStream.on('data', (chunk) => {
    loaded += chunk.length;
  });

  // decompress
  let decompressedStream;
  try {
    decompressedStream = readStream.pipe(zlib.createGunzip());
  } catch (err) {
    appLogger.error(`[job][insert]: Cannot pipe [${filePath}]`, err);
    throw err;
  }

  const rl = readline.createInterface({
    input: decompressedStream,
    crlfDelay: Infinity,
  });

  // array that will contain the packet of 1000 unpaywall data
  let bulkOps = [];

  let linesRead = 0;

  for await (const line of rl) {
    linesRead += 1;
    try {
      const doc = JSON.parse(line);
      bulkOps.push({ index: { _index: index, _id: doc.id } });
      bulkOps.push(doc);
    } catch (err) {
      appLogger.error(`[job][insert]: Cannot parse [${line}] in json format`, err);
      throw err;
    }
     // bulk insertion
     if (bulkOps.length >= 1000) {
      try {
        await bulk(bulkOps);
      } catch (err) {
        appLogger.error('[job][insert]: Cannot insert openalex work data in elastic', err);
        throw err;
      }
      bulkOps = [];
    }
    if (linesRead % 100000 === 0) {
      appLogger.info(`[job][insert]: ${linesRead} Lines reads`);
    }
  }
  if (bulkOps.length > 0) {
    try {
      await bulk(bulkOps);
    } catch (err) {
      appLogger.error('[job][insert]: Cannot insert openalex work data in elastic', err);
      throw err;
    }
    bulkOps = [];
  }

  appLogger.info(`[job][insert]: Inserted ${linesRead} lines in ${filePath}`);
}