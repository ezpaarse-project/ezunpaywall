const { CronJob } = require('cron');
const { timezone } = require('config');

const logger = require('../lib/logger/appLogger');

class Cron {
  /**
   * @constructor
   *
   * @param {string} name Name of cron.
   * @param {string} schedule Schedule of cron.
   * @param {Promise} task Promise that will be executed by the cron
   * @param {boolean} active Indicates whether it is active or not.
   */
  constructor(name, schedule, task, active) {
    this.name = name;
    this.schedule = schedule;
    this.task = task;
    this.active = active;
    this.process = new CronJob(schedule, this.task, null, false, timezone);
  }

  /**
   * Getter of config of cron.
   *
   * @returns {Object} config of cron.
   */
  get config() {
    return {
      name: this.name,
      schedule: this.schedule,
      active: this.active,
    };
  }

  /**
   * Set new task for cron.
   *
   * @param {function} task Function that will be executed by the cron.
   */
  setTask(task) {
    this.process.stop();
    this.task = task;
    logger.info(`[cron][${this.name}]: Task updated`);
    this.process = new CronJob(this.schedule, this.task, null, false, timezone);
    if (this.active) this.process.start();
  }

  /**
   * Set new schedule for cron.
   *
   * @param {string} schedule Schedule of cron.
   */
  setSchedule(schedule) {
    this.process.stop();
    this.schedule = schedule;
    logger.info(`[cron][${this.name}]: Schedule is updated [${this.schedule}]`);
    this.process = new CronJob(this.schedule, async () => {
      await this.task();
    }, null, false, timezone);
    if (this.active) this.process.start();
  }

  /**
   * Make active to true.
   */
  start() {
    try {
      this.process.start();
      logger.info(`[cron][${this.name}]: Is active`);
      logger.info(`[cron][${this.name}]: Schedule: [${this.schedule}]`);
    } catch (err) {
      logger.error(`[cron][${this.name}]: Cannot start cron process`, err);
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
      logger.info(`[cron][${this.name}]: Is inactive`);
    } catch (err) {
      logger.error(`[cron][${this.name}]: Cannot stop cron process`, err);
      return;
    }
    this.active = false;
  }
}

module.exports = Cron;
