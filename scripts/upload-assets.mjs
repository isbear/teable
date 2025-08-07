#!/usr/bin/env zx
const env = $.env;
const {  endpoint, 'access-key':accessKey, 'secret-key':secretKey, bucket } = argv;
const nextjsDir = env.NEXTJS_DIR ?? 'apps/nextjs-app';
const staticDir = `${nextjsDir}/.next/static`;

const mcPath = '~/minio-binaries/mc';
const myminio = 'myminio';

const checkPlatform = async () => {
  const platform = await $`uname -m`;
  const os = await $`uname -s`;
  console.log('checkPlatform: platform: ', platform.stdout);
  console.log('checkPlatform: os: ', os.stdout);
  if (platform.stdout.includes('arm64')) {
    return 'linux-arm64';
  }
  return 'linux-amd64';
};

const setupMinioCli = async () => {
  const curlVersion = await $`curl -V`;
  console.log('curl version: ', curlVersion.stdout);

  const platform = await checkPlatform();
  console.log('Installing MinIO CLI: ', platform);
  await $`curl --progress-bar -L https://dl.min.io/client/mc/release/${platform}/mc \
  --create-dirs \
  -o ${mcPath}`;

  const chmod = await $`chmod +x ${mcPath}`;
  console.log('chmod: ', chmod.stdout);

  console.log('Testing mc --version');
  const version = await $`${mcPath} --version`;
  console.log('version: ', version.stdout);

  console.log('Setting up MinIO alias...');
  const alias = await $`${mcPath} alias set ${myminio} ${endpoint} ${accessKey} ${secretKey}`;
  console.log('alias: ', alias.stdout);
};
await setupMinioCli();

const syncStaticDir = async () => {
  const rm = await $`${mcPath} rm --recursive --force ${myminio}/${bucket}/_next`;
  console.log('rm: ', rm.stdout);
  const cp = await $`${mcPath} cp --recursive ${staticDir} ${myminio}/${bucket}/_next/`;
  console.log('cp: ', cp.stdout);
};

await syncStaticDir();
