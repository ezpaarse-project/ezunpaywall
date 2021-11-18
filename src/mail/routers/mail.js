const router = require('express').Router();

const { sendMailContact } = require('../bin/mail');

router.post('/contact', async (req, res, next) => {
  const {
    email, subject, message,
  } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'email are expected' });
  }

  const pattern = /.+@.+\..+/;

  if (!pattern.test(email)) {
    return res.status(400).json({ message: `[${email}] is invalid email` });
  }

  if (!subject) {
    return res.status(400).json({ message: 'subject are expected' });
  }

  if (!message) {
    return res.status(400).json({ message: 'message are expected' });
  }

  try {
    sendMailContact(email, subject, message);
  } catch (err) {
    return next(err);
  }
  return res.status(202).json({});
});

// TODO
// router.post('/report', async (req, res, next) => {});

// router.post('/update-start', async (req, res, next) => {});

module.exports = router;
