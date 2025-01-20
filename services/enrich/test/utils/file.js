const fsp = require('fs/promises');

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
 * compares the content of 2 files and indicates whether they are identical or not.
 *
 * @param {string} path1 filepath of the first file.
 * @param {string} path2 filepath of the second file.
 *
 * @returns {Promise<boolean>} is identical.
 */
async function compareFile(path1, path2) {
  const file1 = await fsp.readFile(path1, 'utf-8');
  const file2 = await fsp.readFile(path2, 'utf-8');
  return file1.trim().replace(/\r\n/g, '\n') === file2.trim().replace(/\r\n/g, '\n');
}

module.exports = {
  binaryParser,
  compareFile,
};
