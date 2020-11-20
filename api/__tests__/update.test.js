const axios = require('axios');

const app = require('../app');
const client = require('../lib/client');

beforeAll(async () => {
  // wait fake unpaywall started
  await new Promise((resolve) => app.on('ready', resolve));

  // TODO date des fichier à jour
  // wait elastic started
  let response;
  while (response?.statusCode !== 200) {
    try {
      // eslint-disable-next-line no-await-in-loop
      response = await client.ping();
    } catch (error) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}, 25000);

test('/update, do weekly update', async () => {
  let res1;
  try {
    res1 = await axios({
      method: 'post',
      url: 'http://localhost:8080/update',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.log(err);
  }

  await expect(res1.data).toStrictEqual({ message: 'weekly update has begun, list of task has been created on elastic' });

  let data;
  while (!Number.isNaN(data?.body?.count) || data?.body?.count < 2000) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // eslint-disable-next-line no-await-in-loop
      data = await client.count({
        index: 'unpaywall',
      });
      // eslint-disable-next-line no-await-in-loop
    } catch (err) { }
  }

  await expect(data?.body?.count).toStrictEqual(2000);

  // console.log(res2);

  // TODO test
}, 20000);
