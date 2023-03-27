const router = require('express').Router();
const checkAuth = require('../middlewares/auth');

const sendMailContact = require('../controllers/contact');

const { sendMailUpdateStarted, sendMailUpdateReport } = require('../controllers/update');
/**
 * Send a contact mail
 * Auth required.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 *
 * @routeBody {String} email - Email of sender.
 * @routeBody {String} subject - Subject of mail.
 * @routeBody {String} message -  Message of mail.
 *
 * @returns {Object} HTTP response.
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
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 *
 * @routeBody {String} config - Config.
 *
 * @returns {Object} HTTP response.
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
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 *
 * @returns {Object} HTTP response.
 */
router.post('/update-end', checkAuth, async (req, res) => {
  const state = req.body;

  sendMailUpdateReport(state);

  return res.status(202).json();
});

module.exports = router;
