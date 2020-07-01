const Sequelize = require('sequelize');
const db = require('../../database/database');

const UnPayWallModel = db.define('upw', {
  best_oa_location: {
    type: Sequelize.JSON,
  },
  data_standard: {
    type: Sequelize.INTEGER,
  },
  doi: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  doi_url: {
    type: Sequelize.STRING,
  },
  genre: {
    type: Sequelize.STRING,
  },
  is_paratext: {
    type: Sequelize.BOOLEAN,
  },
  is_oa: {
    type: Sequelize.BOOLEAN,
  },
  journal_is_in_doaj: {
    type: Sequelize.BOOLEAN,
  },
  journal_is_oa: {
    type: Sequelize.BOOLEAN,
  },
  journal_issns: {
    type: Sequelize.STRING,
  },
  journal_issn_l: {
    type: Sequelize.STRING,
  },
  journal_name: {
    type: Sequelize.STRING,
  },
  oa_locations: {
    type: Sequelize.ARRAY(Sequelize.JSON),
  },
  oa_status: {
    type: Sequelize.STRING,
  },
  published_date: {
    type: Sequelize.STRING,
  },
  publisher: {
    type: Sequelize.STRING,
  },
  title: {
    type: Sequelize.STRING,
  },
  updated: {
    type: Sequelize.STRING,
  },
  year: {
    type: Sequelize.STRING,
  },
  z_authors: {
    type: Sequelize.ARRAY(Sequelize.JSON),
  },
});


module.exports = UnPayWallModel;
