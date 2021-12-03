const router = require('express').Router();
const fs = require('fs-extra');

const updateChangefilesExample = require('../bin/changefiles');

router.patch('/changefiles', async (req, res, next) => {
  const { interval } = req.query;
  if (!interval) {
    return res.status(400).json({ message: 'interval expected' });
  }

  const intervals = ['week', 'day'];
  if (!intervals.includes(interval)) {
    return res.status(404).json({ message: `${interval} is not accepted, only week and day are accepted` });
  }

  const changefilesExample = require(`../snapshots/changefiles-${interval}-example.json`);

  // create local file if dosn't exist
  const changefilesPath = `../snapshots/changefiles-${interval}.json`;
  try {
    await fs.ensureFile(changefilesPath);
  } catch (err) {
    console.error(err);
    return next(err);
  }

  try {
    await fs.writeFile(changefilesPath, JSON.stringify(changefilesExample, null, 2), 'utf8');
  } catch (err) {
    console.error(`Cannot write ${JSON.stringify(changefilesExample, null, 2)} in file "${changefilesPath}"`);
    console.error(err);
    return next(err);
  }

  try {
    await updateChangefilesExample(interval);
  } catch (err) {
    console.error(err);
    return next(err);
  }

  return res.set('Location', changefilesPath).status(200).end();
});

module.exports = router;