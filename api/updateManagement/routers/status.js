const router = require('express').Router();

const { getTasks } = require('../services/status');

/**
 * @api {get} /tasks get the status of processus
 * @apiName getTasks
 * @apiGroup Tasks
 *
 * @apiSuccess {String} task
 *
 */
router.get('/tasks', async (req, res) => {
  const tasks = getTasks();
  console.log(tasks);
  if (tasks.currentTask === '') {
    return res.status(200).json({
      inProgress: false,
      tasks: {},
    });
  }
  return res.status(200).json({
    inProgress: true,
    tasks,
  });
});

module.exports = router;
