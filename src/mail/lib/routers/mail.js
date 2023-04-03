const router = require('express').Router();
const checkAuth = require('../middlewares/auth');

const sendMailContact = require('../controllers/contact');

const { sendMailUpdateStarted, sendMailUpdateReport } = require('../controllers/update');
/**
 * Send a contact mail.
 * Auth required.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @routeBody {string} email - Email of sender.
 * @routeBody {string} subject - Subject of mail.
 * @routeBody {string} message -  Message of mail.
 *
 * @return {import('express').Response} HTTP response.
 */
router.post('/contact', checkAuth, async (req, res) => {
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

  sendMailContact(email, subject, message);

  return res.status(202).json();
});

/**
 * Route that sends a mail that inform that an update has started start.
 * Auth required.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @routeBody {string} config - Config.
 *
 * @return {import('express').Response} HTTP response.
 */
router.post('/update-start', checkAuth, async (req, res) => {
  const config = req.body;

  sendMailUpdateStarted(config);

  return res.status(202).json();
});

/**
 * Route that send update mail report.
 * Auth required.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @return {import('express').Response} HTTP response.
 */
router.post('/update-end', checkAuth, async (req, res) => {
  const state = req.body;

  sendMailUpdateReport(state);

  return res.status(202).json();
});

module.exports = router;
