const { notifications } = require('config');

const logger = require('../logger');
const { sendMail, generateMail } = require('../mail');

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
    logger.error('[mail] Cannot send contact mail', err);
    return;
  }
  logger.info('[mail] contact mail was sent');
}

module.exports = sendMailContact;
