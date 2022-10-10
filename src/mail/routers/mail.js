const router = require('express').Router();
const checkAuth = require('../middlewares/auth');

const sendMailContact = require('../bin/contact');

const { sendMailStarted, sendMailReport } = require('../bin/update');

router.post('/contact', checkAuth, async (req, res, next) => {
  const {
    email, subject, message,
  } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is expected' });
  }

  const pattern = /.+@.+\..+/;

  if (!pattern.test(email)) {
    return res.status(400).json({ message: `Email [${email}] is invalid` });
  }

  if (!subject) {
    return res.status(400).json({ message: 'Subject is expected' });
  }

  if (!message) {
    return res.status(400).json({ message: 'Message is expected' });
  }

  try {
    sendMailContact(email, subject, message);
  } catch (err) {
    return next({ message: err, stackTrace: err });
  }
  return res.status(202).json({});
});

// auth
router.post('/update-start', checkAuth, async (req, res, next) => {
  const config = req.body;
  // TODO test config

  try {
    sendMailStarted(config);
  } catch (err) {
    return next({ message: err, stackTrace: err });
  }
  return res.status(202).json({});
});

router.post('/update-end', checkAuth, async (req, res, next) => {
  const state = req.body;
  // TODO test state

  try {
    sendMailReport(state);
  } catch (err) {
    return next({ message: err, stackTrace: err });
  }
  return res.status(202).json({});
});

module.exports = router;
