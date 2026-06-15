const router = require('express').Router();

const { updateDOI, getCount, getCachedDOI } = require('../lib/doi');
const countDOI = require('../middlewares/doi');

/**
 * Route that update one doi on ezunpaywall from unpaywall.
 */
router.post('/doi/update', countDOI, async (req, res, next) => {
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
});

/**
 * Route to get count of doi updated in current day.
 */
router.get('/doi/update/count', async (req, res) => {
  const count = await getCount();

  return res.status(200).json(count);
});

/**
 * Route to get cache of doi updated in current day.
 */
router.get('/doi/update/cache', async (req, res) => {
  const cachedDOI = await getCachedDOI();

  return res.status(200).json(cachedDOI);
});

module.exports = router;
