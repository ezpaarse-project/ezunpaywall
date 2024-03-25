const router = require('express').Router();
const checkAuth = require('../middlewares/auth');

const {
  sendMailContact,
  sendMailUpdateStarted,
  sendMailUpdateReport,
  sendMailNoChangefile,
} = require('../controllers/mail');

const {
  validateNoChangefile,
  validateMailContact,
} = require('../middlewares/mail');

/**
 * Route that send a contact mail.
 * Auth required.
 */
router.post('/contact', checkAuth, validateMailContact, sendMailContact);

/**
 * Route that sends a mail that inform that an update has started start.
 * Auth required.
 */
router.post('/update-start', checkAuth, sendMailUpdateStarted);

/**
 * Route that send update mail report.
 * Auth required.
 */
router.post('/update-end', checkAuth, sendMailUpdateReport);

/**
 * Route that informe that no changefiles are available.
 * Auth required.
 */
router.post('/nochangefile', checkAuth, validateNoChangefile, sendMailNoChangefile);

module.exports = router;
