# Solução de problemas

Peça ao próprio Codex para resolver. Não é necessário abrir um editor.

**Node/npm ausentes:** instale Node 24 LTS pela fonte oficial https://nodejs.org/.
Remotion depende do Node; o projeto não instala Node silenciosamente. Git é necessário
para clonar, mas não para renderizar uma cópia já baixada.

**Downloads bloqueados:** instalação acessa npm, Chromium e FFmpeg; a primeira
transcrição acessa Hugging Face para baixar pesos. Use o fluxo normal de permissões
da sessão. Não desative o sandbox ou proteções do sistema.

**FFmpeg ausente:** execute `npm rebuild ffmpeg-static`. Os scripts permitidos estão
enumerados em `allowScripts` no package.json.

**Sharp ou outro binário nativo ausente:** confirme que a instalação terminou sem falhas
de download e repita `npm run setup`. Ela inclui as dependências opcionais específicas
do sistema. Falhas de rede nesses pacotes podem não interromper o npm; por isso o instalador
também executa um diagnóstico que importa o runtime de transcrição.

**Chromium não inicia no Linux:** podem faltar bibliotecas de sistema. Consulte
https://www.remotion.dev/docs/miscellaneous/linux-dependencies. Não use `--no-sandbox`.

**Transcrição lenta:** usa CPU. O primeiro uso baixa o modelo; os próximos usam cache.
Se já tem SRT/JSON com tempos, use `--captions`. Não distribua palavras igualmente
no tempo fingindo sincronização real.

**Áudio sem fala:** forneça `--captions` com um JSON `[]` para áudio instrumental.
O exemplo incluso usa som sintético e não chama ASR.

**Nome reconhecido errado:** revise `project.json` e `work/projects/ID/transcript.json`.
A voz original não é modificada pela correção do texto.

**ID já existe / EEXIST:** use outro ID para não sobrescrever. Se uma ingestão falhou,
o diretório parcial fica preservado para diagnóstico. Não apague o áudio original.

**Texto cortado:** ajuste as cenas e confira os PNGs. A duração do áudio é preservada,
arredondada para um frame de vídeo. As animações não prolongam a voz.

**Status impede render:** `awaiting-direction` é um rascunho técnico. O Codex precisa
interpretar o pedido e criar as cenas antes de mudar o status para `ready`.

**Astra não aparece:** o projeto não libera modelos nem assina planos. Use um modelo
disponível capaz de editar código no Codex ou aguarde acesso ao modelo desejado.

**Anexo inacessível:** informe um caminho acessível à sessão. O projeto não consegue
ler um anexo que o cliente não expôs ao ambiente.
