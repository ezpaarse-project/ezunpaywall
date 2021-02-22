// /* eslint-disable no-await-in-loop */
// const { expect } = require('chai');
// const chai = require('chai');
// const chaiHttp = require('chai-http');

// const indexUnpawall = require('../index/unpaywall.json');
// const indexTask = require('../index/task.json');

// const {
//   createIndex,
//   deleteIndex,
//   countDocuments,
//   isTaskEnd,
//   getTask,
// } = require('./utils/elastic');

// const {
//   deleteFile,
// } = require('./utils/file');

// const {
//   getLatestReport,
// } = require('./utils/report');

// const {
//   ping,
// } = require('./utils/ping');

// const ezunpaywallURL = 'http://localhost:8080';

// chai.use(chaiHttp);

// describe('Test: download and insert file from unpaywall between a period', () => {
//   const now = Date.now();
//   const oneDay = (1 * 24 * 60 * 60 * 1000);

//   // create date in a format (YYYY-mm-dd) to be use by ezunpaywall
//   const dateNow = new Date(now).toISOString().slice(0, 10);
//   // yersterday
//   const date1 = new Date(now - (1 * oneDay)).toISOString().slice(0, 10);
//   // yersterday - one week
//   const date2 = new Date(now - (8 * oneDay)).toISOString().slice(0, 10);
//   // yersterday - two weeks
//   const date3 = new Date(now - (15 * oneDay)).toISOString().slice(0, 10);
//   // theses dates are for test between a short period
//   const date4 = new Date(now - (4 * oneDay)).toISOString().slice(0, 10);
//   const date5 = new Date(now - (5 * oneDay)).toISOString().slice(0, 10);
//   const tomorrow = new Date(now + (1 * oneDay)).toISOString().slice(0, 10);

//   before(async () => {
//     await ping();
//     await deleteFile('fake1.jsonl.gz');
//     await deleteFile('fake2.jsonl.gz');
//     await deleteFile('fake3.jsonl.gz');
//   });

//   describe(`Do a download and insert between ${date2} and now`, async () => {
//     before(async () => {
//       await createIndex('task', indexTask);
//       await createIndex('unpaywall', indexUnpawall);
//     });

//     // test return message
//     it('Should return the process start', async () => {
//       const res = await chai.request(ezunpaywallURL)
//         .post(`/update?startDate=${date2}`)
//         .set('Access-Control-Allow-Origin', '*')
//         .set('Content-Type', 'application/json');
//       expect(res).have.status(200);
//       expect(res.body.message).be.equal(`insert snapshot beetween ${date2} and ${dateNow} has begun, list of task has been created on elastic`);
//     });

//     // test insertion
//     it('Should insert 150 datas', async () => {
//       let taskEnd;
//       while (!taskEnd) {
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//         taskEnd = await isTaskEnd();
//       }
//       const count = await countDocuments();
//       expect(count).to.equal(150);
//     });

//     // test task
//     it('Should get task with all informations from the download and insertion', async () => {
//       const task = await getTask();

//       expect(task).have.property('done').equal(true);
//       expect(task).have.property('currentTask').equal('end');
//       expect(task).have.property('steps');
//       expect(task).have.property('createdAt');
//       expect(task).have.property('endAt');
//       expect(task).have.property('took');

//       expect(task.steps[0]).have.property('task').equal('fetchUnpaywall');
//       expect(task.steps[0]).have.property('took');
//       expect(task.steps[0]).have.property('status').equal('success');

//       expect(task.steps[1]).have.property('task').equal('download');
//       expect(task.steps[1]).have.property('file').equal('fake2.jsonl.gz');
//       expect(task.steps[1]).have.property('percent').equal(100);
//       expect(task.steps[1]).have.property('took');
//       expect(task.steps[1]).have.property('status').equal('success');

//       expect(task.steps[2]).have.property('task').equal('insert');
//       expect(task.steps[2]).have.property('file').equal('fake2.jsonl.gz');
//       expect(task.steps[2]).have.property('percent').equal(100);
//       expect(task.steps[2]).have.property('lineRead').equal(100);
//       expect(task.steps[2]).have.property('took');
//       expect(task.steps[2]).have.property('status').equal('success');

