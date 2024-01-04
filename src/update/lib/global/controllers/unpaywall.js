const { getChangefiles } = require('../../services/unpaywall');

/**
 * Controller to get list of changefiles on unpaywall.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function getChangefilesOfUnpaywall(req, res, next) {
  const interval = req.data;

  let snapshotsInfo;

  try {
    snapshotsInfo = await getChangefiles(interval, new Date(0), new Date());
  } catch (err) {
    return next({ message: err.message });
  }

  // delete apikey
  // eslint-disable-next-line no-param-reassign, no-return-assign
  snapshotsInfo.map((info) => [info.url] = info.url.split('?'));

  const { latest } = req.query;
  if (latest) {
    return res.status(200).json(snapshotsInfo[0]);
  }
  return res.status(200).json(snapshotsInfo);
}

module.exports = getChangefilesOfUnpaywall;
