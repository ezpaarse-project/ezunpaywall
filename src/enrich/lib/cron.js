const { CronJob } = require('cron');

const logger = require('./logger');

/**
 * Class cron
 */
class Cron {
  /**
   * @constructor
   *
   * @param {String} name - Name of cron
   * @param {String} schedule - Schedule of cron
   * @param {Function} task - Function that will be executed by the cron
   * @param {Boolean} active - Indicates whether it is active or not
   */
  constructor(name, schedule, task, active) {
    this.name = name;
    this.schedule = schedule;
    this.task = task;
    this.active = active;
    this.process = new CronJob(schedule, this.task, null, false, 'Europe/Paris');
    if (active) {
      logger.info(`[cron ${this.name}] started`);
      logger.info(`[cron ${this.name}] config: schedule [${this.schedule}]`);
    }
  }

  /**
   * Getter of config of cron.
   *
   * @returns {Object} config of cron.
   */
  getConfig() {
    return {
      name: this.name,
      schedule: this.schedule,
      active: this.active,
    };
  }

  /**
   * Set new task for cron.
   *
   * @param {Function} task
   */
  setTask(task) {
    this.process.stop();
    this.task = task;
    logger.info(`[cron ${this.name}] config: task updated`);
    this.process = new CronJob(this.schedule, this.task, null, false, 'Europe/Paris');
    if (this.active) this.process.start();
  }

  /**
   * Set new schedule for cron.
   *
   * @param {String} schedule
   */
  setSchedule(schedule) {
    this.process.stop();
    this.schedule = schedule;
    logger.info(`[cron ${this.name}] config - schedule is updated [${this.schedule}]`);
    this.process = new CronJob(this.schedule, async () => {
      await this.task();
    }, null, false, 'Europe/Paris');
    if (this.active) this.process.start();
  }

  /**
   * Make active to true.
   */
  start() {
    try {
      this.process.start();
      logger.info(`[cron ${this.name}] started`);
      logger.info(`[cron ${this.name}] config : schedule: [${this.schedule}]`);
    } catch (err) {
      logger.error(`[cron ${this.name}] error in start`);
      logger.error(err);
      return;
    }
    this.active = true;
  }

  /**
   * Make active to false.
   */
  stop() {
    try {
      this.process.stop();
      logger.info(`[cron ${this.name}] stoped`);
    } catch (err) {
      logger.error(`[cron ${this.name}] error in stop`);
      logger.error(err);
      return;
    }
    this.active = false;
  }
}

module.exports = Cron;
