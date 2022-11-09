const chai = require('chai');
const chaiHttp = require('chai-http');

const updateURL = process.env.UPDATE_HOST || 'http://localhost:59702';

chai.use(chaiHttp);

/**
 * get report of update
 * @returns {JSON} report
 */
async function resetCronConfig() {
  let res;
  try {
    res = await chai.request(updateURL)
      .patch('/cron')
      .send({ time: '0 0 0 * * *', index: 'unpaywall', interval: 'day' })
      .set('x-api-key', 'admin');
  } catch (err) {
    console.error(`Cannot PATCH ${updateURL}/cron`);
    process.exit(1);
  }
  return res?.body;
}

module.exports = resetCronConfig;
