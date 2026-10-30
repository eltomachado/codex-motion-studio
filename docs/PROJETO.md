# Formato de projeto

O agente cria um storyboard a partir do prompt e da fala. O arquivo fica em
`public/projects/ID/project.json`. Tempos são milissegundos relativos ao áudio original.

```json
{
  "version": 1,
  "id": "minha-intro",
  "title": "Minha introdução",
  "status": "ready",
  "durationMs": 10000,
  "width": 1920,
  "height": 1080,
  "fps": 30,
  "audio": "audio.wav",
  "showCaptions": false,
  "theme": {"background":"#060915","accent":"#42F8D5","secondary":"#AC7DFF","text":"#F4F7FF"},
  "peaks": [0.1, 0.2],
  "captions": [],
  "scenes": [
    {"startMs":0,"endMs":5000,"visual":"title","headline":"Minha ideia","detail":"O começo da história."},
    {"startMs":5000,"endMs":10000,"visual":"comparison","headline":"Dois caminhos","detail":"O mesmo áudio.","labels":["VERSÃO A","VERSÃO B"]}
  ]
}
```

O exemplo ilustra o formato; os picos reais são gerados a 30 amostras por segundo.
Não substitua a forma de onda por números inventados.

Tipos iniciais: `title`, `waveform`, `comparison`, `keywords`, `finale`.
`keywords` e `finale` usam o mesmo motor de tipografia; o agente pode criar tratamentos
específicos em `src/Video.tsx`. Não são cinco geradores de IA diferentes.

- Começar em 0; cada cena começa onde a anterior termina; a última termina em `durationMs`.
- Frases principais aceitam até 80 caracteres; 2 a 8 palavras funcionam melhor.
- `detail` aceita até 160 caracteres. Comparações têm dois rótulos de até 26 caracteres.
- Para conteúdo vertical, adaptar a composição; só trocar dimensões estica o layout base.
- Cores usam `#RRGGBB`. FPS aceitos: 24, 25, 30, 60.
- `captions` segue `{text,startMs,endMs,timestampMs,confidence}`. Não inserir HTML.
- Corrija nomes transcritos usando a fala real.
- `awaiting-direction` indica ingestão; `ready` indica cenas criadas pelo agente.
- Não alterar o áudio original para encaixar o template sem pedido do usuário.

`npm run render -- --id ID --stills` gera só imagens de revisão.
O renderer usa uma cópia isolada de assets daquele projeto, sem incluir outros áudios.
