const { notifications } = require('config');

const logger = require('../lib/logger');
const { sendMail } = require('../lib/mail');

async function sendMailContact(email, subject, text) {
  try {
    await sendMail({
      from: email,
      to: notifications.receivers,
      subject: `ezunpaywall - ${subject}`,
      text,
    });
  } catch (err) {
    logger.error(`Cannot send mail ${err}`);
    logger.error(err);
    return;
  }
  logger.info('send contact mail');
}

module.exports = sendMailContact;
