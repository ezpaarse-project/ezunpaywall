const graphql = require('graphql');
const { UnpaywallType, UnpaywallModel } = require('./index');
const ZAuthorsInputType = require('../z_author/inputType');
const OaLocationInputType = require('../oa_location/inputType');

const {
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLID,
} = graphql;

module.exports = {
  addUnpaywall: {
    type: UnpaywallType,
    args: {
      best_oa_location: { type: GraphQLString },
      data_standard: { type: GraphQLInt },
      doi: { type: GraphQLID },
      doi_url: { type: GraphQLString },
      genre: { type: GraphQLString },
      is_paratext: { type: GraphQLBoolean },
      is_oa: { type: GraphQLBoolean },
      journal_is_in_doaj: { type: GraphQLBoolean },
      journal_is_oa: { type: GraphQLBoolean },
      journal_issns: { type: GraphQLString },
      journal_issn_l: { type: GraphQLString },
      journal_name: { type: GraphQLString },
      oa_locations: { type: GraphQLString },
      oa_status: { type: GraphQLString },
      published_date: { type: GraphQLString },
      publisher: { type: GraphQLString },
      title: { type: GraphQLString },
      updated: { type: GraphQLString },
      year: { type: GraphQLString },
      z_authors: { type: GraphQLString },
    },
    resolve(parent, args) {
      return UnpaywallModel.create({
        best_oa_location: args.best_oa_location,
        data_standard: args.data_standard,
        doi: args.doi,
        doi_url: args.doi_url,
        genre: args.genre,
        is_paratext: args.is_paratext,
        is_oa: args.is_oa,
        journal_is_in_doaj: args.journal_is_in_doaj,
        journal_is_oa: args.journal_is_oa,
        journal_issns: args.journal_issns,
        journal_issn_l: args.journal_issn_l,
        journal_name: args.journal_name,
        oa_locations: args.oa_locations,
        oa_status: args.oa_status,
        published_date: args.published_date,
        publisher: args.publisher,
        title: args.title,
        updated: args.updated,
        year: args.year,
        z_authors: args.z_authors,
      })
        .then((unpaywall) => unpaywall)
        .catch((err) => console.log(err));
    },
  },
  updateAuthor: {
    type: UnpaywallType,
    args: {
      best_oa_location: { type: GraphQLString },
      data_standard: { type: GraphQLInt },
      doi: { type: new GraphQLNonNull(GraphQLID) },
      doi_url: { type: GraphQLString },
      genre: { type: GraphQLString },
      is_paratext: { type: GraphQLBoolean },
      is_oa: { type: GraphQLBoolean },
      journal_is_in_doaj: { type: GraphQLBoolean },
      journal_is_oa: { type: GraphQLBoolean },
      journal_issns: { type: GraphQLString },
      journal_issn_l: { type: GraphQLString },
      journal_name: { type: GraphQLString },
      oa_locations: { type: GraphQLString },
      oa_status: { type: GraphQLString },
      published_date: { type: GraphQLString },
      publisher: { type: GraphQLString },
      title: { type: GraphQLString },
      updated: { type: GraphQLString },
      year: { type: GraphQLString },
      z_authors: { type: GraphQLString },
    },
    resolve(parent, args) {
      const update = {};
      if (args.best_oa_location) {
        update.best_oa_location = args.best_oa_location;
      }
      if (args.data_standard) {
        update.data_standard = args.data_standard;
      }
      return UnpaywallModel.findByPk({ doi: args.doi }).on('success', (data) => {
        if(data) {
          data.update({

          });
        }
      });
    },
  },
  deleteAuthor: {
    type: UnpaywallType,
    args: {
      _id: { type: new GraphQLNonNull(GraphQLID) },
    },
    async resolve(parent, args) {
      const deletedAuthor = await UnpaywallModel.destroy({
        where: {
          doi: args.doi,
        },
      });
      return deletedAuthor;
    },
  },
};
