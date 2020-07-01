const graphql = require('graphql');
const { UnPayWallType, UnPayWallModel } = require('./index');

const {
  GraphQLList,
  GraphQLID,
} = graphql;

module.exports = {
  unpaywalls: {
    type: new GraphQLList(UnPayWallType),
    resolve: () => UnPayWallModel.findAll(),
  },
  getDatasUPW: {
    type: new GraphQLList(UnPayWallType),
    args: {
      dois: { type: new GraphQLList(GraphQLID) },
    },
    resolve: (parent, args) => UnPayWallModel.findAll({
      where: {
        doi: args.dois,
      },
    }),
  },
};
