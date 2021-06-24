const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');

// start server
const server = express();

const RouterSnapshots = require('./routers/snapshots');
 
server.use('/snapshots', cors());
server.use(express.json());

server.get('/', (req, res) => {
  res.status(200).json({ message: 'fakeUnpaywall Up' });
});

server.use(RouterSnapshots);

server.get('/snapshots/:file', async (req, res) => {
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

server.get('/ping', (req, res) => {
  res.status(200).json({ data: 'pong' });
});

/* Errors and unknown routes */
server.use((req, res) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));
server.use((error, req, res) => res.status(500).json({ message: error.message }));

server.listen('12000', () => {
  console.log('fakeUnpaywall listening on 12000');
});

module.exports = server;
