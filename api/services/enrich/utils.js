const {
  createState,
  endState,
} = require('./state');

const {
  processEnrichJSON,
} = require('./json');

const {
  processEnrichCSV,
} = require('./csv');

const enrichJSON = async (readStream, args) => {
  const statename = await createState();
  const filename = await processEnrichJSON(readStream, args, statename);
  await endState(statename);
  return filename;
};

const enrichCSV = async (readStream, args, separator) => {
  const statename = await createState();
  const filename = await processEnrichCSV(readStream, args, separator, statename);
  await endState(statename);
  return filename;
};

module.exports = {
  enrichJSON,
  enrichCSV,
};
