const { CronJob } = require('cron');
const { timezone } = require('config');

const appLogger = require('../lib/logger/appLogger');

class Cron {
  /**
   * @constructor
   *
   * @param {string} name Name of cron.
   * @param {string} schedule Schedule of cron.
   * @param {function} task Function that will be executed by the cron.
   * @param {boolean} active Indicates whether it is active or not.
   */
  constructor(name, schedule, task, active) {
    this.name = name;
    this.schedule = schedule;
    this.task = task;
    this.active = active;
    this.process = new CronJob(schedule, this.task, null, false, timezone);
  }

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
    appLogger.info(`[cron][${this.name}]: task updated`);
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
    appLogger.info(`[cron][${this.name}]: schedule is updated [${this.schedule}]`);
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
      appLogger.info(`[cron][${this.name}]: started`);
      appLogger.info(`[cron][${this.name}]: schedule [${this.schedule}]`);
    } catch (err) {
      appLogger.error(`[cron][${this.name}]: Cannot start`, err);
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
      appLogger.info(`[cron][${this.name}]: stopped`);
    } catch (err) {
      appLogger.error(`[cron][${this.name}]: Cannot stop`, err);
      return;
    }
    this.active = false;
  }
}

module.exports = Cron;
