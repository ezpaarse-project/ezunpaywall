describe('history TODO', () => {
  it('TODO', async () => {
    expect(1 + 1).toBe(2);
  });
});

// const request = require('supertest');
// const { apikey } = require('config');

// const app = require('../../../../../src/app');

// const { getStatus, getState, getReport } = require('../../../../utils/job');
// const { countDocuments } = require('../../../../utils/elastic');
// const { addSnapshot, insertSnapshot } = require('../../../../utils/file');
// const resetAll = require('../../../../utils/reset');
// const testState = require('../../report');

// const date2 = '2020-01-02';
// const date3 = '2020-01-03';
// const date4 = '2020-01-04';
// const date5 = '2020-01-05';
// const date6 = '2020-01-06';

// describe('Job: start history changefile download and insert', () => {
//   const baseIndexName = 'unpaywall-test';
//   const historyIndexName = 'unpaywall-history-test';

//   afterAll(async () => {
//     await resetAll();
//     app.close();
//   });

//   describe('[job][changefiles][history][download][insert][day]: Classic history job', () => {
//     beforeAll(async () => {
//       await resetAll();
//       await addSnapshot('2020-01-01-snapshot.jsonl.gz');
//       await insertSnapshot('2020-01-01-snapshot.jsonl.gz', baseIndexName);
//     });

//     afterAll(async () => {
//       await resetAll();
//     });

//     // region 2020-01-02

//     const reportConfig1 = {
//       index: baseIndexName,
//       error: false,
//       name: '[changefiles][history][download][insert]',
//       indices: [
//         {
//           index: baseIndexName,
//           added: 0,
//           updated: 3,
//         },
//         {
//           index: historyIndexName,
//           added: 3,
//           updated: 0,
//         },
//       ],
//       steps: [
//         {
//           task: 'getChangefiles',
//           status: 'success',
//         },
//         {
//           task: 'download',
//           status: 'success',
//           file: '2020-01-02-history.jsonl.gz',
//           percent: 100,
//         },
//         {
//           task: 'insert',
//           status: 'success',
//           file: '2020-01-02-history.jsonl.gz',
//           percent: 100,
//           linesRead: 3,
//         },
//       ],
//     };

//     it('[2020-01-02-history.jsonl.gz]: Should start history job download and insert', async () => {
//       const response = await request(app)
//         .post('/job/changefiles/history/download/insert')
//         .send({
//           startDate: date2,
//           endDate: date3,
//           index: baseIndexName,
//           indexHistory: historyIndexName,
//         })
//         .set('x-api-key', apikey);

//       expect(response.statusCode).toBe(202);
//     });

//     it('[2020-01-02-history.jsonl.gz]: Should count 5 data in base and 3 data in history', async () => {
//       // wait for the update to finish
//       let isUpdate = true;
//       while (isUpdate) {
//         await new Promise((resolve) => { setTimeout(resolve, 100); });
//         isUpdate = await getStatus();
//       }

//       const countUnpaywallBase = await countDocuments(baseIndexName);
//       expect(countUnpaywallBase).toBe(5);

//       const countUnpaywallHistory = await countDocuments(historyIndexName);
//       expect(countUnpaywallHistory).toBe(3);
//     });

//     it('[2020-01-02-history.jsonl.gz]: Should get state with all information from the insertion for', async () => {
//       const state = await getState();
//       testState(state, reportConfig1);
//     });

//     it('[2020-01-02-history.jsonl.gz]: Should get report with all information from the insertion', async () => {
//       const report = await getReport('[changefiles][insert]');
//       testState(report, reportConfig1);
//     });

//     // #endregion 2020-01-02

//     // region 2020-01-03
//     const reportConfig2 = {
//       index: baseIndexName,
//       error: false,
//       name: '[changefiles][history][download][insert]',
//       indices: [
//         {
//           index: baseIndexName,
//           added: 0,
//           updated: 2,
//         },
//         {
//           index: historyIndexName,
//           added: 2,
//           updated: 0,
//         },
//       ],
//       steps: [
//         {
//           task: 'getChangefiles',
//           status: 'success',
//         },
//         {
//           task: 'download',
//           status: 'success',
//           file: '2020-01-03-history.jsonl.gz',
//           percent: 100,
//         },
//         {
//           task: 'insert',
//           status: 'success',
//           file: '2020-01-03-history.jsonl.gz',
//           percent: 100,
//           linesRead: 2,
//         },
//       ],
//     };

//     it('[2020-01-03-history.jsonl.gz]: Should start history job download and insert', async () => {
//       const response = await request(app)
//         .post('/job/changefiles/history/download/insert')
//         .send({
//           startDate: date3,
//           endDate: date4,
//           index: baseIndexName,
//           indexHistory: historyIndexName,
//         })
//         .set('x-api-key', apikey);

//       expect(response.statusCode).toBe(202);
//     });

//     it('[2020-01-03-history.jsonl.gz]: Should count 5 data in base and 5 data in history', async () => {
//       // wait for the update to finish
//       let isUpdate = true;
//       while (isUpdate) {
//         await new Promise((resolve) => { setTimeout(resolve, 100); });
//         isUpdate = await getStatus();
//       }

