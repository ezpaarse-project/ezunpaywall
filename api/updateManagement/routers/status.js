const router = require('express').Router();

const { getTask } = require('../services/status');

/**
 * @api {get} /task get the status of processus
 * @apiName getTask
 * @apiGroup Task
 *
 * @apiSuccess {String} task
 *
 */
router.get('/task', async (req, res) => {
  const task = getTask();
  if (task.currentTask === '') {
    return res.status(200).json({
      inProgress: false,
      task: {},
    });
  }
  return res.status(200).json({
    inProgress: true,
    task,
  });
});

module.exports = router;
