const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');
const redis = require('redis');

const client = redis.createClient();

const logger = require('./lib/logger');
const { name, version } = require('./package.json');

const privateKeyPath = path.resolve(__dirname, 'key', 'private.key');
const privateKey = fs.readFile(privateKeyPath);

const outDir = path.resolve(__dirname, 'out');

fs.ensureDir(path.resolve(outDir));
fs.ensureDir(path.resolve(outDir, 'logs'));

const app = express();

app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'X-API-KEY'],
  method: ['GET', 'POST'],
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ name, version });
});

const createAuth = async () => {
  const currentDate = (new Date()).valueOf().toString();
  const random = Math.random().toString();
  const hash = crypto.createHash('sha256').update(`${currentDate}${random}`).digest('hex');
  const config = {
    id: hash,
    name: 'Click&Read',
    access: ['graphql', 'update', 'enrich'],
    attributes: '{ doi, is_oa, best_oa_location { url }} ' || 'all',
    allowed: true,
  };
  return config;
};

createAuth().then((res) => {
  console.log(res);
});

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(6000, () => {
  logger.info('ezunpaywall auth service listening on 6000');
});
