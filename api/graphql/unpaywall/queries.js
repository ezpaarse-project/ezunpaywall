const graphql = require('graphql');
const { UnPayWallType } = require('./index');
const client = require('../../lib/client');

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
        size: args.dois.length || 1000,
        body: {
          query: {
            bool: {
              filter: [
                {
                  terms: {
                    doi: args.dois,
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
