const UnpaywallModel = require('./api/unpaywall/model');
const logger = require('./logs/logger');

module.exports = async function status() {
  const res = {};

  // doi
  res.doi = await UnpaywallModel.count({
    distinct: true,
  });

  // is_oa
  res.is_oa = await UnpaywallModel.count({
    where: {
      is_oa: true,
    },
  });

  // journal_issnl
  res.journal_issn_l = await UnpaywallModel.count({
    col: 'journal_issn_l',
    distinct: true,
  });


  res.publisher = await UnpaywallModel.count({
    col: 'publisher',
    distinct: true,
  });

  res.gold = await UnpaywallModel.count({
    where: {
      oa_status: 'gold',
    },
  });

  res.hybrid = await UnpaywallModel.count({
    where: {
      oa_status: 'hybrid',
    },
  });

  res.bronze = await UnpaywallModel.count({
    where: {
      oa_status: 'bronze',
    },
  });

  res.green = await UnpaywallModel.count({
    where: {
      oa_status: 'green',
    },
  });

  res.closed = await UnpaywallModel.count({
    where: {
      oa_status: 'closed',
    },
  });

  await logger.info(`Etat de la base - doi: ${res.doi}, is_oa ${res.is_oa}, journal_issn_l: ${res.journal_issn_l}, publisher: ${res.publisher}, gold: ${res.gold}, hybrid: ${res.hybrid}, bronze: ${res.bronze}, green: ${res.green}, closed: ${res.closed}`);

  return res;
};
