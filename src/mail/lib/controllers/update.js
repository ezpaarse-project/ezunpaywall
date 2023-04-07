const { format } = require('date-fns');

const { notifications } = require('config');

const logger = require('../logger');

const { sendMail, generateMail } = require('../mail');

/**
 * Sends a mail that inform that an update has started start.
 *
 * @param {string} config - Config of mail that content.
 */
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
    logger.error('[mail] Cannot send update started mail', err);
    return;
  }
  logger.info('[mail] Update start mail was sent');
}

/**
 * Sends the update report email.
 *
 * @param {string} state - report of update process.
 */
async function sendMailUpdateReport(state) {
  const status = state.error === true ? 'error' : 'success';

  let insertedDocs = 0;
  let updatedDocs = 0;
  state?.steps?.forEach((step) => {
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
    logger.error('[mail] Cannot send update report mail', err);
    return;
  }
  logger.info('[mail] Update report mail was sent');
}

async function sendMailNoChangefile(startDate, endDate) {
  try {
    await sendMail({
      from: notifications.sender,
      to: notifications.receivers,
      subject: `ezunpaywall ${notifications.machine} - Aucune mise à jour n'est disponible`,
      ...generateMail('noChangefile', {
        startDate: format(new Date(startDate), 'dd-MM-yyyy'),
        endDate: format(new Date(endDate), 'dd-MM-yyyy'),
      }),
    });
  } catch (err) {
    logger.error(`Cannot send no changefile mail ${err}`);
    logger.error(err);
    return;
  }
  logger.info('send no changefile mail');
}

module.exports = {
  sendMailUpdateStarted,
  sendMailUpdateReport,
  sendMailNoChangefile,
};
