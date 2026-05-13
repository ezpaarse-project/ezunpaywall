const path = require('path');
const fsp = require('fs/promises');
const { paths } = require('config');
const { deleteIndex } = require('./elastic');

const { changefilesDir } = paths.data;
const { snapshotsDir } = paths.data;

async function deleteFilesInFolder(folderPath) {
  try {
    const files = await fsp.readdir(folderPath);

    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(folderPath, file);
        const stats = await fsp.stat(filePath);

        if (stats.isFile()) {
          await fsp.unlink(filePath);
        }
      }),
    );
  } catch (error) {
    console.error('[test]: Cannot delete file');
    console.error(error);
  }
}

async function reset() {
  await deleteFilesInFolder(changefilesDir);
  await deleteFilesInFolder(snapshotsDir);
  await deleteIndex('unpaywall-test');
  await deleteIndex('unpaywall-history-test');
}

module.exports = reset;
