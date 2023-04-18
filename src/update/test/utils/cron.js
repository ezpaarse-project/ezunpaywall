const chai = require('chai');
const chaiHttp = require('chai-http');

const updateURL = process.env.UPDATE_HOST || 'http://localhost:59702';

chai.use(chaiHttp);

/**
 * Get report of update.
 *
 * @returns {Promise<void>}
 */
async function resetCronConfig() {
  try {
    await chai.request(updateURL)
      .patch('/cron')
      .send({ time: '0 0 0 * * *', index: 'unpaywall', interval: 'day' })
      .set('x-api-key', 'changeme');
  } catch (err) {
    console.error(`Cannot PATCH ${updateURL}/cron`);
    process.exit(1);
  }
}

module.exports = resetCronConfig;
