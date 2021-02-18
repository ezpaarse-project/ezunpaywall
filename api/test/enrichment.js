// /* eslint-disable no-await-in-loop */
// const chai = require('chai');
// const { expect } = require('chai');
// const chaiHttp = require('chai-http');
// const fs = require('fs-extra');
// const path = require('path');
// const axios = require('axios');

// chai.should();
// chai.use(chaiHttp);

// const client = require('../lib/client');
// const { logger } = require('../lib/logger');

// const indexUnpawall = require('../index/unpaywall.json');
// const indexTask = require('../index/task.json');

// const {
//   createIndex,
//   countDocuments,
//   isTaskEnd,
//   deleteFile,
//   deleteIndex,
// } = require('./utils');

// describe('test enrichment (command ezu)', () => {
//   const ezunpaywallURL = 'http://localhost:8080';
//   const fakeUnpaywallURL = 'http://localhost:12000';
//   before(async () => {
//     // wait ezunpaywall
//     let res1;
//     while (res1?.body?.data !== 'pong') {
//       try {
//         res1 = await chai.request(ezunpaywallURL).get('/ping');
//       } catch (err) {
//         logger.error(`ezunpaywall ping : ${err}`);
//       }
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//     }
//     // wait fakeUnpaywall
//     let res2;
//     while (res2?.body?.data !== 'pong') {
//       try {
//         res2 = await chai.request(fakeUnpaywallURL).get('/ping');
//       } catch (err) {
//         logger.error(`fakeUnpaywall ping : ${err}`);
//       }
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//     }
//     // wait elastic started
//     let res3;
//     while (res3?.statusCode !== 200) {
//       try {
//         res3 = await client.ping();
//       } catch (err) {
//         logger.error(`elastic ping : ${err}`);
//       }
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//     }
//     await deleteIndex('unpaywall');
//     await deleteIndex('task');
//     await deleteFile('fake1.jsonl.gz');
//     await deleteFile('fake2.jsonl.gz');
//     await deleteFile('fake3.jsonl.gz');
//   });

//   describe('/update weekly update', () => {
//     before(async () => {
//       await createIndex('task', indexTask);
//       await createIndex('unpaywall', indexUnpawall);
//     });

//     // test response
//     it('should return the process start', async () => {
//       const response = await chai.request(ezunpaywallURL)
//         .post('/update')
//         .set('Access-Control-Allow-Origin', '*')
//         .set('Content-Type', 'application/json');

//       response.should.have.status(200);
//       response.body.should.have.property('message');
//       response.body.message.should.be.equal('weekly update has begun, list of task has been created on elastic');
//     });

//     // test insertion
//     it('should insert 50 datas', async () => {
//       let taskEnd;
//       while (!taskEnd) {
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//         taskEnd = await isTaskEnd();
//       }
//       const count = await countDocuments();
//       expect(count).to.equal(50);
//     });

//     it('should return the enriched file', async () => {
//       // const response = await chai.request(ezunpaywallURL)
//       //   .post('/enrich/json')
//       //   .attach('fileField', path.resolve(__dirname, 'enrichment', 'file.jsonl'), 'file.jsonl')
//       //   .set('Access-Control-Allow-Origin', '*')
//       //   .set('Content-Type', 'multipart/form-data')
//       //   .buffer();

//       // try {
//       //   const writer = fs.createWriteStream(path.resolve(__dirname, 'tmp', 'enriched.jsonl'));
//       //   response.pipe(writer);
//       // } catch (err) {
//       //   console.log(err);
//       // }

//       let res;
//       try {
//         res = await axios({
//           method: 'POST',
//           url: 'localhost:8080/enrich/json',
//           data: fs.createReadStream(path.resolve(__dirname, 'enrichment', 'file.jsonl')),
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//           responseType: 'stream',
//         });
//       } catch (err) {
//         logger.error(err);
//       }
//       const writer = fs.createWriteStream(path.resolve(__dirname, 'tmp', 'enriched.jsonl'));
//       res.data.pipe(writer);
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
