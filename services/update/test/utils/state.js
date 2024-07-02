const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

// TODO put it in config
const updateURL = process.env.UPDATE_HOST || 'http://localhost:59702';

/**
 * Get state of update.
 *
 * @returns {Promise<Object>} state
 */
async function getState() {
  let res;
  try {
    res = await chai.request(updateURL)
      .get('/states')
      .query({ latest: true });
  } catch (err) {
    console.error(`Cannot GET state: ${err}`);
    process.exit(1);
  }
  return res?.body;
}

module.exports = {
  getState,
};
