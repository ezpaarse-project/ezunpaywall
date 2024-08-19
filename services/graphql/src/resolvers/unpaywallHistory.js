const { elasticsearch } = require('config');
const checkApikey = require('../middlewares/apikey');
const { search } = require('../services/elastic');
const logger = require('../lib/logger/appLogger');

async function unpaywallHistory(parent, args, req, info) {
  // TODO perf: use one requet than two
  // TODO add limit for max DOI requested

  await checkApikey(req, args, info);

  const { attributes } = req;
  let index = req?.get('index');

  if (!index) { index = elasticsearch.indexHistory; }

  const dois = [];

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
    sort: { updated: 'desc' },
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

  // Return the complete history with the current data
  if (!date) {
    let baseRes;
    // get current data
    try {
      baseRes = await search(elasticsearch.indexBase, dois.length, cloneBody);
    } catch (err) {
      logger.error(`[apollo]: Cannot search document in index [${elasticsearch.indexBase}]`, err);
      throw err;
    }
    if (baseRes.length > 0) {
      historyRes.unshift(baseRes[0]);
    }
  }

  // if we have no data in history, try to search in index_base
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
      baseRes = await search(elasticsearch.indexBase, dois.length, cloneBody);
    } catch (err) {
      logger.error(`[apollo]: Cannot search document in index [${elasticsearch.indexBase}]`, err);
      throw err;
    }

    return [...baseRes, ...historyRes];
  }

  return historyRes;
}

module.exports = unpaywallHistory;
