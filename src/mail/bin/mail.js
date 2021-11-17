const nodemailer = require('nodemailer');
const { smtp, notifications } = require('config');
const logger = require('../lib/logger');

const transporter = nodemailer.createTransport(smtp);

const sendMail = (options) => {
  const mailOptions = options || {};
  mailOptions.attachments = mailOptions.attachments || [];

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
};

const sendMailContact = async (email, subject, text) => {
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
  logger.info('send update end email');
};

module.exports = {
  sendMailContact,
};
