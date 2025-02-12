const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');
const appLogger = require('../logger/appLogger');

const changefilesDir = path.resolve(__dirname, '..', '..', '..', 'tests-jest', 'utils', 'data', 'changefiles');
const snapshotDir = path.resolve(__dirname, '..', '..', '..', 'tests-jest', 'utils', 'data', 'snapshots');

const baseURL = 'http://unpaywall-mock:3000';

const changefileList = [
  {
    date: format(new Date(), 'yyyy-MM-dd'),
    filename: 'fake1.jsonl.gz',
    filetype: 'jsonl',
    last_modified: new Date(),
    lines: 2,
    size: 80,
    url: `${baseURL}/daily-feed/changefiles/fake1.jsonl.gz?api_key=default`,
  },
  {
    date: format(new Date(), 'yyyy-MM-dd'),
    filename: 'fake2.jsonl.gz',
    filetype: 'jsonl',
    last_modified: new Date(),
    lines: 2,
    size: 80,
    url: `${baseURL}/daily-feed/changefiles/fake2.jsonl.gz?api_key=default`,
  },
  {
    date: format(new Date(), 'yyyy-MM-dd'),
    filename: 'fake3.jsonl.gz',
    filetype: 'jsonl',
    last_modified: new Date(),
    lines: 2,
    size: 80,
    url: `${baseURL}/daily-feed/changefiles/fake3.jsonl.gz?api_key=default`,
  },
];

const unpaywallMockInstance = jest.fn((config) => {
  if (config.url === '/feed/changefiles') {
    return Promise.resolve({
      data: {
        list: changefileList,
      },
    });
  }
});

module.exports = unpaywallMockInstance;

// module.exports = {
//   getSnapshot: jest.fn(() => {
//     console.log('========== getSnapshot ==========');
//     const filePath = path.resolve(snapshotDir, 'snapshot.jsonl.gz');
//     let readStream;
//     try {
//       readStream = fs.createReadStream(filePath);
//     } catch (err) {
//       appLogger.error(`[mock][unpaywall][snapshot]: Cannot read [${filePath}]`, err);
//       return false;
//     }
//     return readStream;
//   }),
//   getChangefiles: jest.fn(() => {
//     console.log('========== getChangefiles ==========');
//     return Promise.resolve([{ filetype: 'jsonl', date: '2021-10-01' }]);
//   }),
//   getChangefile: jest.fn(() => {
//     console.log('========== getChangefile ==========');
//     const filePath = path.resolve(changefilesDir, 'snapshot.jsonl.gz');
//     let readStream;
//     try {
//       readStream = fs.createReadStream(filePath);
//     } catch (err) {
//       appLogger.error(`[mock][unpaywall][changefile]: Cannot read [${filePath}]`, err);
//       return false;
//     }
//     return readStream;
//   }),
// };
