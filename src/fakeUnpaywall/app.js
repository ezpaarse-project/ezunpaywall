const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');

const { name, version } = require('./package.json');

// start server
const app = express();
 
app.use('/snapshots', cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ name, version });
});

app.use('/snapshots', express.static(path.resolve(__dirname, 'snapshots')));

app.get('/snapshots/:file', async (req, res) => {
  const { file } = req.params;
  if (!file) {
    return res.status(400).json({ message: 'name of snapshot file expected' });
  }
  const fileExist = await fs.pathExists(path.resolve(__dirname, 'snapshots', file));
  if (!fileExist) {
    return res.status(404).json({ message: 'file doesn\'t exist' });
  }
  res.sendFile(path.resolve(__dirname, 'snapshots', file));
});

app.patch('/changefiles', async (req, res) => {
  const changefilesPathExemple = path.resolve(__dirname, 'snapshots', 'changefiles-example.json');

  // create local file if dosn't exist
  let changefilesPath = './snapshots/changefiles.json';
  try {
    await fs.ensureFile(changefilesPath)
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }

  
  changefilesPath = path.resolve(__dirname, 'snapshots', 'changefiles.json');

  const changefilesExemple = require('./snapshots/changefiles.json');

  const now = Date.now();
  const oneDay = (1 * 24 * 60 * 60 * 1000);

  changefilesExemple.list[0].to_date = new Date(now - (1 * oneDay)).toISOString().slice(0, 10);
  changefilesExemple.list[0].last_modified = new Date(now - (1 * oneDay)).toISOString().slice(0, 19);
  changefilesExemple.list[0].from_date = new Date(now - (8 * oneDay)).toISOString().slice(0, 10);

  changefilesExemple.list[1].to_date = new Date(now - (8 * oneDay)).toISOString().slice(0, 10);
  changefilesExemple.list[1].last_modified = new Date(now - (8 * oneDay)).toISOString().slice(0, 19);
  changefilesExemple.list[1].from_date = new Date(now - (15 * oneDay)).toISOString().slice(0, 10);

  changefilesExemple.list[2].to_date = new Date(now - (15 * oneDay)).toISOString().slice(0, 10);
  changefilesExemple.list[2].last_modified = new Date(now - (15 * oneDay)).toISOString().slice(0, 19);
  changefilesExemple.list[2].from_date = new Date(now - (22 * oneDay)).toISOString().slice(0, 10);
  try {
    await fs.writeFile(changefilesPath, JSON.stringify(changefilesExemple, null, 2), 'utf8');
  } catch (err) {
    console.error(`Cannot write ${JSON.stringify(changefilesExemple, null, 2)} in file "${changefilesPath}"`);
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' });
  }
  res.set('Location', changefilesPath).status(200).end();
});

/* Errors and unknown routes */
app.use((req, res) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));
app.use((error, req, res) => res.status(500).json({ message: error.message }));

app.listen(12000, () => {
  console.log('fakeUnpaywall service listening on 12000');
});

module.exports = app;
