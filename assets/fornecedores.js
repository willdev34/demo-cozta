/* ==========================================================================
   COZTA, protótipo: tela "Fornecedores"
   Três abas: comparar preços por insumo, lista de compras agrupada por
   fornecedor e caderno de fornecedores. Cotação e pedido saem pelo WhatsApp
   (link com mensagem pronta). Todos os nomes e preços são dados de exemplo.
   ========================================================================== */
(function () {
  'use strict';

  const { brl, num, wa, icon, createPage } = window.Cozta;

  // Fornecedores de exemplo.
  const SUPPLIERS = {
    serra: { nome: 'Carnes Serra Azul', categoria: 'Proteínas' },
    atacado: { nome: 'Atacado Central', categoria: 'Atacado geral' },
    aviario: { nome: 'Aviário Planalto', categoria: 'Aves' },
    vale: { nome: 'Laticínios Vale Verde', categoria: 'Laticínios' },
    aurora: { nome: 'Hortifrúti Aurora', categoria: 'Hortifrúti' },
    norte: { nome: 'Distribuidora Norte', categoria: 'Secos e laticínios' },
  };

  // Preço por kg que cada fornecedor passou e há quantos dias.
  // "current" é o fornecedor onde o restaurante compra hoje.
  const INSUMOS = [
    { id: 'frango', nome: 'Frango em cubos', current: 'serra', offers: [
      { s: 'atacado', price: 11.8, days: 2 },
      { s: 'serra', price: 12.9, days: 5 },
      { s: 'aviario', price: 13.4, days: 12 },
    ] },
    { id: 'creme', nome: 'Creme de leite', current: 'atacado', offers: [
      { s: 'vale', price: 15.2, days: 3 },
      { s: 'atacado', price: 16, days: 6 },
      { s: 'norte', price: 16.8, days: 9 },
    ] },
    { id: 'cogumelo', nome: 'Champignon', current: 'atacado', offers: [
      { s: 'aurora', price: 36.5, days: 1 },
      { s: 'atacado', price: 38, days: 6 },
      { s: 'norte', price: 39.9, days: 14 },
    ] },
  ];

  // O que falta para hoje (120 porções), já no fornecedor mais barato.
  const NEED = [
    { s: 'atacado', nome: 'Frango em cubos', qty: 7.2, price: 11.8, currentPrice: 12.9 },
    { s: 'atacado', nome: 'Arroz branco', qty: 6, price: 5.2, currentPrice: 5.2 },
    { s: 'vale', nome: 'Creme de leite', qty: 4.8, price: 15.2, currentPrice: 16 },
    { s: 'aurora', nome: 'Champignon', qty: 3.6, price: 36.5, currentPrice: 38 },
  ];

  const TAB_DEFS = [
    { id: 'precos', label: 'Preços' },
    { id: 'compras', label: 'Compras' },
    { id: 'caderno', label: 'Caderno' },
  ];

  // Botão do WhatsApp (link que abre em outra aba).
  function whatsappLink(href, label, solid) {
    return (
      '<a class="btn ' + (solid ? 'btn--solid' : 'btn--outline') + '" href="' + href + '" target="_blank" rel="noopener">' +
      icon('chat', 20, 2.2) + '<span>' + label + '</span></a>'
    );
  }

  // ---------- Aba: comparar preços ----------
  function viewPrecos(s) {
    const insumo = INSUMOS.find((i) => i.id === s.insumo) || INSUMOS[0];
    const currentPrice = insumo.offers.find((o) => o.s === insumo.current).price;
    const lowest = Math.min.apply(null, insumo.offers.map((o) => o.price));

    const chips = INSUMOS.map((i) =>
      '<button class="chip" data-action="insumo" data-id="' + i.id + '" data-key="chip-' + i.id + '"' +
      ' aria-pressed="' + (i.id === insumo.id) + '">' + i.nome + '</button>'
    ).join('');

    const offers = insumo.offers.map((o) => {
      const diff = o.price - currentPrice;
      let note = 'Seu fornecedor atual';
      let noteClass = 'note--current';
      if (diff < 0) { note = brl(-diff) + ' a menos por kg que hoje'; noteClass = 'note--less'; }
      if (diff > 0) { note = brl(diff) + ' a mais por kg que hoje'; noteClass = 'note--more'; }
      const isLowest = o.price === lowest;
      const when = o.days === 1 ? 'há 1 dia' : 'há ' + o.days + ' dias';

      return (
        '<div class="card offer' + (isLowest ? ' offer--lowest' : '') + '">' +
        '<div class="row between" style="align-items:flex-start">' +
        '<div class="col" style="gap:2px"><span class="offer__name">' + SUPPLIERS[o.s].nome + '</span>' +
        '<span class="small">' + SUPPLIERS[o.s].categoria + ', atualizado ' + when + '</span></div>' +
        '<div class="col end"><span class="offer__price">' + brl(o.price) + '</span><span class="small" style="font-size:12px">por kg</span></div>' +
        '</div>' +
        '<div class="row wrap" style="gap:8px">' + (isLowest ? '<span class="badge">Menor preço</span>' : '') +
        '<span class="note ' + noteClass + '">' + note + '</span></div>' +
        whatsappLink(wa('Olá! Pode me passar o preço atual de ' + insumo.nome + ' (por kg)? Obrigado.'), 'Pedir cotação por WhatsApp', false) +
        '</div>'
      );
    }).join('');

    return '<div class="col" style="gap:14px"><div class="row wrap" style="gap:8px">' + chips + '</div>' + offers + '</div>';
  }

  // ---------- Aba: lista de compras ----------
  function viewCompras() {
    const total = NEED.reduce((sum, n) => sum + n.qty * n.price, 0);
    const saving = NEED.reduce((sum, n) => sum + (n.currentPrice - n.price) * n.qty, 0);

    // Agrupa os itens por fornecedor, mantendo a ordem de aparição.
    const order = [];
    NEED.forEach((n) => { if (order.indexOf(n.s) === -1) order.push(n.s); });

    const groups = order.map((key) => {
      const lines = NEED.filter((n) => n.s === key);
      const subtotal = lines.reduce((sum, n) => sum + n.qty * n.price, 0);
      const message = 'Olá! Gostaria de fazer um pedido:\n' +
        lines.map((n) => '- ' + n.nome + ': ' + num(n.qty) + ' kg').join('\n') +
        '\nPode confirmar preço e entrega?';

      return (
        '<section class="card" style="gap:10px;padding:18px 20px">' +
        '<div class="col"><span class="offer__name">' + SUPPLIERS[key].nome + '</span>' +
        '<span class="small">' + SUPPLIERS[key].categoria + '</span></div>' +
        '<div class="col">' + lines.map((n) =>
          '<div class="line" style="min-height:48px"><div class="col"><span class="line__name">' + n.nome + '</span>' +
          '<span class="small">' + num(n.qty) + ' kg</span></div>' +
          '<span class="line__value">' + brl(n.qty * n.price) + '</span></div>'
        ).join('') + '</div>' +
        '<div class="row between sub-total"><span class="small" style="font-size:14px;font-weight:700">Subtotal</span>' +
        '<span class="strong" style="font-size:18px">' + brl(subtotal) + '</span></div>' +
        whatsappLink(wa(message), 'Enviar pedido por WhatsApp', true) +
        '</section>'
      );
    }).join('');

    return (
      '<div class="col" style="gap:14px">' +
      '<section class="card card--green" aria-label="Resumo da compra" style="gap:4px">' +
      '<div class="label-up">Falta para hoje, 120 porções</div>' +
      '<div class="money-total">' + brl(total) + '</div>' +
      '<div class="on-dark small" style="font-size:14px">Economia de ' + brl(saving) + ' em relação aos fornecedores atuais</div>' +
      '</section>' + groups + '</div>'
    );
  }

  // ---------- Aba: caderno de fornecedores ----------
  function viewCaderno() {
    const cards = Object.keys(SUPPLIERS).map((key) => {
      const quoted = INSUMOS.filter((i) => i.offers.some((o) => o.s === key)).map((i) => i.nome).join(', ');
      return (
        '<section class="card card--tight" style="gap:10px">' +
        '<div class="col" style="gap:2px"><span class="offer__name">' + SUPPLIERS[key].nome + '</span>' +
        '<span class="small" style="color:var(--green);font-weight:700">' + SUPPLIERS[key].categoria + '</span>' +
        '<span class="small">Cotado para: ' + quoted + '</span></div>' +
        whatsappLink(wa('Olá! Tudo bem? Gostaria de uma cotação.'), 'Chamar no WhatsApp', false) +
        '</section>'
      );
    }).join('');
    return '<div class="col" style="gap:12px">' + cards + '</div>';
  }

  createPage({
    active: 'fornecedores',
    defaults: { tab: 'precos', insumo: 'frango' },
    persist: ['tab', 'insumo'],

    // Desenha o conteúdo da tela para o estado atual.
    view: (s) => {
      const tabs = TAB_DEFS.map((t) =>
        '<button data-action="tab" data-id="' + t.id + '" data-key="tab-' + t.id + '" aria-pressed="' + (t.id === s.tab) + '">' + t.label + '</button>'
      ).join('');
      const body = s.tab === 'compras' ? viewCompras() : s.tab === 'caderno' ? viewCaderno() : viewPrecos(s);

      return (
        '<div class="col"><div class="eyebrow">Seu caderno de compras</div>' +
        '<h1 class="title">Fornecedores</h1></div>' +
        '<div class="seg">' + tabs + '</div>' +
        body +
        // Ideia para a segunda fase: base compartilhada entre restaurantes.
        '<section class="card card--dashed" aria-label="Rede de fornecedores, em breve">' +
        '<div class="row between"><span class="offer__name">Rede de fornecedores</span><span class="badge badge--soon">Em breve</span></div>' +
        '<div class="small" style="font-size:15px;line-height:1.4">Veja fornecedores bem avaliados por outros restaurantes da sua região e o preço de referência de cada insumo.</div>' +
        '</section>' +
        '<div class="footnote">Dados de exemplo para o protótipo</div>'
      );
    },

    // O que cada botão faz com o estado.
    actions: {
      tab: (s, data) => ({ tab: data.id }),
      insumo: (s, data) => ({ insumo: data.id }),
    },
  });
})();
