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

mock.add(
  {
    method: 'DELETE',
    path: '/:index',
  },
  (req) => {
    const indexName = req.path.substring(1);

    if (data[indexName]) {
      delete data[indexName];
    }

    return {
      acknowledged: true,
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
      } else if (action.index) {
        const docId = action.index._id || dataToBulk.doi;
        index = action.index._index;

        if (!data[index]) {
          data[index] = {};
        }

        if (data[index][docId]) {
          // Update existing document
          const existingDoc = data[index][docId];

          data[index][docId] = {
            ...existingDoc,
            ...dataToBulk,
            version: existingDoc.version || dataToBulk.version,
            updated: dataToBulk.updated || existingDoc.updated,
            referencedAt: dataToBulk.referencedAt || existingDoc.referencedAt,
          };

          responseItems.push({
            index: {
              _index: index,
              _id: docId,
              result: 'updated',
            },
          });
        } else {
          // Insert new document
          data[index][docId] = dataToBulk;
          responseItems.push({
            index: {
              _index: index,
              _id: docId,
              result: 'created',
            },
          });
        }

        insertedData[docId] = data[index][docId];
      }
    }

    if (!error) {
      data[index] = { ...data[index], ...insertedData };
    }

    return {
      took: 10,
      errors: responseItems.some((item) => item.index.error),
      items: responseItems,
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

mock.add({ method: 'POST', path: '/:index/_search' }, (req) => {
  const [, indexName] = req.path.split('/');
  if (!data[indexName]) return { hits: { hits: [] } };

  const { query } = req.body;
  const dois = query.bool.filter[0].terms.doi;
  const result = Object.values(data[indexName]).filter((doc) => dois.includes(doc.doi));
  return { hits: { hits: result.map((doc) => ({ _source: doc })) } };
});

const client = new Client({
  node: 'http://localhost:9200',
  Connection: mock.getConnection(),
});

module.exports = client;
