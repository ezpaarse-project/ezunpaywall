const path = require('path');
const fs = require('fs-extra');

const updateChangefilesExample = async (interval) => {
  const changefilesExample = require(`../snapshots/changefiles-${interval}-example.json`);
  const changefilesPath = path.resolve(__dirname, '..', 'snapshots', `changefiles-${interval}.json`);

  const now = Date.now();
  const oneDay = 1 * 24 * 60 * 60 * 1000;
  const oneYear = 1 * 24 * 60 * 60 * 1000 * 365;

  if (interval === 'week') {
    changefilesExample.list[0].to_date = new Date(now - (1 * oneDay)).toISOString().slice(0, 10);
    changefilesExample.list[0].last_modified = new Date(now - (1 * oneDay))
      .toISOString().slice(0, 19);
    changefilesExample.list[0].from_date = new Date(now - (8 * oneDay)).toISOString().slice(0, 10);

    changefilesExample.list[1].to_date = new Date(now - (8 * oneDay)).toISOString().slice(0, 10);
    changefilesExample.list[1].last_modified = new Date(now - (8 * oneDay))
      .toISOString().slice(0, 19);
    changefilesExample.list[1].from_date = new Date(now - (15 * oneDay)).toISOString().slice(0, 10);

    changefilesExample.list[2].to_date = new Date(now - (15 * oneDay)).toISOString().slice(0, 10);
    changefilesExample.list[2].last_modified = new Date(now - (15 * oneDay))
      .toISOString().slice(0, 19);
    changefilesExample.list[2].from_date = new Date(now - (22 * oneDay)).toISOString().slice(0, 10);

    changefilesExample.list[3].to_date = new Date(now - oneYear - (1 * oneDay))
      .toISOString().slice(0, 10);
    changefilesExample.list[3].last_modified = new Date(now - oneYear - (1 * oneDay))
      .toISOString().slice(0, 19);
    changefilesExample.list[3].from_date = new Date(now - oneYear - (8 * oneDay))
      .toISOString().slice(0, 10);

    changefilesExample.list[4].to_date = new Date(now - oneYear - (8 * oneDay))
      .toISOString().slice(0, 10);
    changefilesExample.list[4].last_modified = new Date(now - oneYear - (8 * oneDay))
      .toISOString().slice(0, 19);
    changefilesExample.list[4].from_date = new Date(now - oneYear - (15 * oneDay))
      .toISOString().slice(0, 10);
  }

  if (interval === 'day') {
    changefilesExample.list[0].date = new Date(now - (0 * oneDay)).toISOString().slice(0, 10);
    changefilesExample.list[0].last_modified = new Date(now - (0 * oneDay))
      .toISOString().slice(0, 19);

    changefilesExample.list[1].date = new Date(now - (1 * oneDay)).toISOString().slice(0, 10);
    changefilesExample.list[1].last_modified = new Date(now - (1 * oneDay))
      .toISOString().slice(0, 19);

    changefilesExample.list[2].date = new Date(now - (2 * oneDay)).toISOString().slice(0, 10);
    changefilesExample.list[2].last_modified = new Date(now - (2 * oneDay))
      .toISOString().slice(0, 19);

    changefilesExample.list[3].date = new Date(now - oneYear - (0 * oneDay))
      .toISOString().slice(0, 10);
    changefilesExample.list[3].last_modified = new Date(now - oneYear - (0 * oneDay))
      .toISOString().slice(0, 19);

    changefilesExample.list[4].date = new Date(now - oneYear - (1 * oneDay))
      .toISOString().slice(0, 10);
    changefilesExample.list[4].last_modified = new Date(now - oneYear - (1 * oneDay))
      .toISOString().slice(0, 19);
  }

  try {
    await fs.writeFile(changefilesPath, JSON.stringify(changefilesExample, null, 2), 'utf8');
  } catch (err) {
    console.error(`Cannot write ${JSON.stringify(changefilesExample, null, 2)} in file "${changefilesPath}"`);
    console.error(err);
  }
  return true;
};

module.exports = updateChangefilesExample;
