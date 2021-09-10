const nodemailer = require('nodemailer');
const nunjucks = require('nunjucks');
const mjml2html = require('mjml');
const path = require('path');
const fs = require('fs');

const { smtp, notifications } = require('config');

const logger = require('./logger');

const templatesDir = path.resolve(__dirname, '..', 'templates');
const imagesDir = path.resolve(templatesDir, 'images');

const transporter = nodemailer.createTransport(smtp);

nunjucks.configure(templatesDir);

const images = fs.readdirSync(imagesDir);

const sendMail = (options) => {
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
};

const generateMail = (templateName, locals = {}) => {
  if (!templateName) { throw new Error('No template name provided'); }

  const text = nunjucks.render(`${templateName}.txt`, locals);
  const mjmlTemplate = nunjucks.render(`${templateName}.mjml`, locals);
  const { html, errors } = mjml2html(mjmlTemplate);

  return { html, text, errors };
};

const send = async (state) => {
  const status = state.error;
  try {
    await sendMail({
      from: notifications.sender,
      to: notifications.receivers,
      subject: `ezunpaywall - Rapport de mise à jour - ${status}`,
      ...generateMail('report', {
        state,
        status,
        date: new Date().toISOString().slice(0, 10),
      }),
    });
  } catch (err) {
    logger.error(`Cannot send mail ${err}`);
    logger.error(err);
  }
};

module.exports = {
  send,
};
