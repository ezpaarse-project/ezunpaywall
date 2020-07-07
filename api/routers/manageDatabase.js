const router = require('express').Router();
const fs = require('fs');
const readline = require('readline');
const zlib = require('zlib');
const UnPayWallModel = require('../graphql/unpaywall/model');
const logger = require('../../logs/logger');

function saveDataOrUpdate(file, offset, limit) {
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
  // upsert
  function updateUPW(data) {
    logger.info(`${counterLine}th Lines processed`);
    UnPayWallModel.bulkCreate(data, { updateOnDuplicate: metadata })
      .catch((error) => {
        logger.error(`ERROR IN UPSERT : ${error}`);
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
      // test limit
      if (counterLine === limit) {
        break;
      }
      // test offset
      if (counterLine >= offset) {
        countBulk += 1;
        const data = JSON.parse(line);
        tab.push(data);
      }
      counterLine += 1;
      if ((countBulk % 1000) === 0 && countBulk !== 0) {
        await updateUPW(tab);
        tab = [];
      }
    }
    // if have stays data to insert
    if (countBulk > 0) {
      await updateUPW(tab);
    }

    const total = (new Date() - start) / 1000;
    logger.info('============= FINISH =============');
    logger.info(`${total} seconds`);
    logger.info(`Number of treated lines : ${countBulk}`);
    logger.info(`Number of errors : ${counterLine - (countBulk + offset)}`);
  }
  processLineByLineUpdate();
}

/**
 * @api {get} /firstInitialization initialize database with a compressed file
 * @apiName InitiateDatabaseWithCompressedFile
 * @apiGroup ManageDatabase
 *
 * @apiParam (QUERY) {Number} [offset=0] first line insertion, by default, we start with the first
 * @apiParam (QUERY) {Number} [limit=0] last line insertion by default, we have no limit
 */
router.get('/firstInitialization', async (req, res) => {
  let { offset, limit } = req.query;
  if (!offset) { offset = 0; }
  if (!limit) { limit = -1; }
  const file = './dataUPW/unpaywall_snapshot.jsonl.gz';
  saveDataOrUpdate(file, Number(offset), Number(limit));
  res.json({ name: 'first initialization with file compressed' });
});


/**
 * // TODO voir pour automatisé le lancement de ce script avec un
 * téléchargement automatique des mise à jour
 * @api {get} /updateDatabase update database with weekly snapshot
 * @apiName UpdateDatabaseWithCompressedFile
 * @apiGroup ManageDatabase
 *
 * @apiParam (QUERY) {Number} [offset=0] first line insertion, by default, we start with the first
 * @apiParam (QUERY) {Number} [limit=0] last line insertion by default, we have no limit
 *
 */
router.get('/updateDatabase', (req, res) => {
  let { offset, limit } = req.query;
  if (!offset) { offset = 0; }
  if (!limit) { limit = -1; }
  const file = './dataUPW/update.gz';
  saveDataOrUpdate(file, Number(offset), Number(limit));
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
    logger.info(`Databse status - doi:${status.doi}, is_oa ${status.is_oa}, journal_issn_l: ${status.journal_issn_l}, publisher: ${status.publisher}, gold: ${status.gold}, hybrid: ${status.hybrid}, bronze: ${status.bronze}, green: ${status.green}, closed: ${status.closed}`);
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
