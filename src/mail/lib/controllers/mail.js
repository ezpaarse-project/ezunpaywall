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
  } = req.data;

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

  // TODO test state
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
  const { startDate, endDate } = req.data;

  noChangefileMail(startDate, endDate);

  return res.status(202).json();
}

module.exports = {
  sendMailContact,
  sendMailUpdateStarted,
  sendMailUpdateReport,
  sendMailNoChangefile,
};
