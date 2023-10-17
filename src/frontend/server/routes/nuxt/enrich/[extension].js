/* eslint-disable no-undef */
import fs from 'node:fs/promises';
import path from 'node:path';

export default defineEventHandler(
  (event) => {
    const extension = getRouterParam(event, 'extension');
    return fs.readFile(path.resolve(`server/routes/nuxt/enrich/sources/example.${extension}`));
  },
);
