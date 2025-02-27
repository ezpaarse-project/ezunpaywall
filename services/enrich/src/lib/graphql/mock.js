const { graphql, buildSchema } = require('graphql');
const mockData = require('./mock.json');

const data = {
  unpaywall: mockData,
};

const schema = buildSchema(`
  type UnpaywallType {
    doi: ID
    best_oa_location: OaLocationType
    first_oa_location: OaLocationType
    data_standard: Int
    doi_url: String
    genre: String
    is_paratext: Boolean
    has_repository_copy: Boolean
    is_oa: Boolean
    journal_is_in_doaj: Boolean
    journal_is_oa: Boolean
    journal_issns: String
    journal_issn_l: String
    journal_name: String
    oa_locations: [OaLocationType]
    oa_status: String
    published_date: String
    publisher: String
    title: String
    updated: String
    year: String
    z_authors: [ZAuthorsType]
  }

  type OaLocationType {
    endpoint_id: ID
    evidence: String
    host_type: String
    is_best: Boolean
    license: String
    pmh_id: String
    repository_institution: String
    updated: String
    url: String
    url_for_landing_page: String
    url_for_pdf: String
    version: String
  }

  type ZAuthorsType {
    ORCID: String
    family: String
    given: String
    sequence: String
  }

  type Query {
    unpaywall(dois: [ID!]!): [UnpaywallType]
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
      console.error('Error during GraphQL execution:', error);
      return { data: { data: [] } };
    }
  }
  return Promise.resolve('Mock not implemented');
});

module.exports = graphqlMockInstance;
