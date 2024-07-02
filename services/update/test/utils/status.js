const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

// TODO put it in config
const updateURL = process.env.UPDATE_HOST || 'http://localhost:59702';

/**
 * Checks if an update process is being processed
 *
 * @returns {Promise<boolean>} if in update
 */
async function checkIfInUpdate() {
  let res = true;
  try {
    res = await chai.request(updateURL).get('/status');
  } catch (err) {
    console.error(`checkIfInUpdate : ${err}`);
  }
  return res?.body;
}

module.exports = checkIfInUpdate;
