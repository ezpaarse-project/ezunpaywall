const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

// TODO put it in config
const adminURL = process.env.ADMIN_URL || 'http://localhost:59703';

/**
 * Checks if an update process is being processed
 *
 * @returns {Promise<boolean>} if in update
 */
async function checkStatus() {
  let res = true;
  try {
    res = await chai.request(adminURL).get('/job/status');
  } catch (err) {
    console.error(`checkStatus : ${err}`);
  }
  return res?.body;
}

module.exports = checkStatus;
