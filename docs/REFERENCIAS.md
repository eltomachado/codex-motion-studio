# Pesquisa e créditos

Consultado em 30/10/2026.

| Projeto | O que foi verificado | Decisão |
| --- | --- | --- |
| [remotion-dev/skills](https://github.com/remotion-dev/skills) | Instruções oficiais para agentes, incluindo Codex. | Referência; sem copiar nem instalar skills globais. |
| [remotion-dev/template-audiogram](https://github.com/remotion-dev/template-audiogram) | Áudio, forma de onda e legendas; licença Remotion. | Referência; sem copiar template ou assets. |
| [haidrrrry/claude-remotion-skill](https://github.com/haidrrrry/claude-remotion-skill) | Skill para Claude com animação e revisão de frames; MIT. | Referência; sem copiar código ou skill. |

Essas referências não fornecem exatamente este fluxo em português, sem interface,
para áudio do usuário e Astra no Codex. Implementamos esse fluxo sobre bibliotecas Remotion.
O ponto de partida foi o gerador oficial `create-video@4.0.539` com o template Blank;
o fluxo de áudio, os scripts e a composição foram implementados neste projeto.

Documentação:

- [Remotion com agentes](https://www.remotion.dev/docs/ai/coding-agents)
- [Remotion Agent Skills](https://www.remotion.dev/docs/ai/skills)
- [AGENTS.md no Codex](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [Instruções para GPT-6 Astra](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra)
- [Transformers.js: áudio no Node](https://huggingface.co/docs/transformers.js/guides/node-audio-processing)
- [Pipeline de reconhecimento de fala](https://huggingface.co/docs/transformers.js/api/pipelines)

## Licenças de dependências

O código e os assets sintéticos escritos aqui são MIT. Isso não altera as licenças de:

- [Remotion](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md): licença própria,
  com critérios de elegibilidade para uso gratuito e licença empresarial.
- [React](https://github.com/facebook/react/blob/main/LICENSE): MIT.
- [Transformers.js](https://github.com/huggingface/transformers.js): Apache-2.0.
- [Whisper](https://github.com/openai/whisper/blob/main/LICENSE): MIT;
  [conversão do modelo usado](https://huggingface.co/Xenova/whisper-base).
- [ffmpeg-static](https://github.com/eugeneware/ffmpeg-static): GPL-3.0; binário e termos
  são baixados como dependência, sem relicenciamento como MIT.
- [Chromium](https://www.chromium.org/chromium-projects/): licenças próprias e de terceiros.

Não distribuímos node_modules, modelos, Chromium ou FFmpeg no Git. O lockfile registra
as dependências usadas. Não há vínculo oficial com OpenAI, Remotion ou Higgsfield.
