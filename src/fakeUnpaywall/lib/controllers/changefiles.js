const path = require('path');
const fs = require('fs-extra');

const changefilesWeek = require('../../snapshots/changefiles-week-example.json');
const changefilesDay = require('../../snapshots/changefiles-day-example.json');

async function updateChangefilesExample(interval) {
  const changefilesWeekPath = path.resolve(__dirname, '..', '..', 'snapshots', 'changefiles-week.json');
  const changefilesDayPath = path.resolve(__dirname, '..', '..', 'snapshots', 'changefiles-day.json');

  const now = Date.now();
  const oneDay = 1 * 24 * 60 * 60 * 1000;
  const oneYear = 1 * 24 * 60 * 60 * 1000 * 365;

  if (interval === 'week') {
    changefilesWeek.list[0].to_date = new Date(now - (1 * oneDay)).toISOString().slice(0, 10);
    changefilesWeek.list[0].last_modified = new Date(now - (1 * oneDay))
      .toISOString().slice(0, 19);
    changefilesWeek.list[0].from_date = new Date(now - (8 * oneDay)).toISOString().slice(0, 10);

    changefilesWeek.list[1].to_date = new Date(now - (8 * oneDay)).toISOString().slice(0, 10);
    changefilesWeek.list[1].last_modified = new Date(now - (8 * oneDay))
      .toISOString().slice(0, 19);
    changefilesWeek.list[1].from_date = new Date(now - (15 * oneDay)).toISOString().slice(0, 10);

    changefilesWeek.list[2].to_date = new Date(now - (15 * oneDay)).toISOString().slice(0, 10);
    changefilesWeek.list[2].last_modified = new Date(now - (15 * oneDay))
      .toISOString().slice(0, 19);
    changefilesWeek.list[2].from_date = new Date(now - (22 * oneDay)).toISOString().slice(0, 10);

    changefilesWeek.list[3].to_date = new Date(now - oneYear - (1 * oneDay))
      .toISOString().slice(0, 10);
    changefilesWeek.list[3].last_modified = new Date(now - oneYear - (1 * oneDay))
      .toISOString().slice(0, 19);
    changefilesWeek.list[3].from_date = new Date(now - oneYear - (8 * oneDay))
      .toISOString().slice(0, 10);

    changefilesWeek.list[4].to_date = new Date(now - oneYear - (8 * oneDay))
      .toISOString().slice(0, 10);
    changefilesWeek.list[4].last_modified = new Date(now - oneYear - (8 * oneDay))
      .toISOString().slice(0, 19);
    changefilesWeek.list[4].from_date = new Date(now - oneYear - (15 * oneDay))
      .toISOString().slice(0, 10);
  }

  try {
    await fs.writeFile(changefilesWeekPath, JSON.stringify(changefilesWeek, null, 2), 'utf8');
  } catch (err) {
    console.error(`Cannot write ${JSON.stringify(changefilesWeek, null, 2)} in file "${changefilesWeekPath}"`);
    console.error(err);
  }

  if (interval === 'day') {
    changefilesDay.list[0].date = new Date(now - (0 * oneDay)).toISOString().slice(0, 10);
    changefilesDay.list[0].last_modified = new Date(now - (0 * oneDay))
      .toISOString().slice(0, 19);

    changefilesDay.list[1].date = new Date(now - (1 * oneDay)).toISOString().slice(0, 10);
    changefilesDay.list[1].last_modified = new Date(now - (1 * oneDay))
      .toISOString().slice(0, 19);

    changefilesDay.list[2].date = new Date(now - (2 * oneDay)).toISOString().slice(0, 10);
    changefilesDay.list[2].last_modified = new Date(now - (2 * oneDay))
      .toISOString().slice(0, 19);

    changefilesDay.list[3].date = new Date(now - oneYear - (0 * oneDay))
      .toISOString().slice(0, 10);
    changefilesDay.list[3].last_modified = new Date(now - oneYear - (0 * oneDay))
      .toISOString().slice(0, 19);

    changefilesDay.list[4].date = new Date(now - oneYear - (1 * oneDay))
      .toISOString().slice(0, 10);
    changefilesDay.list[4].last_modified = new Date(now - oneYear - (1 * oneDay))
      .toISOString().slice(0, 19);

    try {
      await fs.writeFile(changefilesDayPath, JSON.stringify(changefilesDay, null, 2), 'utf8');
    } catch (err) {
      console.error(`Cannot write ${JSON.stringify(changefilesDay, null, 2)} in file "${changefilesDayPath}"`);
      console.error(err);
    }
  }
}

module.exports = updateChangefilesExample;
