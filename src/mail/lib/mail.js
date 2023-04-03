const nodemailer = require('nodemailer');
const nunjucks = require('nunjucks');
const mjml2html = require('mjml');
const path = require('path');
const fs = require('fs');
const { smtp } = require('config');
const logger = require('./logger');

const transporter = nodemailer.createTransport(smtp);

const templatesDir = path.resolve(__dirname, '..', 'templates');
const imagesDir = path.resolve(templatesDir, 'images');

nunjucks.configure(templatesDir);

const images = fs.readdirSync(imagesDir);

/**
 * Generate a mail.
 *
 * @param {string} templateName - Name of template.
 * @param {Object} locals - Local of mail.
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
 * @param {Object} options - Options of mail that content:
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
 * @returns {boolean} ping
 */
async function pingSMTP() {
  try {
    await transporter.verify();
  } catch (err) {
    logger.error(`Cannot ping ${smtp.host}:${smtp.port} - ${err}`);
    return false;
  }
  return true;
}

module.exports = {
  generateMail,
  sendMail,
  pingSMTP,
};
