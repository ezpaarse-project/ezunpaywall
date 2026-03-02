
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { pipeline } from 'stream/promises';

import { 
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

import appLogger from '~/lib/logger/appLogger';

import { config } from '~/lib/config';
const { paths } = config;

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: '',
    secretAccessKey: '',
  },
  signer: { sign: async req => req },
  endpoint: 'https://s3.amazonaws.com',
});

export async function getOpenalexWorksList() {
  const bucketName = 'openalex';
  const prefix = 'data/works/';

  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
  });

  try {
    const response = await s3Client.send(command);

    if (!response.Contents) {
      console.log("No manifests found.");
      return [];
    }

    const manifests = response.Contents;

    return manifests;
  } catch (error) {
    console.error("Error fetching manifests:", error);
    throw error;
  }
}

export async function downloadFileFromOpenAlex(objectName: string, outputPath: string) {
  const command = new GetObjectCommand({
    Bucket: 'openalex',
    Key: objectName,
  });
  try {
    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error("File not found");
    }

    const writeStream = await fs.createWriteStream(outputPath);

    await pipeline(response.Body as NodeJS.ReadableStream, writeStream);

    console.log(`Successfully downloaded ${objectName} to ${outputPath}`);
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}

export async function downloadOpenalexWorks() {
  const objectList = await getOpenalexWorksList();
  const manifests = objectList.filter(obj => obj?.Key?.endsWith('.gz'));

  console.log(manifests);

  appLogger.info(`Found ${manifests.length} work files.`);

  for (let i = 0; i < manifests.length; i += 1) {
    const manifest = manifests[i];

    // Example : data/works/updated_date=2016-09-30/part_0000.gz -> 2016-09-30-part_0000.gz
    const filename = manifest.Key.split('=')[1].replace('/', '-');
    const outputPath = path.resolve(paths.data.openalexDir, filename);

    let alreadyDownloaded;

    try {
      alreadyDownloaded = await fsp.stat(outputPath);
      alreadyDownloaded = alreadyDownloaded.isFile()
    } catch (err) {
      if (err.code === 'ENOENT') return false;
      appLogger.error(`Cannot stat ${outputPath} ${err}`);
      throw err;
    }

    if (alreadyDownloaded) {
      appLogger.info(`${filename} arleady installed ${i + 1}/${manifests.length}`);
    } else {
      try {
        appLogger.info(`Download ${manifest.Key} ${i + 1}/${manifests.length}`);
        await downloadFileFromOpenAlex(manifest.Key, outputPath);
      } catch (err) {
        appLogger.error(`Cannot download file from open alex ${err}`);
        throw err;
      }
      appLogger.info(`Downloaded ${outputPath}/${manifest.Key}`);
    }
  }

  appLogger.info(`Found ${manifests.length} manifests.`);
}