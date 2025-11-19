const { updateDOI, getCount, getCachedDOI } = require('../../lib/doi');

async function updateDOIController(req, res, next) {
  const { dois } = req.body;

  if (!Array.isArray(dois)) {
    return res.status(400).json({ message: 'Dois must be an array' });
  }

  try {
    await updateDOI(dois);
  } catch (err) {
    return next({ message: err.message });
  }

  return res.status(202).json();
}

async function getCountDOIController(req, res, next) {
  const count = await getCount();

  return res.status(200).json(count);
}

async function getDOICachedController(req, res, next) {
  const cachedDOI = await getCachedDOI();

  return res.status(200).json(cachedDOI);
}

module.exports = {
  updateDOIController,
  getDOICachedController,
  getCountDOIController,
};
