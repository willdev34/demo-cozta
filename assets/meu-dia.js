/* ==========================================================================
   COZTA, protótipo: tela "Meu dia"
   Porções do dia, lista de produção com quantidades calculadas e uma
   sugestão do assistente. Todos os números são dados de exemplo.
   ========================================================================== */
(function () {
  'use strict';

  const { num, icon, createPage } = window.Cozta;

  // Limites e passo do contador de porções.
  const MIN_PORTIONS = 10;
  const MAX_PORTIONS = 400;
  const STEP = 10;

  // Quanto cada preparo usa por porção (kg).
  const PREP = [
    { id: 'frango', nome: 'Frango em cubos', perPortion: 0.16 },
    { id: 'molho', nome: 'Molho de tomate base', perPortion: 0.06 },
    { id: 'arroz', nome: 'Arroz cozido', perPortion: 0.12 },
    { id: 'legumes', nome: 'Legumes salteados', perPortion: 0.08 },
  ];

  // Estoque de frango de exemplo, usado na sugestão do assistente.
  const STOCK_KG = 12;

  // "Segunda-feira, 12 de outubro" a partir da data de hoje.
  function todayLabel() {
    const text = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // HTML de um item da lista de produção.
  function prepRow(item, portions, done) {
    const isDone = !!done[item.id];
    return (
      '<button class="prep" data-action="toggle" data-id="' + item.id + '" data-key="prep-' + item.id + '"' +
      ' aria-pressed="' + isDone + '">' +
      '<span class="prep__box">' + (isDone ? icon('check', 18, 3) : '') + '</span>' +
      '<span class="prep__text">' +
      '<span class="prep__name">' + item.nome + '</span>' +
      '<span class="small">' + Math.round(item.perPortion * 1000) + ' g por porção</span>' +
      '</span>' +
      '<span class="prep__qty">' + num(item.perPortion * portions) + ' kg</span>' +
      '</button>'
    );
  }

  createPage({
    active: 'meu-dia',
    defaults: { portions: 120, done: { frango: true, molho: true, arroz: false, legumes: false } },
    persist: ['portions', 'done'],

    // Desenha o conteúdo da tela para o estado atual.
    view: (s) => {
      const doneCount = PREP.filter((p) => s.done[p.id]).length;
      const progress = Math.round((doneCount / PREP.length) * 100);
      const missing = 0.16 * s.portions - STOCK_KG;
      const assistText = missing > 0
        ? 'Com ' + s.portions + ' porções, o frango do estoque (' + STOCK_KG + ' kg) não cobre o dia. Faltam ' + num(missing) + ' kg.'
        : 'Com ' + s.portions + ' porções, o estoque de frango (' + STOCK_KG + ' kg) cobre o dia.';

      return (
        '<div class="col"><div class="eyebrow">' + todayLabel() + '</div>' +
        '<h1 class="title">Bom dia, chef</h1></div>' +

        // Quantas porções hoje
        '<section class="card card--green" aria-label="Porções de hoje">' +
        '<div class="col"><div class="label-up">Hoje na cozinha</div>' +
        '<div class="strong" style="font-size:20px">Strogonoff de frango</div></div>' +
        '<div class="row between">' +
        '<button class="step-btn" data-action="dec" data-key="dec" aria-label="Menos 10 porções"' +
        (s.portions <= MIN_PORTIONS ? ' disabled' : '') + '>' + icon('minus', 24, 2.4) + '</button>' +
        '<div class="col" style="align-items:center"><div class="big-number">' + s.portions + '</div>' +
        '<div class="on-dark small" style="font-size:14px">porções</div></div>' +
        '<button class="step-btn" data-action="inc" data-key="inc" aria-label="Mais 10 porções"' +
        (s.portions >= MAX_PORTIONS ? ' disabled' : '') + '>' + icon('plus', 24, 2.4) + '</button>' +
        '</div>' +
        '<a class="link-row" href="ficha.html"><span>Ver ficha técnica do prato</span>' + icon('chevron', 22, 2.2) + '</a>' +
        '</section>' +

        // Lista de produção
        '<section class="card" aria-label="Lista de produção">' +
        '<div class="row between" style="align-items:baseline"><h2>Lista de produção</h2>' +
        '<div class="small" style="font-size:14px;font-weight:700">' + doneCount + ' de ' + PREP.length + ' prontos</div></div>' +
        '<div class="bar"><div class="bar__fill" style="width:' + progress + '%"></div></div>' +
        '<div class="col">' + PREP.map((p) => prepRow(p, s.portions, s.done)).join('') + '</div>' +
        '</section>' +

        // Sugestão do assistente
        '<section class="card card--peach" aria-label="Sugestão do assistente">' +
        '<div class="label-up">' + icon('sparkle', 18, 2.2) + '<span>Sugestão do assistente</span></div>' +
        '<div class="lead">' + assistText + '</div>' +
        '<a class="btn btn--solid" href="fornecedores.html">Gerar lista de compras</a>' +
        '</section>' +

        '<div class="footnote">Dados de exemplo para o protótipo</div>'
      );
    },

    // O que cada botão faz com o estado.
    actions: {
      dec: (s) => ({ portions: Math.max(MIN_PORTIONS, s.portions - STEP) }),
      inc: (s) => ({ portions: Math.min(MAX_PORTIONS, s.portions + STEP) }),
      toggle: (s, data) => ({ done: Object.assign({}, s.done, { [data.id]: !s.done[data.id] }) }),
    },
  });
})();
