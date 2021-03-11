const router = require('express').Router();

const { getTask } = require('../services/status');

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
