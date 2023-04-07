const { CronJob } = require('cron');

const logger = require('./logger');

class Cron {
  constructor(name, schedule, task) {
    this.name = name;
    this.schedule = schedule;
    this.task = task;
    this.active = false;
    this.process = new CronJob(schedule, this.task, null, false, 'Europe/Paris');
  }

  getConfig() {
    return {
      name: this.name,
      schedule: this.schedule,
      active: this.active,
    };
  }

  setTask(task) {
    this.process.stop();
    this.task = task;
    logger.info(`[cron: ${this.name}] config - task updated`);
    this.process = new CronJob(this.schedule, this.task, null, false, 'Europe/Paris');
    if (this.active) this.process.start();
  }

  setSchedule(schedule) {
    this.process.stop();
    this.schedule = schedule;
    logger.info(`[cron: ${this.name}] schedule is updated [${this.schedule}]`);
    this.process = new CronJob(this.schedule, async () => {
      await this.task();
    }, null, false, 'Europe/Paris');
    if (this.active) this.process.start();
  }

  start() {
    try {
      this.process.start();
      logger.info(`[cron: ${this.name}] cron process is started`);
      logger.info(`[cron: ${this.name}] schedule: [${this.schedule}]`);
    } catch (err) {
      logger.error(`[cron ${this.name}] Cannot start cron process`, err);
      return;
    }
    this.active = true;
  }

  stop() {
    try {
      this.process.stop();
      logger.info(`[cron: ${this.name}] cron process is stoped`);
    } catch (err) {
      logger.error(`[cron ${this.name}] Cannot stop cron process`, err);
      return;
    }
    this.active = false;
  }
}

module.exports = Cron;
