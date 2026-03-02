import fsp from 'fs/promises';

import { config } from '~/lib/config';

const { paths } = config;

export async function getFilenamesBetweenDate(startDate: string, endDate: string) {
  const files = await fsp.readdir(paths.data.openalexDir);
  
  return files.filter(file => {
    const match = file.match(/^(\d{4}-\d{2}-\d{2})/);
    if (!match) return false;

    const fileDate = match[1];

    return fileDate >= startDate && fileDate <= endDate;
  });
}