//       const countUnpaywallBase = await countDocuments(baseIndexName);
//       expect(countUnpaywallBase).toBe(5);

//       const countUnpaywallHistory = await countDocuments(historyIndexName);
//       expect(countUnpaywallHistory).toBe(5);
//     });

//     it('[2020-01-03-history.jsonl.gz]: Should get state with all information from the insertion', async () => {
//       const state = await getState();
//       testState(state, reportConfig2);
//     });

//     it('[2020-01-03-history.jsonl.gz]: Should get report with all information from the insertion', async () => {
//       const report = await getReport('[changefiles][insert]');
//       testState(report, reportConfig2);
//     });

//     // endregion 2020-01-03

//     // region 2020-01-04
//     const reportConfig3 = {
//       index: baseIndexName,
//       error: false,
//       name: '[changefiles][history][download][insert]',
//       indices: [
//         {
//           index: baseIndexName,
//           added: 2,
//           updated: 0,
//         },
//         {
//           index: historyIndexName,
//           added: 0,
//           updated: 0,
//         },
//       ],
//       steps: [
//         {
//           task: 'getChangefiles',
//           status: 'success',
//         },
//         {
//           task: 'download',
//           file: '2020-01-04-history.jsonl.gz',
//           status: 'success',
//           percent: 100,
//         },
//         {
//           task: 'insert',
//           status: 'success',
//           file: '2020-01-04-history.jsonl.gz',
//           percent: 100,
//           linesRead: 2,
//         },
//       ],
//     };
//     it('[2020-01-04-history.jsonl.gz]: Should start history job download and insert', async () => {
//       const response = await request(app)
//         .post('/job/changefiles/history/download/insert')
//         .send({
//           startDate: date4,
//           endDate: date5,
//           index: baseIndexName,
//           indexHistory: historyIndexName,
//         })
//         .set('x-api-key', apikey);

//       expect(response.statusCode).toBe(202);
//     });

//     it('[2020-01-04-history.jsonl.gz]: Should count 7 data in base and 5 data in history', async () => {
//       // wait for the update to finish
//       let isUpdate = true;
//       while (isUpdate) {
//         await new Promise((resolve) => { setTimeout(resolve, 100); });
//         isUpdate = await getStatus();
//       }

//       const countUnpaywallBase = await countDocuments(baseIndexName);
//       expect(countUnpaywallBase).toBe(7);

//       const countUnpaywallHistory = await countDocuments(historyIndexName);
//       expect(countUnpaywallHistory).toBe(5);
//     });

//     it('[2020-01-04-history.jsonl.gz]: Should get state with all information from the insertion', async () => {
//       const state = await getState();
//       testState(state, reportConfig3);
//     });

//     it('[2020-01-04-history.jsonl.gz]: Should get report with all information from the insertion', async () => {
//       const report = await getReport('[changefiles][insert]');
//       testState(report, reportConfig3);
//     });

//     // endregion 2020-01-04

//     // region 2020-01-05
//     const reportConfig4 = {
//       index: baseIndexName,
//       error: false,
//       name: '[changefiles][history][download][insert]',
//       indices: [
//         {
//           index: baseIndexName,
//           added: 0,
//           updated: 2,
//         },
//         {
//           index: historyIndexName,
//           added: 0,
//           updated: 0,
//         },
//       ],
//       steps: [
//         {
//           task: 'getChangefiles',
//           status: 'success',
//         },
//         {
//           task: 'download',
//           file: '2020-01-05-history.jsonl.gz',
//           percent: 100,
//           status: 'success',
//         },
//         {
//           task: 'insert',
//           file: '2020-01-05-history.jsonl.gz',
//           percent: 100,
//           status: 'success',
//           linesRead: 2,
//         },
//       ],
//     };
//     it('[2020-01-05-history.jsonl.gz]: Should start history job download and insert', async () => {
//       const response = await request(app)
//         .post('/job/changefiles/history/download/insert')
//         .send({
//           startDate: date5,
//           endDate: date6,
//           index: baseIndexName,
//           indexHistory: historyIndexName,
//         })
//         .set('x-api-key', apikey);

//       expect(response.statusCode).toBe(202);
//     });

//     it('[2020-01-05-history.jsonl.gz]: Should count 7 data in base and 5 data in history', async () => {
//       // wait for the update to finish
//       let isUpdate = true;
//       while (isUpdate) {
//         await new Promise((resolve) => { setTimeout(resolve, 100); });
//         isUpdate = await getStatus();
//       }

//       const countUnpaywallBase = await countDocuments(baseIndexName);
//       expect(countUnpaywallBase).toBe(7);

//       const countUnpaywallHistory = await countDocuments(historyIndexName);
//       expect(countUnpaywallHistory).toBe(5);
//     });

//     it('[2020-01-05-history.jsonl.gz]: Should get state with all information from the insertion', async () => {
//       const state = await getState();
//       testState(state, reportConfig4);
//     });

//     it('[2020-01-05-history.jsonl.gz]: Should get report with all information from the insertion', async () => {
//       const report = await getReport('[changefiles][insert]');
//       testState(report, reportConfig4);
//     });

//     // endregion 2020-01-05
//   });
// });
