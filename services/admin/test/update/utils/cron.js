const chai = require('chai');
const chaiHttp = require('chai-http');

const adminURL = process.env.ADMIN_URL || 'http://localhost:59703';

chai.use(chaiHttp);

/**
 * Get report of update.
 *
 * @returns {Promise<void>}
 */
async function resetCronConfig(type) {
  let config;
  if (type === 'dataUpdate') {
    config = {
      schedule: '0 0 0 * * *',
      index: 'unpaywall',
      interval: 'day',
    };
  }

  if (type === 'dataUpdateHistory') {
    config = {
      schedule: '0 0 0 * * *',
      index: 'unpaywall-base',
      indexHistory: 'unpaywall-history',
      interval: 'day',
    };
  }

  try {
    await chai.request(adminURL)
      .patch(`/cron/${type}`)
      .send(config)
      .set('x-api-key', 'changeme');
  } catch (err) {
    console.error(`Cannot PATCH ${adminURL}/cron`);
    process.exit(1);
  }
}

module.exports = resetCronConfig;
