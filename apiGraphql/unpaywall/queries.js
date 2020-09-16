const graphql = require('graphql');
const { UnPayWallType } = require('./index');
const client = require('../../client/client');

const {
  GraphQLList,
  GraphQLID,
} = graphql;

module.exports = {
  getDatasUPW: {
    type: new GraphQLList(UnPayWallType),
    args: {
      dois: { type: new GraphQLList(GraphQLID) },
    },
    resolve: async (parent, args) => {
      const res = await client.search({
        index: 'unpaywall',
        size: 2,
        body: {
          query: {
            bool: {
              filter: [
                {
                  terms: {
                    'doi.keyword': args.dois,
                  },
                },
              ],
            },
          },
        },
      });
      return res.body.hits.hits.map((hit) => hit._source);
    },
  },
};
