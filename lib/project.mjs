export const MAX_SECONDS = 900;
export const VISUALS = ['title', 'waveform', 'comparison', 'keywords', 'finale'];

export function validId(value) {
  if (typeof value !== 'string' || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(value)) {
    throw new Error('ID invalido. Use letras minusculas, numeros e hifens (ate 64 caracteres).');
  }
  return value;
}

function finite(value, min, max, label) {
  if (!Number.isFinite(value) || value < min || value > max) throw new Error(`${label} invalido.`);
}
function text(value, max, label) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`${label}: use texto de 1 a ${max} caracteres.`);
}

export function validateCaptions(captions, durationMs) {
  if (!Array.isArray(captions) || captions.length > 20000) throw new Error('Legendas invalidas. Use um array de Caption.');
  let previous = -1;
  for (const c of captions) {
    text(c.text, 500, 'Legenda');
    finite(c.startMs, 0, durationMs, 'Inicio da legenda');
    finite(c.endMs, c.startMs + 1, durationMs + 1, 'Fim da legenda');
    if (c.startMs < previous) throw new Error('Legendas fora de ordem.');
    previous = c.startMs;
  }
  return captions;
}

export function validateProject(p) {
  if (p?.version !== 1) throw new Error('Formato de projeto desconhecido.');
  validId(p.id);
  text(p.title, 80, 'Titulo');
  finite(p.durationMs, 100, MAX_SECONDS * 1000, 'Duracao');
  if (![24, 25, 30, 60].includes(p.fps)) throw new Error('FPS permitido: 24, 25, 30 ou 60.');
  for (const key of ['width', 'height']) {
    finite(p[key], 320, 3840, key);
    if (!Number.isInteger(p[key]) || p[key] % 2) throw new Error('Dimensoes precisam ser numeros pares.');
  }
  if (p.audio !== 'audio.wav') throw new Error('O audio de reproducao deve ser audio.wav.');
  if (typeof p.showCaptions !== 'boolean') throw new Error('showCaptions precisa ser booleano.');
  if (!['awaiting-direction', 'ready', 'demo'].includes(p.status)) throw new Error('Status invalido.');
  for (const key of ['background', 'accent', 'secondary', 'text']) {
    if (!/^#[0-9a-f]{6}$/i.test(p.theme?.[key])) throw new Error(`Cor ${key} invalida. Use #RRGGBB.`);
  }
  validateCaptions(p.captions, p.durationMs);
  if (!Array.isArray(p.peaks) || p.peaks.length === 0 || p.peaks.length > 54001 || p.peaks.some(v => !Number.isFinite(v) || v < 0 || v > 1)) throw new Error('Forma de onda invalida.');
  if (!Array.isArray(p.scenes) || p.scenes.length < 1 || p.scenes.length > 250) throw new Error('Use de 1 a 250 cenas.');
  let end = 0;
  for (const s of p.scenes) {
    if (s.startMs !== end) throw new Error('Cenas precisam ser continuas, sem lacunas nem sobreposicoes.');
    finite(s.endMs, s.startMs + 1, p.durationMs, 'Fim da cena');
    text(s.headline, 80, 'Frase principal');
    if (typeof s.detail !== 'string' || s.detail.length > 160) throw new Error('Detalhe deve ter ate 160 caracteres.');
    if (!VISUALS.includes(s.visual)) throw new Error('Tipo de cena desconhecido.');
    if (s.labels && (!Array.isArray(s.labels) || s.labels.length !== 2 || s.labels.some(v => typeof v !== 'string' || v.length < 1 || v.length > 26))) throw new Error('Use dois rotulos curtos na comparacao.');
    end = s.endMs;
  }
  if (end !== p.durationMs) throw new Error('A ultima cena precisa terminar junto com o audio.');
  return p;
}

export function toCaptions(chunks, durationMs) {
  if (!Array.isArray(chunks)) throw new Error('A transcricao nao retornou marcacoes de tempo.');
  return chunks.flatMap((chunk, index) => {
    const start = chunk.timestamp?.[0];
    const stop = chunk.timestamp?.[1] ?? chunks[index + 1]?.timestamp?.[0] ?? durationMs / 1000;
    if (!Number.isFinite(start) || !Number.isFinite(stop) || !chunk.text?.trim()) return [];
    const startMs = Math.max(0, Math.round(start * 1000));
    const endMs = Math.min(durationMs, Math.round(stop * 1000));
    if (endMs <= startMs) return [];
    return [{text: chunk.text.trim(), startMs, endMs, timestampMs: Math.round((startMs + endMs) / 2), confidence: null}];
  }).sort((a, b) => a.startMs - b.startMs);
}

export function parseSrt(source, durationMs) {
  const clock = t => {
    const m = t.match(/^(\d{2,}):(\d{2}):(\d{2})[,.](\d{3})$/);
    if (!m || +m[2] > 59 || +m[3] > 59) throw new Error('Timestamp SRT invalido.');
    return (+m[1]*3600 + +m[2]*60 + +m[3])*1000 + +m[4];
  };
  const captions = source.replace(/^\uFEFF/, '').trim().split(/\r?\n\s*\r?\n/).map(block => {
    const lines = block.split(/\r?\n/);
    const i = lines.findIndex(line => line.includes('-->'));
    if (i < 0) throw new Error('Bloco SRT sem timestamp.');
    const [a, b] = lines[i].split(/\s*-->\s*/);
    return {text: lines.slice(i+1).join(' ').replace(/<[^>]*>/g, '').trim(), startMs: clock(a.trim()), endMs: clock(b.trim()), timestampMs: null, confidence: null};
  });
  return validateCaptions(captions, durationMs);
}

export function peaksFromPcm(samples, fps = 30) {
  const count = Math.ceil(samples.length / 16000 * fps);
  return Array.from({length: count}, (_, i) => {
    const a = Math.floor(i * 16000 / fps);
    const b = Math.min(samples.length, Math.floor((i+1) * 16000 / fps));
    let sum = 0;
    for (let j=a; j<b; j++) sum += samples[j]**2;
    return Math.min(1, Math.sqrt(sum / Math.max(1, b-a)) * 5);
  });
}
