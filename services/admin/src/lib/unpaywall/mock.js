const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { format } = require('date-fns');
const { unpaywall } = require('config');
const appLogger = require('../logger/appLogger');

const changefilesDir = path.resolve(__dirname, '..', '..', '..', 'tests', 'utils', 'data', 'changefiles');
const snapshotDir = path.resolve(__dirname, '..', '..', '..', 'tests', 'utils', 'data', 'snapshots');

const { apikey, url } = unpaywall;

const today = new Date();
const oneDaysAgo = new Date();
oneDaysAgo.setDate(oneDaysAgo.getDate() - 1);
const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const threeDaysAgo = new Date();
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
const twoWeekAgo = new Date();
twoWeekAgo.setDate(twoWeekAgo.getDate() - 14);
const threeWeekAgo = new Date();
threeWeekAgo.setDate(threeWeekAgo.getDate() - 21);

const changefileDailyList = [
  {
    date: format(today, 'yyyy-MM-dd'),
    filename: 'fake1.jsonl.gz',
    filetype: 'jsonl',
    last_modified: today,
    lines: 2,
    size: 80,
    url: `${url}/daily-feed/changefiles/fake1.jsonl.gz?api_key=default`,
  },
  {
    date: format(oneDaysAgo, 'yyyy-MM-dd'),
    filename: 'fake2.jsonl.gz',
    filetype: 'jsonl',
    last_modified: oneDaysAgo,
    lines: 2,
    size: 80,
    url: `${url}/daily-feed/changefiles/fake2.jsonl.gz?api_key=default`,
  },
  {
    date: format(twoDaysAgo, 'yyyy-MM-dd'),
    filename: 'fake3.jsonl.gz',
    filetype: 'jsonl',
    last_modified: twoDaysAgo,
    lines: 2,
    size: 80,
    url: `${url}/daily-feed/changefiles/fake3.jsonl.gz?api_key=default`,
  },
  {
    date: '2020-01-05',
    filename: '2020-01-05-history.jsonl.gz',
    filetype: 'jsonl',
    last_modified: '2020-01-05',
    lines: 2,
    size: 80,
    url: `${url}/daily-feed/changefiles/2020-01-05-history.jsonl.gz?api_key=default`,
  },
  {
    date: '2020-01-04',
    filename: '2020-01-04-history.jsonl.gz',
    filetype: 'jsonl',
    last_modified: '2020-01-04',
    lines: 2,
    size: 80,
    url: `${url}/daily-feed/changefiles/2020-01-04-history.jsonl.gz?api_key=default`,
  },
  {
    date: '2020-01-03',
    filename: '2020-01-03-history.jsonl.gz',
    filetype: 'jsonl',
    last_modified: '2020-01-03',
    lines: 2,
    size: 80,
    url: `${url}/daily-feed/changefiles/2020-01-03-history.jsonl.gz?api_key=default`,
  },
  {
    date: '2020-01-02',
    filename: '2020-01-02-history.jsonl.gz',
    filetype: 'jsonl',
    last_modified: '2020-01-02',
    lines: 2,
    size: 80,
    url: `${url}/daily-feed/changefiles/2020-01-02-history.jsonl.gz?api_key=default`,
  },
  {
    date: '2019-01-02',
    filename: '2019-01-02-history.jsonl.gz',
    filetype: 'jsonl',
    last_modified: '2019-01-02',
    lines: 2,
    size: 80,
    url: `${url}/daily-feed/changefiles/2019-01-02-history.jsonl.gz?api_key=default`,
  },
];

const changefileWeeklyList = [
  {
    to_date: format(today, 'yyyy-MM-dd'),
    filename: 'fake1.jsonl.gz',
    filetype: 'jsonl',
    last_modified: oneWeekAgo,
    lines: 2,
    size: 80,
    url: `${url}/feed/changefiles/fake1.jsonl.gz?api_key=default`,
  },
  {
    to_date: format(twoWeekAgo, 'yyyy-MM-dd'),
    filename: 'fake2.jsonl.gz',
    filetype: 'jsonl',
    last_modified: twoWeekAgo,
    lines: 2,
    size: 80,
    url: `${url}/feed/changefiles/fake2.jsonl.gz?api_key=default`,
  },
  {
    to_date: format(threeWeekAgo, 'yyyy-MM-dd'),
    filename: 'fake3.jsonl.gz',
    filetype: 'jsonl',
    last_modified: threeWeekAgo,
    lines: 2,
    size: 80,
    url: `${url}/feed/changefiles/fake3.jsonl.gz?api_key=default`,
  },
];

const unpaywallMockInstance = jest.fn(async (config) => {
  if (config.url === '/') {
    return Promise.resolve({});
  }
  if (config.url === '/feed/snapshot') {
    const filePath = path.resolve(snapshotDir, 'snapshot.jsonl.gz');
    let readStream;
    try {
      readStream = fs.createReadStream(filePath);
    } catch (err) {
      appLogger.error(`[mock][unpaywall][snapshot]: Cannot read [${filePath}]`, err);
      return false;
    }

    return Promise.resolve({
      headers: {
        'Content-Type': 'application/gzip',
        'content-length': '1000',
      },
      data: readStream,
    });
  }
  if (config.url === '/feed/changefiles') {
    if (config.params.interval === 'day') {
      return Promise.resolve({
        data: {
          list: changefileDailyList,
        },
      });
    }

    if (config.params.interval === 'week') {
      return Promise.resolve({
        data: {
          list: changefileWeeklyList,
        },
      });
    }
  }
  if (config.url.includes('/feed/changefiles/')) {
    const filename = config.url.split('/').pop();
    const filePath = path.resolve(changefilesDir, filename);
    let readStream;
    try {
      readStream = fs.createReadStream(filePath);
    } catch (err) {
      appLogger.error(`[mock][unpaywall][changefiles]: Cannot read [${filePath}]`, err);
      return false;
    }
    return Promise.resolve({ data: readStream });
  }
  if (config.url.includes('/daily-feed/changefiles/')) {
    if (config?.params?.api_key !== apikey) {
      return Promise.resolve(401);
    }
    const filename = config.url.split('/').pop();
    const filePath = path.resolve(changefilesDir, filename);
    let readStream;
    try {
      await fsp.access(filePath, fs.constants.F_OK);
    } catch {
      return Promise.resolve({ statusCode: 404 });
    }
    try {
      readStream = fs.createReadStream(filePath);
    } catch (err) {
      appLogger.error(`[mock][unpaywall][changefiles]: Cannot read [${filePath}]`, err);
      return false;
    }

    return Promise.resolve({ data: readStream });
  }
});

module.exports = unpaywallMockInstance;
