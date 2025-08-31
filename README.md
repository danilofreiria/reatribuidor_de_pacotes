#  FindRoute – Reatribuídor de Pacotes SPX

Aplicativo desktop offline construído com [Electron](https://www.electronjs.org/) e Node.js para consultoria e reatribuição de pacotes por **BR** ou **CEP**, com exportação de relatórios (.csv) e impressão otimizada de etiquetas.

---

## Funcionalidades

- Importação de dois CSVs: histórico de romaneio (BR → CEP) e romaneio do dia (CEP → rota, cidade, AT).
- Busca por **BR**: encontra o CEP correspondente no histórico, busca até 3 rotas com ATs distintos no romaneio do dia.
- Busca por **CEP** direto: retorna até 3 rotas com ATs distintos.
- Modal de fallback: se busca por CEP sem BR, permite associar um BR opcionalmente.
- Atribuição manual: permite registrar pacotes fora do fluxo automático (com BR, rota, cidade, AT, motivo e modal).
- Salvamento de logs diários e exportação em formato `.csv` com nome automático incluindo data (e campos: tipo entrada, BR, CEP, rota, cidade, AT, motivo, hora).
- Popup de etiqueta para impressão após cada registro salvo (com botões **Imprimir** e **Fechar**).
- Executável portable gerado via `electron-builder`, com ícone personalizado.

---

## Estrutura do Projeto

/build → Ícone do app (icon.ico)
/dist → Builds criados pelo electron-builder
/public
├── index.html
├── style.css
├── manual.html
├── manual.css
├── renderer.js
├── manual.js
└── etiqueta.html → Template da etiqueta térmica com popup de imprimir/fechar
/main.js → Main process (IPC, criação de janelas, lógica de busca e logs)
/preload.js → Exposição das APIs seguras para renderer
/package.json → Configuração do electron-builder (portable + NSIS, ícone)


---

## Como Iniciar o Projeto

1. Clone ou baixe o repositório.
2. Execute:
   ```bash
   npm install
   npm start
Para gerar os executáveis (incluindo o portátil):

bash
Copy code
npm run dist
Fluxo de Uso (Técnico)
Carregar os CSVs (histórico_romaneio e romaneio_dia).

Digitando um BR:

Histórico → varre por BR → obtém CEP → busca rotas no romaneio do dia → exibe até 3 opções com ATs distintos.

Digitar um CEP:

Busca direta no romaneio do dia → exibe até 3 opções com ATs distintos.

Usuário seleciona uma rota, escolhe o motivo → salva:

Salva o log, abre popup de etiqueta (pré-formatada), com opção de imprimir ou fechar.

Botão Atribuição Manual:

Abertura de uma nova janela para inserir manualmente BR, rota, cidade, AT, modal e motivo, com mesma lógica de salvar e etiqueta.

**Botão Exportar Relatório: Gera .csv com resumo completo do dia.**

Por que esse sistema foi desenvolvido?
Para substituir processos manuais baseados em planilhas.

Agilizar tomada de decisões: reatribuição rápida, rastrear erros, e gerar evidências.

Gerar etiquetas prontas para impressão, otimizando tempo operacional.

Aplicativo portátil e offline, fácil de usar nos hubs SPX e resolver problemas em tempo real.

Tecnologias Utilizadas
Electron – app desktop multiplataforma.

Node.js (fs, csv-parser) – parse e leitura dos arquivos CSV.

HTML/CSS/JavaScript – interface intuitiva e responsiva.

electron-builder – geração de builds portáteis e instaladores.

Próximos Passos
Ajustar layout da etiqueta conforme impressora (e.g., 8x10 cm).

Avaliar impressão direta sem popup (via webContents.print).

Adicionar validação de dados nos uploads (colunas obrigatórias).

Exportar logs mais enriquecidos (ex: agregar caixinhas por rota).

Contribuição
Projeto individual (Danilo Freiria), mas bem-vindo a feedbacks e sugestões via issues.