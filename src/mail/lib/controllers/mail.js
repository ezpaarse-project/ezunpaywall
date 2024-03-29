const {
  contactMail,
  updateStartedMail,
  updateReportMail,
  noChangefileMail,
} = require('../mail');

/**
 * Controller to send contact mail.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
function sendMailContact(req, res, next) {
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

/**
 * Controller to send a mail to inform that the update has started.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
function sendMailUpdateStarted(req, res, next) {
  const config = req.body;

  updateStartedMail(config);

  return res.status(202).json();
}

/**
 * Controller to send a mail with the report of update process.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
function sendMailUpdateReport(req, res, next) {
  const state = req.body;

  updateReportMail(state);

  return res.status(202).json();
}

/**
 * Controller to send a mail to inform that no changefiles are available.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
function sendMailNoChangefile(req, res, next) {
  const { startDate, endDate } = req.body;
  // TODO test startDate, endDate

  noChangefileMail(startDate, endDate);

  return res.status(202).json();
}

module.exports = {
  sendMailContact,
  sendMailUpdateStarted,
  sendMailUpdateReport,
  sendMailNoChangefile,
};
