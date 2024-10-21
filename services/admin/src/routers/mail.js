const router = require('express').Router();
const checkAdmin = require('../middlewares/admin');

const sendMailContactController = require('../controllers/mail');

/**
 * Route that send a contact mail.
 * Auth required.
 */
router.post('/contact', checkAdmin, sendMailContactController);

module.exports = router;
