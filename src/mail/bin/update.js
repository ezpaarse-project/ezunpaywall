const { format } = require('date-fns');

const { notifications } = require('config');

const logger = require('../lib/logger');

const { sendMail, generateMail } = require('../lib/mail');

const sendMailStarted = async (config) => {
  try {
    await sendMail({
      from: notifications.sender,
      to: notifications.receivers,
      subject: `ezunpaywall ${notifications.machine} - Mise à jour des données`,
      ...generateMail('started', {
        config,
        date: format(new Date(), 'dd-MM-yyyy'),
      }),
    });
  } catch (err) {
    logger.error(`Cannot send mail ${err}`);
    logger.error(err);
    return;
  }
  logger.info('send update start email');
};

const sendMailReport = async (state) => {
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
      ...generateMail('report', {
        state,
        status,
        insertedDocs,
        updatedDocs,
        date: format(new Date(), 'dd-MM-yyyy'),
      }),
    });
  } catch (err) {
    logger.error(`Cannot send mail ${err}`);
    logger.error(err);
    return;
  }
  logger.info('send update end email');
};

module.exports = {
  sendMailStarted,
  sendMailReport,
};