//       expect(task.steps[3]).have.property('task').equal('download');
//       expect(task.steps[3]).have.property('file').equal('fake1.jsonl.gz');
//       expect(task.steps[3]).have.property('percent').equal(100);
//       expect(task.steps[3]).have.property('took');
//       expect(task.steps[3]).have.property('status').equal('success');

//       expect(task.steps[4]).have.property('task').equal('insert');
//       expect(task.steps[4]).have.property('file').equal('fake1.jsonl.gz');
//       expect(task.steps[4]).have.property('percent').equal(100);
//       expect(task.steps[4]).have.property('lineRead').equal(50);
//       expect(task.steps[4]).have.property('took');
//       expect(task.steps[4]).have.property('status').equal('success');
//     });

//     // test report
//     it('Should get report with all informations from the download and insertion', async () => {
//       const report = await getLatestReport();

//       expect(report).have.property('done').equal(true);
//       expect(report).have.property('currentTask').equal('end');
//       expect(report).have.property('steps');
//       expect(report).have.property('createdAt');
//       expect(report).have.property('endAt');
//       expect(report).have.property('took');

//       expect(report.steps[0]).have.property('task').equal('fetchUnpaywall');
//       expect(report.steps[0]).have.property('took');
//       expect(report.steps[0]).have.property('status').equal('success');

//       expect(report.steps[1]).have.property('task').equal('download');
//       expect(report.steps[1]).have.property('file').equal('fake2.jsonl.gz');
//       expect(report.steps[1]).have.property('percent').equal(100);
//       expect(report.steps[1]).have.property('took');
//       expect(report.steps[1]).have.property('status').equal('success');

//       expect(report.steps[2]).have.property('task').equal('insert');
//       expect(report.steps[2]).have.property('file').equal('fake2.jsonl.gz');
//       expect(report.steps[2]).have.property('percent').equal(100);
//       expect(report.steps[2]).have.property('lineRead').equal(100);
//       expect(report.steps[2]).have.property('took');
//       expect(report.steps[2]).have.property('status').equal('success');

//       expect(report.steps[3]).have.property('task').equal('download');
//       expect(report.steps[3]).have.property('file').equal('fake1.jsonl.gz');
//       expect(report.steps[3]).have.property('percent').equal(100);
//       expect(report.steps[3]).have.property('took');
//       expect(report.steps[3]).have.property('status').equal('success');

//       expect(report.steps[4]).have.property('task').equal('insert');
//       expect(report.steps[4]).have.property('file').equal('fake1.jsonl.gz');
//       expect(report.steps[4]).have.property('percent').equal(100);
//       expect(report.steps[4]).have.property('lineRead').equal(50);
//       expect(report.steps[4]).have.property('took');
//       expect(report.steps[4]).have.property('status').equal('success');
//     });

//     after(async () => {
//       await deleteFile('fake1.jsonl.gz');
//       await deleteFile('fake2.jsonl.gz');
//       await deleteIndex('unpaywall');
//       await deleteIndex('task');
//     });
//   });

//   describe(`Do a download and insert between ${date3} and ${date2}`, () => {
//     before(async () => {
//       await createIndex('task', indexTask);
//       await createIndex('unpaywall', indexUnpawall);
//     });

//     // test return message
//     it('Should return the process start', async () => {
//       const res = await chai.request(ezunpaywallURL)
//         .post(`/update?startDate=${date3}&endDate=${date2}`)
//         .set('Access-Control-Allow-Origin', '*')
//         .set('Content-Type', 'application/json');

//       expect(res).have.status(200);
//       expect(res.body.message).be.equal(`insert snapshot beetween ${date3} and ${date2} has begun, list of task has been created on elastic`);
//     });

//     // test insertion
//     it('Should insert 2100 datas', async () => {
//       let taskEnd;
//       while (!taskEnd) {
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//         taskEnd = await isTaskEnd();
//       }
//       const count = await countDocuments();
//       expect(count).to.equal(2100);
//     });

//     // test task
//     it('Should get task with all informations from the download and insertion', async () => {
//       const task = await getTask();

//       expect(task).have.property('done').equal(true);
//       expect(task).have.property('currentTask').equal('end');
//       expect(task).have.property('steps');
//       expect(task).have.property('createdAt');
//       expect(task).have.property('endAt');
//       expect(task).have.property('took');

