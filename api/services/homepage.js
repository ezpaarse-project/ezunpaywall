const path = require('path');
const fs = require('fs-extra');

/**
 * @param dir path.resolve("nameFolder")
 * @return array(String)
 */
const getNamesOfFilesInDir = (dir, latest) => {
  const files = fs.readdirSync(dir);
  let filelist = [];
  files.forEach((file) => {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = fs.walkSync(path.join(dir, file), filelist);
    } else {
      filelist.push(file);
    }
  });
  if (latest) {
    return filelist.map((file) => file.split('.')[0])
      .sort((a, b) => new Date(b) - new Date(a))
      .map((date) => `${date}.json`)[0];
  }
  return filelist;
};

module.exports = {
  getNamesOfFilesInDir,
};
