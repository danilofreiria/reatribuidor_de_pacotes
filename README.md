# 📦 FindRoute – Reatribuidor de Pacotes SPX

![GitHub last commit](https://img.shields.io/github/last-commit/danilofreiria/reatribuidor_de_pacotes?style=for-the-badge&logo=github&label=Último%20Commit)
![GitHub repo size](https://img.shields.io/github/repo-size/danilofreiria/reatribuidor_de_pacotes?style=for-the-badge&logo=github&label=Tamanho)
![License](https://img.shields.io/badge/Licen%C3%A7a-MIT-blue?style=for-the-badge)

Aplicativo desktop **100% offline** construído com Electron e Node.js para agilizar a consulta e reatribuição de pacotes logísticos. Permite buscas por **BR** ou **CEP**, exportação de relatórios `.csv` e impressão otimizada de etiquetas térmicas.

---

![Demonstração do FindRoute](URL_DA_SUA_IMAGEM.gif)

## 💡 Motivação

Este sistema foi desenvolvido para resolver gargalos operacionais e substituir processos manuais baseados em planilhas, trazendo mais eficiência para o dia a dia nos hubs SPX.

-   **Agilizar Tomada de Decisões:** Reatribuição rápida, rastreio de erros e geração de evidências.
-   **Otimizar Tempo Operacional:** Geração de etiquetas prontas para impressão com um clique.
-   **Facilidade de Uso:** Aplicativo portátil e offline, fácil de distribuir e usar em tempo real sem depender de internet.

## ✨ Funcionalidades

-   **Importação de Dados:** Suporte para dois arquivos `.csv`: histórico de romaneio e romaneio do dia.
-   **Busca Inteligente:**
    -   Por **BR**: encontra o CEP no histórico e busca até 3 rotas correspondentes no romaneio do dia.
    -   Por **CEP**: busca direta por até 3 rotas disponíveis.
-   **Atribuição Manual:** Janela dedicada para registrar pacotes fora do fluxo padrão (erros de sistema, pacotes de escritório, etc.).
-   **Impressão de Etiquetas:** Após cada registro, um pop-up otimizado para impressão térmica é exibido.
-   **Logs e Relatórios:** Geração de logs diários e exportação de um relatório `.csv` consolidado, nomeado automaticamente com a data.

## 🛠️ Tecnologias Utilizadas

-   **[Electron](https://www.electronjs.org/)**: Framework para criar o aplicativo desktop multiplataforma.
-   **[Node.js](https://nodejs.org/) (fs, csv-parser)**: Para manipulação de arquivos e leitura eficiente dos CSVs.
-   **HTML, CSS, JavaScript**: Para a construção da interface do usuário.
-   **[electron-builder](https://www.electron.build/)**: Para gerar o executável portátil (`.exe`) e instaladores.

## 🚀 Guia para Desenvolvedores

### Pré-requisitos

-   [Node.js](https://nodejs.org/en/) (versão LTS)
-   [Git](https://git-scm.com/)

### Instalação e Execução

1.  Clone o repositório:
    ```bash
    git clone [https://github.com/danilofreiria/reatribuidor_de_pacotes.git](https://github.com/danilofreiria/reatribuidor_de_pacotes.git)
    cd reatribuidor_de_pacotes
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Execute em modo de desenvolvimento:
    ```bash
    npm start
    ```

### Gerando o Executável

Para compilar e empacotar a aplicação (incluindo a versão portátil), execute:
```bash
npm run dist
```
Os arquivos serão gerados na pasta `/dist`.

## 📂 Estrutura do Projeto

```
reatribuidor-de-pacotes/
├── /build/              # Ícone da aplicação (icon.ico)
├── /dist/               # Arquivos de build (instalador e portable)
├── /public/             # Arquivos da interface (front-end)
│   ├── index.html       # Tela principal
│   ├── manual.html      # Tela de atribuição manual
│   ├── etiqueta.html    # Template da etiqueta para impressão
│   ├── style.css        # Estilos principais
│   ├── renderer.js      # Lógica da tela principal
│   └── manual.js        # Lógica da tela manual
├── main.js              # Processo principal do Electron (backend)
├── preload.js           # Script de ponte segura entre main e renderer
└── package.json         # Dependências e scripts do projeto
```

## 🗺️ Próximos Passos

-   [ ] Ajustar layout da etiqueta para dimensões específicas (ex: 10x8 cm).
-   [ ] Avaliar impressão direta sem a necessidade do pop-up de confirmação.
-   [ ] Adicionar validação de dados no upload dos CSVs (verificar colunas obrigatórias).
-   [ ] Enriquecer relatórios com novas métricas (ex: agrupar pacotes por rota).

## 🤝 Contribuição

Este é um projeto individual, mas feedbacks e sugestões são sempre bem-vindos! Sinta-se à vontade para abrir uma *Issue* para relatar bugs ou propor novas funcionalidades.

---
<p align="center">
  Desenvolvido por <a href="https://github.com/danilofreiria">Danilo Freiria</a>
</p>