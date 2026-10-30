import {pipeline, env} from '@huggingface/transformers';
import {at} from './common.mjs';
import {toCaptions} from '../lib/project.mjs';

// CPU works without a CUDA/WebGPU setup. Model files are cached locally.
export async function transcribe(samples, durationMs, language = 'pt') {
  env.cacheDir = at('.cache', 'models');
  const model = 'Xenova/whisper-base';
  console.log('Transcrevendo localmente. No primeiro uso, sera baixado o modelo Whisper base multilíngue.');
  const asr = await pipeline('automatic-speech-recognition', model, {device:'cpu',dtype:'q8'});
  try {
    const result = await asr(samples, {language, task:'transcribe', return_timestamps:'word', chunk_length_s:30, stride_length_s:5});
    const captions = toCaptions(result.chunks, durationMs);
    if (!captions.length) throw new Error('Nenhuma fala identificada. Confira o audio ou forneca um SRT/JSON com --captions.');
    return {text:result.text, captions, model};
  } finally {await asr.dispose();}
}