//       expect(task.steps[0]).have.property('task').equal('fetchUnpaywall');
//       expect(task.steps[0]).have.property('took');
//       expect(task.steps[0]).have.property('status').equal('success');

//       expect(task.steps[1]).have.property('task').equal('download');
//       expect(task.steps[1]).have.property('file').equal('fake3.jsonl.gz');
//       expect(task.steps[1]).have.property('percent').equal(100);
//       expect(task.steps[1]).have.property('took');
//       expect(task.steps[1]).have.property('status').equal('success');

//       expect(task.steps[2]).have.property('task').equal('insert');
//       expect(task.steps[2]).have.property('file').equal('fake3.jsonl.gz');
//       expect(task.steps[2]).have.property('percent').equal(100);
//       expect(task.steps[2]).have.property('lineRead').equal(2000);
//       expect(task.steps[2]).have.property('took');
//       expect(task.steps[2]).have.property('status').equal('success');

//       expect(task.steps[3]).have.property('task').equal('download');
//       expect(task.steps[3]).have.property('file').equal('fake2.jsonl.gz');
//       expect(task.steps[3]).have.property('percent').equal(100);
//       expect(task.steps[3]).have.property('took');
//       expect(task.steps[3]).have.property('status').equal('success');

//       expect(task.steps[4]).have.property('task').equal('insert');
//       expect(task.steps[4]).have.property('file').equal('fake2.jsonl.gz');
//       expect(task.steps[4]).have.property('percent').equal(100);
//       expect(task.steps[4]).have.property('lineRead').equal(100);
//       expect(task.steps[4]).have.property('took');
//       expect(task.steps[4]).have.property('status').equal('success');
//     });

//     // test task
//     it('Should get report with all informations from the download and insertion', async () => {
//       const report = await getLatestReport();

//       expect(report).have.property('done').equal(true);
//       expect(report).have.property('currentTask').equal('end');
//       expect(report).have.property('steps');
//       expect(report).have.property('createdAt');
//       expect(report).have.property('endAt');
//       expect(report).have.property('took');

//       expect(report.steps[0]).have.property('task').equal('fetchUnpaywall');
//       expect(report.steps[0]).have.property('took');
//       expect(report.steps[0]).have.property('status').equal('success');

//       expect(report.steps[1]).have.property('task').equal('download');
//       expect(report.steps[1]).have.property('file').equal('fake3.jsonl.gz');
//       expect(report.steps[1]).have.property('percent').equal(100);
//       expect(report.steps[1]).have.property('took');
//       expect(report.steps[1]).have.property('status').equal('success');

//       expect(report.steps[2]).have.property('task').equal('insert');
//       expect(report.steps[2]).have.property('file').equal('fake3.jsonl.gz');
//       expect(report.steps[2]).have.property('percent').equal(100);
//       expect(report.steps[2]).have.property('lineRead').equal(2000);
//       expect(report.steps[2]).have.property('took');
//       expect(report.steps[2]).have.property('status').equal('success');

//       expect(report.steps[3]).have.property('task').equal('download');
//       expect(report.steps[3]).have.property('file').equal('fake2.jsonl.gz');
//       expect(report.steps[3]).have.property('percent').equal(100);
//       expect(report.steps[3]).have.property('took');
//       expect(report.steps[3]).have.property('status').equal('success');

//       expect(report.steps[4]).have.property('task').equal('insert');
//       expect(report.steps[4]).have.property('file').equal('fake2.jsonl.gz');
//       expect(report.steps[4]).have.property('percent').equal(100);
//       expect(report.steps[4]).have.property('lineRead').equal(100);
//       expect(report.steps[4]).have.property('took');
//       expect(report.steps[4]).have.property('status').equal('success');
//     });
//     after(async () => {
//       await deleteFile('fake1.jsonl.gz');
//       await deleteFile('fake2.jsonl.gz');
//       await deleteIndex('unpaywall');
//       await deleteIndex('task');
//     });
//   });

//   describe(`Don't download and insert between ${date5} and ${date4} because there is no file between these dates in ezunpaywall`, () => {
//     before(async () => {
//       await createIndex('task', indexTask);
//       await createIndex('unpaywall', indexUnpawall);
//     });

