# Cozta, protótipo

Protótipo clicável do Cozta para quem cozinha (chef, cozinheiro, gerente).
Três telas: Meu dia, Fichas e Fornecedores. Todos os dados são de exemplo.

## Como abrir

- Online: ative o GitHub Pages do repositório (Settings, Pages, branch `main`, pasta `/ (root)`).
- Local: abra `index.html` no navegador, ou rode `python3 -m http.server 8000` nesta pasta.

## Estrutura

- `index.html`, `ficha.html`, `fornecedores.html`: as três telas
- `assets/style.css`: estilos e cores da identidade
- `assets/shared.js`: casco do app, navegação e estado da sessão
- `assets/meu-dia.js`, `ficha.js`, `fornecedores.js`: lógica de cada tela

Sem build e sem dependências. O botão de WhatsApp abre uma conversa com a mensagem pronta.
