/* ==========================================================================
   COZTA, protótipo: tela "Ficha rápida"
   Rendimento ajustável, custo por porção, preço de venda e food cost na hora.
   Todos os preços são dados de exemplo.
   ========================================================================== */
(function () {
  'use strict';

  const { brl, num, icon, createPage } = window.Cozta;

  // Limites e passos dos contadores.
  const MIN_PORTIONS = 10;
  const MAX_PORTIONS = 400;
  const MIN_PRICE = 10;
  const MAX_PRICE = 80;
  const FOOD_COST_GOAL = 30; // meta de food cost, em %

  // Ingredientes: quanto entra por porção (kg) e o preço por kg.
  const INGREDIENTS = [
    { nome: 'Frango em cubos', perPortion: 0.16, unitPrice: 12.9 },
    { nome: 'Molho de tomate base', perPortion: 0.06, unitPrice: 9.5 },
    { nome: 'Creme de leite', perPortion: 0.04, unitPrice: 16 },
    { nome: 'Champignon', perPortion: 0.03, unitPrice: 38 },
    { nome: 'Arroz cozido', perPortion: 0.12, unitPrice: 4.2 },
    { nome: 'Legumes salteados', perPortion: 0.08, unitPrice: 8 },
  ];

  // Frango em outro fornecedor (exemplo), para a sugestão de economia.
  const CHEAPER_CHICKEN = 11.8;

  // HTML de uma linha de ingrediente.
  function ingredientRow(item, portions) {
    return (
      '<div class="line">' +
      '<div class="col"><span class="line__name">' + item.nome + '</span>' +
      '<span class="small">' + brl(item.unitPrice) + ' por kg</span></div>' +
      '<div class="col end"><span class="line__value">' + brl(item.perPortion * portions * item.unitPrice) + '</span>' +
      '<span class="small">' + num(item.perPortion * portions) + ' kg</span></div>' +
      '</div>'
    );
  }

  createPage({
    active: 'ficha',
    defaults: { portions: 120, price: 22 },
    persist: ['portions', 'price'],

    // Desenha o conteúdo da tela para o estado atual.
    view: (s) => {
      const costPerPortion = INGREDIENTS.reduce((sum, i) => sum + i.perPortion * i.unitPrice, 0);
      const foodCost = (costPerPortion / s.price) * 100;
      const withinGoal = foodCost <= FOOD_COST_GOAL;
      const saving = (INGREDIENTS[0].unitPrice - CHEAPER_CHICKEN) * INGREDIENTS[0].perPortion * s.portions;

      return (
        '<div class="col"><div class="eyebrow">Ficha técnica</div>' +
        '<h1 class="title">Strogonoff de frango</h1></div>' +

        // Custo na hora
        '<section class="card card--green" aria-label="Custo e preço de venda">' +
        '<div class="col"><div class="label-up">Custo por porção</div>' +
        '<div class="money-big">' + brl(costPerPortion) + '</div>' +
        '<div class="on-dark small" style="font-size:14px">Total para ' + s.portions + ' porções: ' + brl(costPerPortion * s.portions) + '</div></div>' +
        '<div class="col divider-top" style="gap:8px"><div class="label-up">Preço de venda</div>' +
        '<div class="row between">' +
        '<button class="step-btn step-btn--small" data-action="priceDec" data-key="priceDec" aria-label="Diminuir o preço de venda em 1 real"' +
        (s.price <= MIN_PRICE ? ' disabled' : '') + '>' + icon('minus', 22, 2.4) + '</button>' +
        '<div class="money-mid">' + brl(s.price) + '</div>' +
        '<button class="step-btn step-btn--small" data-action="priceInc" data-key="priceInc" aria-label="Aumentar o preço de venda em 1 real"' +
        (s.price >= MAX_PRICE ? ' disabled' : '') + '>' + icon('plus', 22, 2.4) + '</button>' +
        '</div></div>' +
        '<div class="row between"><div class="strong" style="font-size:16px">Food cost</div>' +
        '<div class="pill ' + (withinGoal ? 'pill--ok' : 'pill--warn') + '">' + num(foodCost) + '% ' +
        (withinGoal ? 'dentro' : 'acima') + ' da meta de ' + FOOD_COST_GOAL + '%</div></div>' +
        '</section>' +

        // Rendimento
        '<section class="card card--tight" aria-label="Rendimento" style="flex-direction:row;align-items:center;justify-content:space-between">' +
        '<div class="col"><div class="strong" style="font-size:18px">Rendimento</div>' +
        '<div class="small">Muda todas as quantidades</div></div>' +
        '<div class="row" style="gap:10px">' +
        '<button class="step-btn step-btn--light step-btn--small" data-action="dec" data-key="dec" aria-label="Menos 10 porções"' +
        (s.portions <= MIN_PORTIONS ? ' disabled' : '') + '>' + icon('minus', 22, 2.4) + '</button>' +
        '<div class="strong" style="min-width:44px;text-align:center;font-size:22px">' + s.portions + '</div>' +
        '<button class="step-btn step-btn--light step-btn--small" data-action="inc" data-key="inc" aria-label="Mais 10 porções"' +
        (s.portions >= MAX_PORTIONS ? ' disabled' : '') + '>' + icon('plus', 22, 2.4) + '</button>' +
        '</div></section>' +

        // Ingredientes
        '<section class="card" aria-label="Ingredientes" style="gap:8px"><h2>Ingredientes</h2>' +
        '<div class="col">' + INGREDIENTS.map((i) => ingredientRow(i, s.portions)).join('') + '</div></section>' +

        // Sugestão: fornecedor mais barato
        '<section class="card card--peach" aria-label="Sugestão do assistente">' +
        '<div class="label-up">' + icon('sparkle', 18, 2.2) + '<span>Sugestão do assistente</span></div>' +
        '<div class="lead">O frango custa ' + brl(CHEAPER_CHICKEN) + ' por kg em outro fornecedor. Trocar hoje economiza ' + brl(saving) + ' nesta produção.</div>' +
        '<a class="btn btn--solid" href="fornecedores.html">Comparar fornecedores</a>' +
        '</section>' +

        '<div class="footnote">Dados de exemplo para o protótipo</div>'
      );
    },

    // O que cada botão faz com o estado.
    actions: {
      dec: (s) => ({ portions: Math.max(MIN_PORTIONS, s.portions - 10) }),
      inc: (s) => ({ portions: Math.min(MAX_PORTIONS, s.portions + 10) }),
      priceDec: (s) => ({ price: Math.max(MIN_PRICE, s.price - 1) }),
      priceInc: (s) => ({ price: Math.min(MAX_PRICE, s.price + 1) }),
    },
  });
})();