//     // test return message
//     it('Should return the process start', async () => {
//       const res = await chai.request(ezunpaywallURL)
//         .post(`/update?startDate=${date5}&endDate=${date4}`)
//         .set('Access-Control-Allow-Origin', '*')
//         .set('Content-Type', 'application/json');
//       expect(res).have.status(200);
//       expect(res.body.message).be.equal(`insert snapshot beetween ${date5} and ${date4} has begun, list of task has been created on elastic`);
//     });

//     // test insertion
//     it('Should insert nothing', async () => {
//       let taskEnd;
//       while (!taskEnd) {
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//         taskEnd = await isTaskEnd();
//       }
//       const count = await countDocuments();
//       expect(count).to.equal(null);
//     });

//     // test task
//     it('Should get task with all informations from the download and insertion', async () => {
//       const task = await getTask();

//       expect(task).have.property('done').equal(true);
//       expect(task).have.property('currentTask').equal('end');
//       expect(task).have.property('steps');
//       expect(task).have.property('createdAt');
//       expect(task).have.property('endAt');
//       expect(task).have.property('took');

//       expect(task.steps[0]).have.property('task').equal('fetchUnpaywall');
//       expect(task.steps[0]).have.property('took');
//       expect(task.steps[0]).have.property('status').equal('success');
//     });
//   });

//   describe(`Don't do a download and insert with endDate=${date1} only`, () => {
//     // test return message
//     it('Should return a error message', async () => {
//       const res = await chai.request(ezunpaywallURL)
//         .post(`/update?endDate=${date1}`)
//         .set('Access-Control-Allow-Origin', '*')
//         .set('Content-Type', 'application/json');
//       expect(res).have.status(400);
//       expect(res.body.message).be.equal('start date is missing');
//     });
//   });

//   describe('Don\'t do a download and insert with startDate in the wrong format', () => {
//     // test return message
//     it('Should return a error message', async () => {
//       const res = await chai.request(ezunpaywallURL)
//         .post('/update?startDate=LookAtMyDab')
//         .set('Access-Control-Allow-Origin', '*')
//         .set('Content-Type', 'application/json');
//       expect(res).have.status(400);
//       expect(res.body.message).be.equal('startDate are in bad format, date need to be in format YYYY-mm-dd');
//     });

//     // test return message
//     it('Should return a error message', async () => {
//       const res = await chai.request(ezunpaywallURL)
//         .post('/update?startDate=01-01-2000')
//         .set('Access-Control-Allow-Origin', '*')
//         .set('Content-Type', 'application/json');
//       expect(res).have.status(400);
//       expect(res.body.message).be.equal('startDate are in bad format, date need to be in format YYYY-mm-dd');
//     });

//     // test return message
//     it('Should return a error message', async () => {
//       const res = await chai.request(ezunpaywallURL)
//         .post('/update?startDate=2000-50-50')
//         .set('Access-Control-Allow-Origin', '*')
//         .set('Content-Type', 'application/json');
//       expect(res).have.status(400);
//       expect(res.body.message).be.equal('startDate are in bad format, date need to be in format YYYY-mm-dd');
//     });
//   });

//   describe(`Don't download and insert between ${date2} and ${date3} because startDate=${date2} is superior than endDate=${date3}`, () => {
//     // test return message
//     it('Should return a error message', async () => {
//       const res = await chai.request(ezunpaywallURL)
//         .post(`/update?startDate=${date2}&endDate=${date3}`)
//         .set('Access-Control-Allow-Origin', '*')
//         .set('Content-Type', 'application/json');
//       expect(res).have.status(400);
//       expect(res.body.message).be.equal('endDate is lower than startDate');
//     });
//   });

//   describe(`Don't download and insert with startDate=${tomorrow} because there can be no futuristic file`, () => {
//     // test return message
//     it('Should return a error message', async () => {
//       const res = await chai.request(ezunpaywallURL)
//         .post(`/update?startDate=${tomorrow}`)
//         .set('Access-Control-Allow-Origin', '*')
//         .set('Content-Type', 'application/json');
//       expect(res).have.status(400);
//       expect(res.body.message).be.equal('startDate is in the futur');
//     });
//   });

//   after(async () => {
//     await deleteIndex('unpaywall');
//     await deleteIndex('task');
//     await deleteFile('fake1.jsonl.gz');
//     await deleteFile('fake2.jsonl.gz');
//     await deleteFile('fake3.jsonl.gz');
//   });
// });