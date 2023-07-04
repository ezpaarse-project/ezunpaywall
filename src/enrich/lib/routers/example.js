const router = require('express').Router();
const path = require('path');

const exampleDir = path.resolve(__dirname, '..', '..', 'example');

router.get('/example/csv', async (req, res) => res.sendFile(path.resolve(exampleDir, 'example.csv')));
router.get('/example/jsonl', async (req, res) => res.sendFile(path.resolve(exampleDir, 'example.jsonl')));

module.exports = router;
