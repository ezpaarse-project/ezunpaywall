const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

// TODO put it in config
const updateURL = process.env.UPDATE_URL || 'http://localhost:4000';

/**
 * get state of update
 * @returns {JSON} state
 */
const getState = async () => {
  let res;
  try {
    res = await chai.request(updateURL)
      .get('/state')
      .query({ latest: true });
  } catch (err) {
    console.error(`getState: ${err}`);
  }
  return res?.body?.state;
};

module.exports = {
  getState,
};
