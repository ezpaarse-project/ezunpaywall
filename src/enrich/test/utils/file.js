const fs = require('fs-extra');

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
  console.log(file1);
  console.log(file2);
  return file1.trim().replace(/\r\n/g, '\n') === file2.trim().replace(/\r\n/g, '\n');
};

module.exports = {
  binaryParser,
  compareFile,
};
