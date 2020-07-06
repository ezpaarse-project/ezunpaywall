const router = require('express').Router();
const fs = require('fs');
const readline = require('readline');
const zlib = require('zlib');
const UnPayWallModel = require('../graphql/unpaywall/model');
const logger = require('../../logs/logger');

function saveDataOrUpdate(file) {
  let counterLimit = 10000;
  const nbtraitement = counterLimit;
  let counterLine = 0;
  // UnPayWall attributes
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
  // create and update
  function updateUPW(data) {
    UnPayWallModel.bulkCreate(data, { updateOnDuplicate: metadata })
      .catch((error) => {
        logger.error(`BULK ERROR : ${error}`);
      });
  }

  // stream initialization
  const readStream = fs.createReadStream(file).pipe(zlib.createGunzip());

  async function processLineByLineUpdate() {
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
  }
  processLineByLineUpdate();
}
/**
 * @api {get} /firstInitialization initialize database with a compressed file
 * @apiName InitiateDatabaseWithCompressedFile
 * @apiGroup ManageDatabase
 */
router.get('/firstInitialization', async (req, res) => {
  const file = './dataUPW/unpaywall_snapshot.jsonl.gz';
  saveDataOrUpdate(file);
  res.json({ name: 'first initialization with file compressed' });
});

// TODO voir pour automatisé le lancement de ce script avec un
// téléchargement automatique des mise à jour
/**
 * @api {get} /updateDatabase update database with weekly snapshot
 * @apiName UpdateDatabaseWithCompressedFile
 * @apiGroup ManageDatabase
 */
router.get('/updateDatabase', (req, res) => {
  const file = './dataUPW/update.gz';
  saveDataOrUpdate(file);
  res.json({ name: 'update database ...' });
});
/**
 * @api {get} /databaseStatus get informations of content database
 * @apiName GetDatabaseStatus
 * @apiGroup ManageDatabase
 */
router.get('/databaseStatus', (req, res) => {
  const status = {};
  async function databaseStatus() {
    status.doi = await UnPayWallModel.count({
      distinct: true,
    });
    status.is_oa = await UnPayWallModel.count({
      where: {
        is_oa: true,
      },
    });
    status.journal_issn_l = await UnPayWallModel.count({
      col: 'journal_issn_l',
      distinct: true,
    });
    status.publisher = await UnPayWallModel.count({
      col: 'publisher',
      distinct: true,
    });
    status.gold = await UnPayWallModel.count({
      where: {
        oa_status: 'gold',
      },
    });
    status.hybrid = await UnPayWallModel.count({
      where: {
        oa_status: 'hybrid',
      },
    });
    status.bronze = await UnPayWallModel.count({
      where: {
        oa_status: 'bronze',
      },
    });
    status.green = await UnPayWallModel.count({
      where: {
        oa_status: 'green',
      },
    });
    status.closed = await UnPayWallModel.count({
      where: {
        oa_status: 'closed',
      },
    });
    logger.info(`Etat de la base - doi:${status.doi}, is_oa ${status.is_oa}, journal_issn_l: ${status.journal_issn_l}, publisher: ${status.publisher}, gold: ${status.gold}, hybrid: ${status.hybrid}, bronze: ${status.bronze}, green: ${status.green}, closed: ${status.closed}`);
    res.json({
      doi: status.doi,
      is_oa: status.is_oa,
      journal_issn_l: status.journal_issn_l,
      publisher: status.publisher,
      gold: status.gold,
      hybrid: status.hybrid,
      bronze: status.bronze,
      green: status.green,
      closed: status.closed,
    });
  }
  databaseStatus();
});

module.exports = router;
