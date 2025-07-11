const { elasticsearch } = require('config');

const checkApikey = require('../middlewares/apikey');
const { search } = require('../lib/elastic');

async function unpaywall(parent, args, req, info) {
  await checkApikey(req, args, info);

  const { attributes } = req;
  let index = req?.get('index');

  if (!index) {
    index = elasticsearch.indexBase;
  }

  // Normalize request
  const dois = [];
  args.dois.forEach((doi) => {
    dois.push(doi.toLowerCase().trim());
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
