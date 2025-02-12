/* eslint-disable no-underscore-dangle */
const { Client } = require('@elastic/elasticsearch');
const Mock = require('@elastic/elasticsearch-mock');

const mock = new Mock();

const data = {};

/**
 * Add index
 */
mock.add(
  {
    method: 'PUT',
    path: '/:index',
  },
  (req) => {
    const indexName = req.path.substring(1);

    return {
      acknowledged: true,
      shards_acknowledged: true,
      index: indexName,
    };
  },
);

/**
 * Count
 */
mock.add(
  {
    method: 'GET',
    path: '/:index/_count',
  },
  (req) => {
    const [, indexName] = req.path.split('/');

    const count = data[indexName] ? Object.keys(data[indexName]).length : 0;

    return {
      count,
      _shards: {
        total: 1,
        successful: 1,
        skipped: 0,
        failed: 0,
      },
    };
  },
);

/**
 * Bulk
 */
mock.add(
  {
    method: 'POST',
    path: '/_bulk',
  },
  (req) => {
    const requestBody = req.body;
    const responseItems = [];
    const insertedData = {};

    let index;
    let error = false;

    for (let i = 0; i < requestBody.length; i += 2) {
      const action = requestBody[i]; // index / update / delete command
      const dataToBulk = requestBody[i + 1]; // document payload

      if (typeof dataToBulk.is_oa !== 'boolean') {
        error = true;
        responseItems.push({
          index: {
            _index: action.index._index,
            _id: action.index._id || dataToBulk.doi,
            error: {
              type: 'illegal_argument_exception',
              reason: '`is_oa` Should be boolean',
            },
          },
        });
      } else {
        if (action.index) {
          index = action.index._index;
          responseItems.push({
            index: {
              _index: action.index._index,
              _id: action.index._id || dataToBulk.doi,
              result: 'created',
            },
          });
        }
        insertedData[action.index._id] = dataToBulk;
      }
    }

    if (!error) {
      data[index] = insertedData;
    }

    return {
      took: 10,
      errors: responseItems.some((item) => item.index.status >= 400),
      items: responseItems,
    };
  },
);

const client = new Client({
  node: 'http://localhost:9200',
  Connection: mock.getConnection(),
});

module.exports = client;
