const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

// TODO put it in config
const updateURL = process.env.UPDATE_HOST || 'http://localhost:59702';

/**
 * get state of update
 * @returns {JSON} state
 */
const getState = async () => {
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
};

module.exports = {
  getState,
};
