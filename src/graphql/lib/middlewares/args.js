function getNumberOfDOI(req) {
  const patternBetweenBracket = /.*?(\[.*?\]).*?$/i;
  // BODY
  // {
  //  query: 'query ($dois: [ID!]!) {GetByDOI(dois: $dois) {doi, is_oa}}',
  //  variables: { dois: [ '10.1186/s40510-015-0109-6' ] }
  // }
  if (req?.body?.variables?.dois) {
    return req.body.variables.dois.length || '-';
  }
  // BODY
  // query: '{GetByDOI(dois:["10.1186/s40510-015-0109-6","Coin Coin"]){doi, is_oa}}'
  if (req?.body?.query) {
    const match = patternBetweenBracket.exec(req?.body?.query);
    const listOfDOI = JSON.parse(match[1]);
    return listOfDOI.length || '-';
  }
  // query: '{ GetByDOI(dois:["10.1186/s40510-015-0109-6"]) { doi, is_oa } }
  const match = patternBetweenBracket.exec(req.query.query);
  const listOfDOI = JSON.parse(match[1]);
  return listOfDOI.length || '-';
}

module.exports = getNumberOfDOI;
