const graphql = require('graphql');
const { UnpaywallType, UnpaywallModel } = require('./index');

const {
  GraphQLList,
  GraphQLID,
} = graphql;

module.exports = {
  unpaywall: {
    type: UnpaywallType,
    args: {
      doi: { type: GraphQLID },
    },
    resolve: (parent, args) => UnpaywallModel.findByPk(args.doi),
  },
  unpaywalls: {
    type: new GraphQLList(UnpaywallType),
    resolve: () => UnpaywallModel.findAll(),
  },
  unpaywallByLot: {
    type: new GraphQLList(UnpaywallType),
    args: {
      dois: { type: new GraphQLList(GraphQLID) },
    },
    resolve: (parent, args) => UnpaywallModel.findAll({
      where: {
        doi: args.dois,
      },
    }),
  },
};
