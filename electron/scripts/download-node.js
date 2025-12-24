#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const NODE_VERSION = '22.20.0';
const RESOURCES_DIR = path.join(__dirname, '..', 'resources', 'node');

// Determine platform and architecture
const platform = process.platform;
const arch = process.arch;

function getNodeDownloadUrl() {
  let osName, ext;

  if (platform === 'darwin') {
    osName = 'darwin';
    ext = 'tar.gz';
  } else if (platform === 'win32') {
    osName = 'win';
    ext = 'zip';
  } else if (platform === 'linux') {
    osName = 'linux';
    ext = 'tar.gz';
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  let archName;
  if (arch === 'x64') {
    archName = 'x64';
  } else if (arch === 'arm64') {
    archName = 'arm64';
  } else {
    throw new Error(`Unsupported architecture: ${arch}`);
  }

  const filename = `node-v${NODE_VERSION}-${osName}-${archName}.${ext}`;
  return {
    url: `https://nodejs.org/dist/v${NODE_VERSION}/${filename}`,
    filename,
    ext
  };
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url}...`);
    const file = fs.createWriteStream(dest);

    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  const { url, filename, ext } = getNodeDownloadUrl();

  // Create resources/node directory
  if (!fs.existsSync(RESOURCES_DIR)) {
    fs.mkdirSync(RESOURCES_DIR, { recursive: true });
  }

  const downloadPath = path.join(RESOURCES_DIR, filename);
  const nodeBinPath = path.join(RESOURCES_DIR, 'node');

  // Check if already downloaded
  if (fs.existsSync(nodeBinPath)) {
    console.log('Node binary already exists, skipping download.');
    return;
  }

  await downloadFile(url, downloadPath);
  console.log('Download complete. Extracting...');

  // Extract the archive
  if (ext === 'tar.gz') {
    execSync(`tar -xzf "${filename}" --strip-components=1`, {
      cwd: RESOURCES_DIR,
      stdio: 'inherit'
    });
  } else if (ext === 'zip') {
    execSync(`unzip -o "${filename}"`, {
      cwd: RESOURCES_DIR,
      stdio: 'inherit'
    });
  }

  // Clean up the archive
  fs.unlinkSync(downloadPath);

  // On Unix, make the node binary executable
  if (platform !== 'win32') {
    const binPath = path.join(RESOURCES_DIR, 'bin', 'node');
    if (fs.existsSync(binPath)) {
      fs.chmodSync(binPath, 0o755);
    }
  }

  console.log('Node.js binary ready at:', RESOURCES_DIR);
}

main().catch((err) => {
  console.error('Failed to download Node.js:', err);
  process.exit(1);
});
