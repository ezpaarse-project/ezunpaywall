const { notifications } = require('config');

const logger = require('../logger');
const { sendMail, generateMail } = require('../mail');

/**
 * Send mail contact.
 *
 * @param {string} email - Sender email.
 * @param {string} subject - Mail subject.
 * @param {string} message - Mail message.
 */
async function sendMailContact(email, subject, message) {
  try {
    await sendMail({
      from: email,
      to: notifications.receivers,
      subject: `ezunpaywall ${notifications.machine} - ${subject}`,
      ...generateMail('contact', {
        message,
      }),
    });
  } catch (err) {
    logger.error(`Cannot send contact mail ${err}`);
    logger.error(err);
    return;
  }
  logger.info('send update start mail');
}

module.exports = sendMailContact;
