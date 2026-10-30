import {existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {main, at, assertNode} from './common.mjs';

main(async () => {
  assertNode();
  const {default: ffmpeg} = await import('ffmpeg-static');
  if (!ffmpeg || !existsSync(ffmpeg)) throw new Error('FFmpeg ausente. Execute npm rebuild ffmpeg-static e tente novamente.');
  execFileSync(ffmpeg,['-version'],{stdio:'ignore',windowsHide:true});
  await import('@huggingface/transformers');
  await import('@remotion/renderer');
  console.log(`Node ${process.version}: OK\nFFmpeg: OK\nRemotion: OK\nTranscricao local: runtime OK\nExemplo: ${existsSync(at('public/projects/demo/project.json'))?'OK':'execute npm run demo'}`);
  console.log('O modelo de transcricao e baixado no primeiro audio. Astra e escolhido no Codex, nao instalado por este projeto.');
});
