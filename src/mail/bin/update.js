const { format } = require('date-fns');

const { notifications } = require('config');

const logger = require('../lib/logger');

const { sendMail, generateMail } = require('../lib/mail');

async function sendMailUpdateStarted(config) {
  try {
    await sendMail({
      from: notifications.sender,
      to: notifications.receivers,
      subject: `ezunpaywall ${notifications.machine} - Mise à jour des données`,
      ...generateMail('updateStarted', {
        config,
        date: format(new Date(), 'dd-MM-yyyy'),
      }),
    });
  } catch (err) {
    logger.error(`Cannot send update started mail ${err}`);
    logger.error(err);
    return;
  }
  logger.info('send update started mail');
}

async function sendMailUpdateReport(state) {
  let status = state.error;
  if (status) {
    status = 'error';
  } else {
    status = 'success';
  }

  let insertedDocs = 0;
  let updatedDocs = 0;
  state.steps.forEach((step) => {
    if (step.task === 'insert') {
      insertedDocs += step.insertedDocs;
      updatedDocs += step.updatedDocs;
    }
  });

  try {
    await sendMail({
      from: notifications.sender,
      to: notifications.receivers,
      subject: `ezunpaywall ${notifications.machine} - Rapport de mise à jour - ${status}`,
      ...generateMail('updateReport', {
        state,
        status,
        insertedDocs,
        updatedDocs,
        date: format(new Date(), 'dd-MM-yyyy'),
      }),
    });
  } catch (err) {
    logger.error(`Cannot send update report mail ${err}`);
    logger.error(err);
    return;
  }
  logger.info('send update report mail');
}

module.exports = {
  sendMailUpdateStarted,
  sendMailUpdateReport,
};
