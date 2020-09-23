const path = require('path');
const fs = require('fs-extra');

/**
 * @param dir path to folder
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
    return filelist.map((file) => {
      const match = /^(\w*)-([0-9-T:]+)\.json$/i.exec(file);
      if (match) return { type: match[1], date: match[2] };
      return file;
    })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((file) => `${file.type}-${file.date}.json`)[0];
  }
  return filelist;
};

module.exports = {
  getNamesOfFilesInDir,
};
