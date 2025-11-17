/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
const axios = require('axios');
const _ = require('lodash');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const dois = require('../utils/sources/DOI.json');

const simpleArgs = [
  'doi',
  'data_standard',
  'title',
  'genre',
  'is_paratext',
  'published_date',
  'year',
  'doi_url',
  'journal_name',
  'journal_issns',
  'journal_issn_l',
  'journal_is_oa',
  'journal_is_in_doaj',
  'publisher',
  'is_oa',
  'oa_status',
  'has_repository_copy',
  'updated',
];

const authorArgs = [
  'author_position',
  'raw_author_name',
  'is_corresponding',
  'raw_affiliation_strings',
];

const oaLocationArgs = [
  'url',
  'url_for_landing_page',
  'url_for_pdf',
  'license',
  'host_type',
  'is_best',
  'pmh_id',
  'endpoint_id',
  'repository_institution',
  'oa_date',
];

const ezunpaywallURL = 'https://unpaywall.inist.fr/api';

const unpaywallURL = 'https://api.unpaywall.org/';

async function getUnpaywallData(doi) {
  const requestUrlUnpaywall = `${unpaywallURL}/${doi}?email=ezteam@couperin.org`;

  let responseFromUnpaywall;

  try {
    responseFromUnpaywall = await axios({
      url: requestUrlUnpaywall,
    });
  } catch (err) {
    console.log(err.responnse);
  }

  const unpaywallData = responseFromUnpaywall.data;

  delete unpaywallData.has_repository_copy;

  delete unpaywallData?.best_oa_location?.endpoint_id;
  delete unpaywallData?.best_oa_location?.repository_institution;
  delete unpaywallData?.best_oa_location?.oa_date;

  delete unpaywallData?.first_oa_location?.endpoint_id;
  delete unpaywallData?.first_oa_location?.repository_institution;
  delete unpaywallData?.first_oa_location?.oa_date;

  for (let i = 0; i < unpaywallData?.oa_locations.length; i += 1) {
    delete unpaywallData?.oa_locations[i]?.endpoint_id;
    delete unpaywallData?.oa_locations[i]?.repository_institution;
    delete unpaywallData?.oa_locations[i]?.oa_date;
  }

  for (let i = 0; i < unpaywallData?.z_authors?.length; i += 1) {
    delete unpaywallData?.z_authors[i]?.ORCID;
    delete unpaywallData?.z_authors[i]?.affiliation;
    delete unpaywallData?.z_authors[i]?.sequence;
    delete unpaywallData?.z_authors[i]?.['authenticated-orcid'];
    delete unpaywallData?.z_authors[i]?.suffix;
  }

  delete unpaywallData?.oa_locations_embargoed;

  return unpaywallData;
}

async function getEzunpaywallData(doi) {
  let responseFromEzunpaywall;
  try {
    responseFromEzunpaywall = await axios({
      method: 'POST',
      url: `${ezunpaywallURL}/graphql`,
      data:
        {
          query: `{ 
            unpaywall(dois: ["${doi}"]) {
              ${simpleArgs.join(',')},
              best_oa_location { ${oaLocationArgs.join(',')} },
              oa_locations { ${oaLocationArgs.join(',')} },
              first_oa_location { ${oaLocationArgs.join(',')} },
              z_authors { ${authorArgs} }
            } 
          }`,
        },
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-api-key': 'demo',
      },
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.log(err);
    return;
  }

  const ezunpaywallData = responseFromEzunpaywall?.data?.data?.unpaywall[0];

  ezunpaywallData.year = parseInt(ezunpaywallData.year, 10);
  for (let i = 0; i < ezunpaywallData?.z_authors?.length; i += 1) {
    delete ezunpaywallData?.z_authors[i]?.ORCID;
    delete ezunpaywallData?.z_authors[i]?.['authenticated-orcid'];
    delete ezunpaywallData?.z_authors[i]?.suffix;
  }
  return ezunpaywallData;
}

/**
 * Compare two objects and return their differences.
 *
 * @param {Object} unpaywallData - First object to compare from unpaywall.
 * @param {Object} ezunpaywallData - Second object to compare from ezunpaywall.
 *
 * @returns {Object} Differences between the two objects.
 */
function getObjectDiff(unpaywallData, ezunpaywallData) {
  return _.reduce(unpaywallData, (result, value, key) => {
    const res = result;
    if (!_.isEqual(value, ezunpaywallData[key])) {
      res[key] = { unpaywall: value, ezunpaywall: ezunpaywallData[key] };
    }
    return res;
  }, {});
}

describe('unpaywall: test integrity', () => {
  const count = dois.length;

  it('Unpaywall and Ezunpaywall should be the same', async () => {
    let i = 0;
    let same = 0;
    let oaSame = 0;
    for (const id of dois) {
      const unpaywallData = await getUnpaywallData(id);
      const ezunpaywallData = await getEzunpaywallData(id);
      const differences = getObjectDiff(unpaywallData, ezunpaywallData);
      if (!_.isEmpty(differences)) {
        // console.log(differences);
      } else {
        same += 1;
      }

      if (unpaywallData.is_oa !== ezunpaywallData.is_oa || unpaywallData.oa_status !== ezunpaywallData.oa_status) {
        console.log(`doi: ${unpaywallData.doi}`);
        console.log(`unpaywall.is_oa: ${unpaywallData.is_oa} ezunpaywall.is_oa: ${ezunpaywallData.is_oa}`);
        console.log(`unpaywall.oa_status: ${unpaywallData.oa_status} ezunpaywall.oa_status: ${ezunpaywallData.oa_status}`);
      } else {
        oaSame += 1;
      }
      i += 1;
      console.log(`number of DOI: ${i}, oa same: ${oaSame}`);
    }

    console.log(`OA: ${oaSame}/${count}`);
    console.log(`Pure same: ${same}/${count}`);

    expect(oaSame).toEqual(count);
    expect(same).toEqual(count);
  }, 200000);
});
