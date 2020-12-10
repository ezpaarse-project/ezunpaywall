const express = require('express');
const path = require('path');
const router = require('express').Router();

router.use('/snapshots', express.static(path.resolve(__dirname, 'snapshots')));

module.exports = router;
