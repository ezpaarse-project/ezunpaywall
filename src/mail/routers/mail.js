const router = require('express').Router();
const boom = require('@hapi/boom');

const checkAuth = require('../middlewares/auth');

const sendMailContact = require('../bin/contact');

const { sendMailStarted, sendMailReport } = require('../bin/update');

router.post('/contact', checkAuth, async (req, res, next) => {
  const {
    email, subject, message,
  } = req.body;

  if (!email) {
    return res.status(400).json(boom.badRequest('email are expected'));
  }

  const pattern = /.+@.+\..+/;

  if (!pattern.test(email)) {
    return res.status(400).json(boom.badRequest(`[${email}] is invalid email`));
  }

  if (!subject) {
    return res.status(400).json(boom.badRequest('subject are expected'));
  }

  if (!message) {
    return res.status(400).json(boom.badRequest('message are expected'));
  }

  try {
    await sendMailContact(email, subject, message);
  } catch (err) {
    return next(boom.boomify(err));
  }
  return res.status(202).json();
});

// auth
router.post('/update-start', checkAuth, async (req, res, next) => {
  const config = req.body;
  // TODO test config

  try {
    await sendMailStarted(config);
  } catch (err) {
    return next(boom.boomify(err));
  }
  return res.status(202).json();
});

router.post('/update-end', checkAuth, async (req, res, next) => {
  const state = req.body;
  // TODO test state

  try {
    await sendMailReport(state);
  } catch (err) {
    return next(boom.boomify(err));
  }
  return res.status(202).json();
});

module.exports = router;
