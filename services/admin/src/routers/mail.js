const router = require('express').Router();
const checkAdmin = require('../middlewares/admin');

const { contactMail } = require('../lib/mail');

/**
 * Route that send a contact mail.
 * Auth required.
 */
router.post('/contact', checkAdmin, async (req, res, next) => {
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

  contactMail(email, subject, message);

  return res.status(202).json();
});

module.exports = router;
