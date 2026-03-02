import getElasticClient from './client';

import appLogger from '~/lib/logger/appLogger';

const elasticClient = getElasticClient();

/**
 * Do a bulk request to elastic.
 *
 * @param data List of object to send in bulk.
 * @param refresh If true, refresh index after bulk.
 * @returns list of response of elastic.
 */
export async function bulk(data: Object[], refresh = false): Promise<Object[]> {
  if (data.length === 0) {
    appLogger.warn('[elastic]: No data is send for bulk');
    return [];
  }

  let elasticResult;
  try {
    elasticResult = await elasticClient.bulk({ body: data, refresh });
  } catch (err) {
    appLogger.error('[elastic]: Cannot bulk', err);
    throw err;
  }

  return elasticResult;
}

/**
 * Create index if it doesn't exist.
 *
 * @param indexName Name of index
 * @param mapping mapping in JSON format
 *
 */
export async function createIndex(indexName: string, mapping: any): Promise<void> {
  if (!elasticClient) {
    throw new Error('[elastic]: Elastic client is not initialized');
  }

  const exist = await checkIfIndexExist(indexName);
  if (!exist) {
    try {
      await elasticClient.indices.create({
        index: indexName,
        body: mapping,
      });
    } catch (err) {
      appLogger.error(`[elastic]: Cannot create index [${indexName}]`);
      throw err;
    }
    appLogger.info(`[elastic]: Index [${indexName}] is created`);
  }
}

/**
 * Check if index exit.
 *
 * @param indexName Name of index
 *
 * @returns is exist
 */
export async function checkIfIndexExist(indexName: string): Promise<boolean> {
  if (!elasticClient) {
    throw new Error('[elastic]: Elastic client is not initialized');
  }

  let res;
  try {
    res = await elasticClient.indices.exists({
      index: indexName,
    });
  } catch (err) {
    appLogger.error(`[elastic]: Cannot check if dndex exist [${indexName}]`);
    throw err;
  }
  return res.body;
}