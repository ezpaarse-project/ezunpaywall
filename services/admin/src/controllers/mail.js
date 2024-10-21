const { contactMail } = require('../lib/mail');

/**
 * Controller to send contact mail.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
function sendMailContactController(req, res, next) {
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
}

module.exports = sendMailContactController;
