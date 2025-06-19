/* eslint-disable quote-props */
/* eslint-disable no-underscore-dangle */
const { Client } = require('@elastic/elasticsearch');
const Mock = require('@elastic/elasticsearch-mock');

const mock = new Mock();

const data = {
  unpaywall: {
    '1': {
      doi: '1',
      is_oa: true,
      oa_status: 'gold',
      z_authors: [
        {
          author_position: '1',
          raw_author_name: 'John Doe',
          is_corresponding: true,
          raw_affiliation_strings: [
            'University',
          ],
        },
      ],
      oa_locations: [
        {
          url: 'http://localhost',
          url_for_pdf: 'http://localhost',
          url_for_landing_page: 'http://localhost',
          evidence: 'deprecated',
          license: 'cc-by',
          version: 'submittedVersion',
          host_type: 'repository',
          is_best: true,
          pmh_id: 'oai:http://localhost',
          endpoint_id: '1',
          repository_institution: 'University',
          oa_date: '2020-01-01',
          updated: 'deprecated',
        },
      ],
    },
    '2': { doi: '2', is_oa: true, oa_status: 'hybrid' },
    '3aA': { doi: '3aA', is_oa: true, oa_status: 'bronze' },
    '4A': { doi: '4A', is_oa: true, oa_status: 'green' },
    '5a': { doi: '5a', is_oa: false, oa_status: 'closed' },
  },
  'unpaywall-test': {
    '1': { doi: '1', is_oa: true, oa_status: 'gold' },
    '2': { doi: '2', is_oa: true, oa_status: 'hybrid' },
    '3': { doi: '3', is_oa: true, oa_status: 'bronze' },
    '4': { doi: '4', is_oa: true, oa_status: 'green' },
    '5': { doi: '5', is_oa: false, oa_status: 'closed' },
  },
};

mock.add(
  {
    method: 'POST',
    path: '/:index/_search',
  },
  (req) => {
    const [, indexName] = req.path.split('/');

    // aggregations
    if (req.body.aggs) {
      if (!data[indexName]) {
        return {
          aggregations: {
            isOA: { doc_count: 0 },
            goldOA: { doc_count: 0 },
            hybridOA: { doc_count: 0 },
            bronzeOA: { doc_count: 0 },
            greenOA: { doc_count: 0 },
            closedOA: { doc_count: 0 },
          },
        };
      }

      const documents = Object.values(data[indexName]);

      const countByFilter = (filter) => documents.filter((doc) => {
        const [key, value] = Object.entries(filter.term)[0];
        return doc[key] === value;
      }).length;

      return {
        aggregations: {
          isOA: { doc_count: countByFilter({ term: { is_oa: true } }) },
          goldOA: { doc_count: countByFilter({ term: { oa_status: 'gold' } }) },
          hybridOA: { doc_count: countByFilter({ term: { oa_status: 'hybrid' } }) },
          bronzeOA: { doc_count: countByFilter({ term: { oa_status: 'bronze' } }) },
          greenOA: { doc_count: countByFilter({ term: { oa_status: 'green' } }) },
          closedOA: { doc_count: countByFilter({ term: { oa_status: 'closed' } }) },
        },
      };
    }

    // search by DOI
    if (req.body.query) {
      const documents = Object.values(data[indexName]);

      const ids = req.body.query.bool.filter[0].terms.doi.map((id) => id.toLowerCase());

      const filteredData = documents.filter((doc) => ids.includes(doc.doi.toLowerCase()));

      const tt = filteredData.slice(0, req.body.size).map((doc) => ({
        _source: doc,
      }));

      return {
        hits: {
          hits: tt,
        },
      };
    }
    return 'No mock implemented';
  },
);

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
