# Validação desta versão

Verificado em Windows x64 com Node 24.18.0, em 30/10/2026.

- Instalação com lockfile e diagnóstico de FFmpeg, Remotion e runtime de transcrição.
- TypeScript e sete testes de validação de projeto, caminhos e timestamps.
- Exemplo de 12 segundos exportado em H.264/AAC, 30 fps, com quatro cenas revisadas.
- Ingestão de WAV em um caminho com espaços e transcrição Whisper local em CPU.
- Fala de teste sintética em inglês: 18 palavras reconhecidas, com marcações de tempo.
- Ingestão de MP3 com legendas JSON fornecidas, sem chamar o reconhecimento novamente.
- Renderização do teste de voz em 1920 x 1080, 30 fps, com legendas e áudio AAC.
- SHA-256 do original preservado idêntico; correlação entre o WAV e o áudio decodificado
  do MP4 superior a 0,9999. O AAC é uma compressão com perdas; o MP4 não é bit a bit idêntico ao WAV.
- Rascunho sem direção criativa recusado pelo renderizador, com orientação para o agente.
- Auditoria das dependências sem vulnerabilidades reportadas pelo npm na data do teste.

A precisão de nomes e tempos em português deve ser conferida com a gravação do usuário.
O modelo escolhido é multilíngue; o teste automatizado de fala desta entrega usou inglês.
macOS e Linux não foram verificados de ponta a ponta. `npm run check` está disponível
para verificar código e regras do projeto; isso sozinho não certifica renderização em todos os sistemas.

Os arquivos de teste e gravações não são publicados no GitHub. O exemplo visual incluído
é gerado pelo próprio código e não representa o resultado de um áudio real do criador.
