/* eslint-disable no-await-in-loop */
const fs = require('fs-extra');
const path = require('path');

const changefiles = require('../../fakeUnpaywall/snapshots/changefiles.json');

/**
 * updates the dates of the fake unpaywall snapshot management file
 */
const initializeDate = async () => {
  const changefilesPath = path.resolve(__dirname, '..', '..', 'fakeUnpaywall', 'snapshots', 'changefiles.json');
  const now = Date.now();
  const oneDay = (1 * 24 * 60 * 60 * 1000);

  changefiles.list[0].to_date = new Date(now - (1 * oneDay)).toISOString().slice(0, 10);
  changefiles.list[0].last_modified = new Date(now - (1 * oneDay)).toISOString().slice(0, 19);
  changefiles.list[0].from_date = new Date(now - (8 * oneDay)).toISOString().slice(0, 10);

  changefiles.list[1].to_date = new Date(now - (8 * oneDay)).toISOString().slice(0, 10);
  changefiles.list[1].last_modified = new Date(now - (8 * oneDay)).toISOString().slice(0, 19);
  changefiles.list[1].from_date = new Date(now - (15 * oneDay)).toISOString().slice(0, 10);

  changefiles.list[2].to_date = new Date(now - (15 * oneDay)).toISOString().slice(0, 10);
  changefiles.list[2].last_modified = new Date(now - (15 * oneDay)).toISOString().slice(0, 19);
  changefiles.list[2].from_date = new Date(now - (22 * oneDay)).toISOString().slice(0, 10);
  try {
    await fs.writeFile(changefilesPath, JSON.stringify(changefiles, null, 2), 'utf8');
  } catch (err) {
    console.error(`fs.writeFile in initializeDate: ${err}`);
  }
};

/**
 * parses the content of the response of a request to retrieve the content of a file
 * @param {Object} res response
 * @param {Object} cb callback
 */
const binaryParser = (res, cb) => {
  res.setEncoding('binary');
  res.data = '';
  res.on('data', (chunk) => {
    res.data += chunk;
  });
  res.on('end', () => {
    cb(null, Buffer.from(res.data, 'binary'));
  });
};

/**
 * compares the content of 2 files and indicates whether they are identical or not
 * @param {String} path1 filepath of the first file
 * @param {String} path2 filepath of the second file
 * @returns {boolean} if identical
 */
const compareFile = async (path1, path2) => {
  const file1 = await fs.readFile(path1, 'utf-8');
  const file2 = await fs.readFile(path2, 'utf-8');
  return file1.trim().replace(/\r\n/g, '\n') === file2.trim().replace(/\r\n/g, '\n');
};

module.exports = {
  initializeDate,
  binaryParser,
  compareFile,
};
