const { notifications } = require('config');

const logger = require('../lib/logger');
const { sendMail, generateMail } = require('../lib/mail');

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
