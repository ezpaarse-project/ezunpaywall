const nodemailer = require('nodemailer');
const nunjucks = require('nunjucks');
const mjml2html = require('mjml');
const path = require('path');
const fs = require('fs');
const { smtp } = require('config');
const { format } = require('date-fns');
const { notifications } = require('config');

const logger = require('./logger/appLogger');

const transporter = nodemailer.createTransport(smtp);

const templatesDir = path.resolve(__dirname, '..', '..', 'templates');
const imagesDir = path.resolve(templatesDir, 'images');

nunjucks.configure(templatesDir);

const images = fs.readdirSync(imagesDir);

/**
 * Generate a mail.
 *
 * @param {string} templateName Name of template.
 * @param {Object} locals Local of mail.
 *
 * @returns {Object} general email with his html and his text
 */
function generateMail(templateName, locals = {}) {
  if (!templateName) { throw new Error('No template name provided'); }

  const text = nunjucks.render(`${templateName}.txt`, locals);
  const mjmlTemplate = nunjucks.render(`${templateName}.mjml`, locals);
  const { html, errors } = mjml2html(mjmlTemplate);

  return { html, text, errors };
}

/**
 * Send a mail.
 *
 * @param {Object} options Options of mail that content:
 * sender, receivers, subjet, attachments, content of mail.
 */
function sendMail(options) {
  const mailOptions = options || {};
  mailOptions.attachments = mailOptions.attachments || [];

  images.forEach((image) => {
    mailOptions.attachments.push({
      filename: image,
      path: path.resolve(imagesDir, image),
      cid: image,
    });
  });

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
}

/**
 * Ping SMTP service.
 *
 * @returns {Promise<boolean>} ping
 */
async function pingSMTP() {
  try {
    await transporter.verify();
  } catch (err) {
    logger.error(`[smtp]: Cannot ping ${smtp.host}:${smtp.port}`, err);
    return false;
  }
  return true;
}

/**
 * Send mail contact.
 *
 * @param {string} email Sender email.
 * @param {string} subject Mail subject.
 * @param {string} message Mail message.
 *
 * @returns {Promise<void>}
 */
async function contactMail(email, subject, message) {
  try {
    await sendMail({
      from: email,
      to: notifications.receivers,
      subject: `[ezUNPAYWALL][${notifications.machine}]: ${subject}`,
      ...generateMail('contact', {
        message,
      }),
    });
  } catch (err) {
    logger.error('[mail]: Cannot send contact mail', err);
    return;
  }
  logger.info('[mail]: contact mail was sent');
}

/**
 * Sends a mail that inform that an update has started start.
 *
 * @param {string} config Config of mail that content.
 *
 * @returns {Promise<void>}
 */
async function updateStartedMail(config) {
  try {
    await sendMail({
      from: notifications.sender,
      to: notifications.receivers,
      subject: `[ezUNPAYWALL][${notifications.machine}]: Mise à jour des données`,
      ...generateMail('updateStarted', {
        config,
        date: format(new Date(), 'dd-MM-yyyy'),
      }),
    });
  } catch (err) {
    logger.error('[mail]: Cannot send update started mail', err);
    return;
  }
  logger.info('[mail]: Update start mail was sent');
}

/**
 * Sends the update report email.
 *
 * @param {Object} state report of update process.
 *
 * @returns {Promise<void>}
 */
async function updateReportMail(state) {
  const status = state.error === true ? 'error' : 'success';

  let insertedDocs = 0;
  let updatedDocs = 0;
  state?.steps?.forEach((step) => {
    if (step.task === 'insert') {
      insertedDocs += step.insertedDocs || 0;
      updatedDocs += step.updatedDocs || 0;
    }
  });

  try {
    await sendMail({
      from: notifications.sender,
      to: notifications.receivers,
      subject: `[ezUNPAYWALL][${notifications.machine}]: Rapport de mise à jour - ${status}`,
      ...generateMail('updateReport', {
        state,
        status,
        insertedDocs,
        updatedDocs,
        date: format(new Date(), 'dd-MM-yyyy'),
      }),
    });
  } catch (err) {
    logger.error('[mail]: Cannot send update report mail', err);
    return;
  }
  logger.info('[mail]: Update report mail was sent');
}

/**
 * Sends an email indicating that no changefiles are available during a period.
 *
 * @param {string} startDate Start date in the format YYYY-MM-DD.
 * @param {string} endDate End date in the format YYYY-MM-DD.
 *
 * @returns {Promise<void>}
 */
async function noChangefileMail(startDate, endDate) {
  try {
    await sendMail({
      from: notifications.sender,
      to: notifications.receivers,
      subject: `[ezUNPAYWALL][${notifications.machine}]: Aucune mise à jour n'est disponible`,
      ...generateMail('noChangefile', {
        startDate: format(new Date(startDate), 'dd-MM-yyyy'),
        endDate: format(new Date(endDate), 'dd-MM-yyyy'),
      }),
    });
  } catch (err) {
    logger.error(`[mail]: Cannot send no changefile mail ${err}`);
    return;
  }
  logger.info('[mail]: Send no changefile mail');
}

module.exports = {
  generateMail,
  sendMail,
  pingSMTP,
  contactMail,
  updateStartedMail,
  updateReportMail,
  noChangefileMail,
};
