const router = require('express').Router();
const checkAuth = require('../middlewares/auth');

const sendMailContact = require('../controllers/mail');

/**
 * Route that send a contact mail.
 * Auth required.
 */
router.post('/contact', checkAuth, sendMailContact);

module.exports = router;
