/**
 *
 * @param {Object} result State or report
 * @param {Object} config Config of test
 * @param {boolean} config.error is on error
 * @param {string} config.index Index
 * @param {string} config.added Total added
 * @param {string} config.updated Total update
 * @param {Array} config.steps Array of steps
 * @param {string} step.task Task: getChangefile, insert, download
 * @param {string} step.filename: Filename
 * @param {string} step.linesRead LineRead of step
 * @param {string} step.addedDocs Added Docs
 * @param {string} step.updatedDocs Update Docs
 * @param {string} step.failedDocs Failed Dow
 */
function testState(result, config) {
  expect(result.done).toBe(true);
  expect(result.createdAt).toBeDefined();
  expect(result.endAt).toBeDefined();
  expect(result.steps).toBeInstanceOf(Array);
  expect(result.error).toBe(config.error);
  expect(result.took).toBeDefined();

  const { indices } = result;

  if (config?.name?.includes('history')) {
    for (let i = 0; i < indices.length; i += 1) {
      const indexFromResult = indices[i];
      const indexFromConfig = config.indices[i];
      expect(indexFromResult).toEqual(indexFromConfig);
    }
  }
  // } else {
  //   console.log(indices);
  //   expect(indices[0].index).toBe(config.index);
  //   expect(indices[0].added).toBe(config.added);
  //   expect(indices[0].updated).toBe(config.updated);
  // }

  const nbChangefiles = config.steps.filter((step) => step.task === 'getChangefile').length;
  const nbDownloads = config.steps.filter((step) => step.task === 'download').length;
  const nbInserts = config.steps.filter((step) => step.task === 'insert').length;

  const nbChangefilesResult = result.steps.filter((step) => step.task === 'getChangefile').length;
  const nbDownloadsResult = result.steps.filter((step) => step.task === 'download').length;
  const nbInsertsResult = result.steps.filter((step) => step.task === 'insert').length;

  expect(nbChangefilesResult).toBe(nbChangefiles);
  expect(nbDownloadsResult).toBe(nbDownloads);
  expect(nbInsertsResult).toBe(nbInserts);

  expect(result.steps.length).toBe(config.steps.length);

  for (let i = 0; i < config.steps.length; i += 1) {
    const stepFromResult = result.steps[i];
    const stepFromConfig = config.steps[i];

    if (stepFromConfig.task === 'getChangefile') {
      expect(stepFromResult.took).toBeDefined();
      expect(stepFromResult.status).toBe(stepFromConfig.status);
    }
    if (stepFromConfig.task === 'download') {
      expect(stepFromResult.file).toBe(stepFromConfig.file);
      expect(stepFromResult.percent).toBe(stepFromConfig.percent);
      expect(stepFromResult.took).toBeDefined();
      expect(stepFromResult.status).toBe(stepFromConfig.status);
    }
    if (stepFromConfig.task === 'insert') {
      expect(stepFromResult.file).toBe(stepFromConfig.file);
      // TODO 2025-02-19 uniformize state between history and classic

      // expect(stepFromResult.linesRead).toBe(stepFromConfig.linesRead);
      // expect(stepFromResult.addedDocs).toBe(stepFromConfig.addedDocs);
      // expect(stepFromResult.updatedDocs).toBe(stepFromConfig.updatedDocs);
      // expect(stepFromResult.failedDocs).toBe(stepFromConfig.failedDocs);
      expect(stepFromResult.percent).toBe(stepFromConfig.percent);
      expect(stepFromResult.took).toBeDefined();
      expect(stepFromResult.status).toBe(stepFromConfig.status);
    }
  }
}

module.exports = testState;
