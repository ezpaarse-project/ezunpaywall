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

function generateMail(templateName, locals = {}) {
  if (!templateName) { throw new Error('No template name provided'); }

  const text = nunjucks.render(`${templateName}.txt`, locals);
  const mjmlTemplate = nunjucks.render(`${templateName}.mjml`, locals);
  const { html, errors } = mjml2html(mjmlTemplate);

  return { html, text, errors };
}

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

async function pingSMTP() {
  try {
    await transporter.verify();
  } catch (err) {
    logger.error(`[smtp] Cannot ping ${smtp.host}:${smtp.port}`, err);
    return err?.message;
  }
  return true;
}

module.exports = {
  generateMail,
  sendMail,
  pingSMTP,
};
