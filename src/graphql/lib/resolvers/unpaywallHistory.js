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
          endValidity: {
            gte: date,
          },
        },
      },
      {
        range: {
          updated: {
            lte: date,
          },
        },
      },
    );
    body.sort = 'updated';
    body.collapse = {
      field: 'doi',
    };
  }

  let historyRes = [];
  try {
    // TODO use scroll
    historyRes = await search(index, 1000, body);
  } catch (err) {
    logger.error(`[apollo]: Cannot search document in index [${index}]`, err);
    throw err;
  }

  const DOIInResponse = new Set(historyRes.map((res) => res.doi));
  const DOINotInResponse = dois.filter((doi) => !DOIInResponse.has(doi));

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

  if (date && DOINotInResponse.length !== 0) {
    cloneBody.query.bool.filter.push(
      {
        range: {
          updated: {
            lt: date,
          },
        },
      },
      {
        range: {
          referencedAt: {
            lt: date,
          },
        },
      },
    );
    cloneBody.query.bool.filter[0].terms.doi = DOINotInResponse;
    let baseRes;
    // get current data
    try {
      baseRes = await search(indexBase, dois.length, cloneBody);
    } catch (err) {
      logger.error(`[apollo]: Cannot search document in index [${indexBase}]`, err);
      throw err;
    }

    return [...historyRes, ...baseRes];
  }

  return historyRes;
}

module.exports = unpaywall;
