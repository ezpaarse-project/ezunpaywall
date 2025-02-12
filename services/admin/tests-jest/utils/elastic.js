const { elasticClient } = require('../../src/lib/elastic');

/**
 * Count how many documents there are in an index.
 *
 * @param {string} name Name of index.
 *
 * @returns {Promise<number>} number of document.
 */
async function countDocuments(name) {
  let data;
  try {
    data = await elasticClient.count({
      index: name,
    });
  } catch (err) {
    console.error('[test][utils][elastic]: Cannot count');
    console.error(err);
  }
  return data?.body?.count ? data?.body?.count : 0;
}

module.exports = {
  countDocuments,
};
