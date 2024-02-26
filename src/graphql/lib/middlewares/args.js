const logger = require('../logger');

function getNumberOfDOI(req) {
  const patternBetweenBracket = /.*?(\[.*?\]).*?$/i;
  const patternBetweenBracketQuery = /.*?(\[".*?"\]).*?$/i;
  // BODY
  // {
  //  query: 'query ($dois: [ID!]!) { GetByDOI(dois:  $dois',
  //  variables: { dois: [ '10.1186/s40510-015-0109-6' ] }
  // }
  if (req?.body?.variables?.dois) { return req.body.variables.dois.length; }
  // BODY
  // query: '{ GetByDOI(dois: ["10.1186/s40510-015-0109-6","Coin Coin"]) { doi, is_oa } }'
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
  // query: '{ GetByDOI(dois:["10.1186/s40510-015-0109-6"]
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
