import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {validId, validateProject} from '../lib/project.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const at = (...parts) => path.join(root, ...parts);
export const projectDir = id => at('public', 'projects', validId(id));
export const workDir = id => at('work', 'projects', validId(id));
export async function json(file) {return JSON.parse(await readFile(file, 'utf8'));}
export async function saveJson(file, data) {
  await mkdir(path.dirname(file), {recursive:true});
  await writeFile(file, JSON.stringify(data, null, 2)+'\n');
}
export async function loadProject(id) {
  const p = validateProject(await json(path.join(projectDir(id), 'project.json')));
  if (p.id !== id) throw new Error('O ID do projeto precisa corresponder ao nome da pasta.');
  return p;
}
export function assertNode() {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 22 || (major === 22 && minor < 13)) throw new Error('Instale Node.js 22.13+ ou 24 LTS em https://nodejs.org/.');
}

export function run(exe, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(exe, args, {cwd:root, stdio:'inherit', shell:false, windowsHide:true, ...options});
    proc.once('error', reject);
    proc.once('exit', code => code === 0 ? resolve() : reject(new Error(`${path.basename(exe)} terminou com codigo ${code}.`)));
  });
}
export async function remotionBrowser() {
  const {ensureBrowser} = await import('@remotion/renderer');
  return ensureBrowser({chromeMode:'headless-shell', logLevel:'info'});
}
export function main(fn) {fn().catch(error => {console.error(`\nErro: ${error.message}`); process.exit(1);});}
