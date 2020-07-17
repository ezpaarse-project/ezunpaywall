const router = require('express').Router();
const config = require('config');
const UnPayWallModel = require('../graphql/unpaywall/model');
const logger = require('../services/logger');
const {
  getUpdateSnapshotMetadatas,
  getStatus,
  saveDataOrUpdate,
  resetStatus,
} = require('../services/unpaywall');

/**
 * @api {get} /process/status get informations of content database
 */
router.get('/process/status', (req, res) => res.status(200).json({
  type: 'success',
  code: 200,
  message: getStatus(),
}));

// middleware
router.use((req, res, next) => {
  if (getStatus().inProcess) {
    return res.status(409).json({ type: 'error', code: 409, message: 'process in progress' });
  }
  return next();
});

/**
 * @api {get} /action/:action initialize or update database
 * @apiName InitiateDatabaseWithCompressedFile
 * @apiGroup ManageDatabase
 *
 * @apiParam (QUERY) {Number} [offset=0] first line insertion, by default, we start with the first
 * @apiParam (QUERY) {Number} [limit=0] last line insertion by default, we have no limit
 * @apiParam (PARAMS) {String} name of request (update or init)
 */
router.get('/action/:action(update|init)', async (req, res) => {
  resetStatus();
  let { offset, limit } = req.query;
  const { action } = req.params;
  if (!offset) { offset = 0; }
  if (!limit) { limit = -1; }
  if (action === 'update' || action === 'init') {
    saveDataOrUpdate({ offset: Number(offset), limit: Number(limit) });
    return res.status(200).json({
      type: 'success', code: 200, message: `start ${action}`, url: `http://localhost:${config.get('API_PORT')}/process/status`,
    });
  }
  return res.status(404).json({ type: 'error', code: 404, message: 'bad request' });
});

/**
 * @api {get} /update/download get informations of content database
 * @apiName DownloadUpdate
 * @apiGroup ManageDatabase
 */
router.get('/update/download', async (req, res) => {
  resetStatus();
  getUpdateSnapshotMetadatas();
  return res.status(200).json({
    type: 'success', code: 200, message: 'process start', url: `http://localhost:${config.get('API_PORT')}/process/status`,
  });
});

/**
 * @api {get} /databaseStatus get informations of content database
 * @apiName GetDatabaseStatus
 * @apiGroup ManageDatabase
 */
router.get('/database/status', (req, res) => {
  const status = {};
  async function databaseStatus() {
    status.doi = await UnPayWallModel.count({});
    status.is_oa = await UnPayWallModel.count({});
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
    res.status(200).json({
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
