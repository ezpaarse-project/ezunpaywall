const { graphql, buildSchema } = require('graphql');
const mockData = require('./mock.json');
const appLogger = require('../../../../admin/src/lib/logger/appLogger');

const data = {
  unpaywall: mockData,
};

const schema = buildSchema(`
  type Unpaywall {
    doi: ID
    doi_url: String
    title: String
    genre: String
    is_paratext: Boolean
    published_date: String
    year: Int
    journal_name: String
    journal_issns: [String]
    journal_issn_l: String
    journal_is_oa: Boolean
    journal_is_in_doaj: Boolean
    publisher: String
    is_oa: Boolean
    oa_status: String
    has_repository_copy: Boolean
    data_standard: Int
    updated: String

    z_authors: [Author]
    best_oa_location: OALocation
    first_oa_location: OALocation
    oa_locations: [OALocation]
    oa_locations_embargoed: [OALocation]
  }

  type OALocation {
    url: String
    url_for_pdf: String
    url_for_landing_page: String
    license: String
    version: String
    host_type: String
    is_best: Boolean
    pmh_id: String
    endpoint_id: String
    repository_institution: String
    oa_date: String
  }

  type Author {
    author_position: String
    raw_author_name: String
    is_corresponding: Boolean
    raw_affiliation_strings: [String]
  }

  type Query {
    unpaywall(dois: [ID!]!): [Unpaywall]
  }
`);

const resolversRoot = {
  unpaywall: ({ dois }) => data.unpaywall.filter((item) => dois.includes(item.doi)),
};

const graphqlMockInstance = jest.fn(async (req) => {
  if (req.url === '/graphql') {
    const graphqlQuery = req.data.query;

    let response;

    try {
      response = await graphql({ schema, source: graphqlQuery, rootValue: resolversRoot });
      return { data: { data: response.data } };
    } catch (error) {
      appLogger.error('Error during GraphQL execution:', error);
      return { data: { data: [] } };
    }
  }
  return Promise.resolve('Mock not implemented');
});

module.exports = graphqlMockInstance;
