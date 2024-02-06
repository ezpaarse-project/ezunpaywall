const config = require('config');

const checkApikey = require('../middlewares/apikey');
const { search } = require('../services/elastic');

const indexBase = config.get('elasticsearch.indexBase');

async function unpaywall(parent, args, req, info) {
  await checkApikey(req, args, info);

  const { attributes } = req;
  let index = req?.get('index');

  if (!index) {
    index = indexBase;
  }

  // Normalize request
  const dois = [];
  args.dois.forEach((doi) => {
    dois.push(doi.toLowerCase());
  });

  const body = {
    query: {
      bool: {
        filter: [
          { terms: { doi: dois } },
        ],
      },
    },
    _source: attributes,
  };

  return search(index, dois.length, body);
}

module.exports = unpaywall;
