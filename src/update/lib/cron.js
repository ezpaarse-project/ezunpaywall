const { CronJob } = require('cron');

const logger = require('./logger');

const Cron = class Cron {
  constructor(name, time, task) {
    this.name = name;
    this.time = time;
    this.task = task;
    this.status = false;
    this.process = new CronJob(time, async () => {
      await task();
    }, null, false, 'Europe/Paris');
  }

  getConfig() {
    return {
      name: this.name,
      time: this.time,
      status: this.status,
    };
  }

  setTask(task) {
    this.task = task;
    logger.info(`[cron ${this.name}] config - task updated`);
  }

  setTime(time) {
    this.time = time;
    logger.info(`[cron ${this.name}] config - time: [${this.time}]`);
  }

  start() {
    try {
      this.process.start();
      logger.info(`[cron ${this.name}] - started`);
      logger.info(`[cron ${this.name}] config - time: [${this.time}]`);
    } catch (err) {
      logger.error(`[cron ${this.name}] - error in start`);
      logger.error(err);
      return;
    }
    this.status = true;
  }

  stop() {
    try {
      this.process.stop();
      logger.info(`[cron ${this.name}] - stoped`);
    } catch (err) {
      logger.error(`[cron ${this.name}] - error in stop`);
      logger.error(err);
      return;
    }
    this.status = false;
  }
};

module.exports = Cron;
