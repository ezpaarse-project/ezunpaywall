const fs = require('fs');
const readline = require('readline');

async function getLastLogLine(filePath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: stream });
    let lastLine = '';

    rl.on('line', (line) => {
      lastLine = line;
    });

    rl.on('close', () => {
      resolve(lastLine);
    });

    rl.on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = getLastLogLine;
