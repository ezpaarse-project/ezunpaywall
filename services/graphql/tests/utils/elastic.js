const { elasticClient } = require('../../src/lib/elastic');

/**
 * Count how many documents there are in an index.
 *
 * @param {string} name Name of index.
 *
 * @returns {Promise<number>} number of document.
 */
async function countDocuments(name) {
  let response;
  try {
    response = await elasticClient.count({
      index: name,
    });
  } catch (err) {
    console.error('[test][utils][elastic]: Cannot count');
    console.error(err);
  }
  return response?.body?.count ? response?.body?.count : 0;
}
/**
 * Delete index.
 *
 * @param {string} name Name of index.
 *
 * @returns {Promise}
 */
async function deleteIndex(indexName) {
  try {
    await elasticClient.indices.delete({
      index: indexName,
    });
  } catch (err) {
    console.error('[test][utils][elastic]: Cannot delete index');
    console.error(err);
  }
}

module.exports = {
  countDocuments,
  deleteIndex,
};
