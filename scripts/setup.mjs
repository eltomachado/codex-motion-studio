import {existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {at, run, main, remotionBrowser, assertNode} from './common.mjs';

main(async () => {
  assertNode();
  // Invoke npm as JavaScript, never build shell commands from file paths.
  const req = createRequire(import.meta.url);
  let npm = process.env.npm_execpath;
  if (!npm) {
    const guesses = [path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js'), path.resolve(path.dirname(process.execPath),'../lib/node_modules/npm/bin/npm-cli.js')];
    try {guesses.unshift(req.resolve('npm/bin/npm-cli.js'));} catch {}
    npm = guesses.find(existsSync);
  }
  if (!npm) throw new Error('npm nao localizado. Execute npm run setup para usar o npm da sua instalacao.');
  await run(process.execPath,[npm, existsSync(at('package-lock.json')) ? 'ci' : 'install', '--include=optional', '--no-fund']);
  await remotionBrowser();
  await run(process.execPath,['scripts/demo.mjs']);
  await run(process.execPath,['scripts/doctor.mjs']);
  console.log('\nPronto. Continue no Codex e envie seu audio com o prompt. Nenhuma interface externa e necessaria.');
});
