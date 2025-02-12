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
  expect(indices[0].index).toBe(config.index);
  expect(indices[0].added).toBe(config.added);
  expect(indices[0].updated).toBe(config.updated);

  for (let i = 0; i < result.steps.length; i += 1) {
    const stepFromResult = result.steps[i];
    const stepFromData = config.steps[0];
    expect(stepFromResult.task).toBe(stepFromData.task);
    expect(stepFromResult.index).toBe(config.index);
    expect(stepFromResult.file).toBe(stepFromData.filename);
    expect(stepFromResult.linesRead).toBe(stepFromData.linesRead);
    expect(stepFromResult.addedDocs).toBe(stepFromData.addedDocs);
    expect(stepFromResult.updatedDocs).toBe(stepFromData.updatedDocs);
    expect(stepFromResult.failedDocs).toBe(stepFromData.failedDocs);
    expect(stepFromResult.percent).toBe(stepFromData.percent);
    expect(stepFromResult.took).toBeDefined();
    expect(stepFromResult.status).toBe(stepFromData.status);
  }
}

module.exports = testState;
