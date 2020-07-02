const fs = require('fs');
const readline = require('readline');
const zlib = require('zlib');
const unpaywallModel = require('./api/unpaywall/model');
const logger = require('./logs/logger');

const file = './dataUPW/unpaywall_snapshot.jsonl.gz';

let counterLimit = 10000;
const nbtraitement = counterLimit;
let counterLine = 0;

const metadata = [
  'best_oa_location',
  'data_standard',
  'doi_url',
  'genre',
  'is_paratext',
  'is_oa',
  'journal_is_in_doaj',
  'journal_is_oa',
  'journal_issns',
  'journal_issn_l',
  'journal_name',
  'oa_locations',
  'oa_status',
  'published_date',
  'publisher',
  'title',
  'updated',
  'year',
  'z_authors',
  'createdAt',
];
function updateUPW(data) {
  unpaywallModel.bulkCreate(data, { updateOnDuplicate: metadata })
    .catch((error) => {
      logger.error(`BULK ERROR : ${error}`);
    });
}

// initialisation du stream du le fichier compréssé
const readStream = fs.createReadStream(file).pipe(zlib.createGunzip());

module.exports = async function processLineByLineUpdate() {
  const start = new Date();

  let tab = [];
  let countBulk = 0;

  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });
  // eslint-disable-next-line no-restricted-syntax
  for await (const line of rl) {
    if (counterLimit === 0) {
      break;
    }
    counterLine += 1;
    const data = JSON.parse(line);
    tab.push(data);
    countBulk += 1;
    if (countBulk === 1000) {
      await updateUPW(tab);
      countBulk = 0;
      tab = [];
    }
    counterLimit -= 1;
  }
  // if have stays data to insert
  if (countBulk !== 0) {
    await updateUPW(tab);
  }

  const total = (new Date() - start) / 1000;
  logger.info(`${total} secondes`);
  logger.info(`Nombre d'erreur : ${counterLine - nbtraitement}`);
};
