const logger = require('../logger');

function getNumberOfDOI(req) {
  const patternBetweenBracket = /.*?(\[.*?\]).*?$/i;
  const patternBetweenBracketQuery = /.*?(\[".*?"\]).*?$/i;
  // BODY
  // {
  //  query: 'query ($dois: [ID!]!) { unpaywall(dois:  $dois) { doi, is_oa } }',
  //  variables: { dois: [ '10.1186/s40510-015-0109-6' ] }
  // }
  if (req?.body?.variables?.dois) { return req.body.variables.dois.length; }
  // BODY
  // query: '{ unpaywall(dois: ["10.1186/s40510-015-0109-6","Coin Coin"]) { doi, is_oa } }'
  if (req?.body?.query) {
    const match = patternBetweenBracketQuery.exec(req?.body?.query);
    let parsedMatch;
    if (match?.length >= 1) {
      try {
        parsedMatch = JSON.parse(match[1]);
        return parsedMatch.length;
      } catch (err) {
        logger.error(`[express] Cannot parse [${match}]`);
        return 0;
      }
    }
  }
  // query: '{ unpaywall(dois:["10.1186/s40510-015-0109-6"]) { doi, is_oa } }'
  if (req?.query?.query) {
    const match = patternBetweenBracket.exec(req.query.query);
    if (match?.length >= 1) {
      try {
        const parsedMatch = JSON.parse(match[1]);
        return parsedMatch.length;
      } catch (err) {
        logger.error(`[express] Cannot parse [${match}]`);
        return 0;
      }
    }
  }

  return 0;
}

module.exports = getNumberOfDOI;
