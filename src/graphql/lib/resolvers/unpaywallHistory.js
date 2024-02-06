const config = require('config');
const checkApikey = require('../middlewares/apikey');
const { search } = require('../services/elastic');
const logger = require('../logger');

const indexBase = config.get('elasticsearch.indexBase');
const indexHistory = config.get('elasticsearch.indexHistory');

async function unpaywall(parent, args, req, info) {
  await checkApikey(req, args, info);

  const { attributes } = req;
  let index = req?.get('index');

  if (!index) { index = indexHistory; }

  const dois = [];

  req.countDOI = args?.dois?.length;

  // Normalize request
  args.dois.forEach((doi) => {
    dois.push(doi.toLowerCase());
  });

  const body = {
    query: {
      bool: {
        filter: [
          {
            terms: { doi: dois },
          },
        ],
      },
    },
    _source: attributes,
  };

  const cloneBody = JSON.parse(JSON.stringify(body));

  const { date } = args;
  if (date) {
    body.query.bool.filter.push(
      {
        range: {
          updated: {
            gte: date,
          },
        },
      },
    );
    body.query.bool.filter.push(
      {
        range: {
          endValidity: {
            lt: date,
          },
        },
      },
    );
    body.sort = 'updated';
  }

  let historyRes = [];
  try {
    // TODO use scroll
    historyRes = await search(index, 1000, body);
  } catch (err) {
    logger.error(`[apollo]: Cannot search document in index [${index}]`, err);
    throw err;
  }

  if (!date) {
    let baseRes;
    // get current data
    try {
      baseRes = await search(indexBase, dois.length, cloneBody);
    } catch (err) {
      logger.error(`[apollo]: Cannot search document in index [${indexBase}]`, err);
      throw err;
    }

    historyRes.unshift(baseRes[0]);
  }

  if (date && historyRes.length === 0) {
    cloneBody.query.bool.filter.push(
      {
        range: {
          referencedAt: {
            lt: date,
          },
        },
      },
    );
    let baseRes;
    // get current data
    // TODO if date is less than referencedAt, get empty array
    try {
      baseRes = await search(indexBase, dois.length, cloneBody);
    } catch (err) {
      logger.error(`[apollo]: Cannot search document in index [${indexBase}]`, err);
      throw err;
    }

    return baseRes;
  }

  return historyRes;
}

module.exports = unpaywall;
