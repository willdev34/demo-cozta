/* ==========================================================================
   COZTA, protótipo: código compartilhado pelas três telas
   Expõe window.Cozta com:
   - formatadores (brl, num) e o gerador de links de WhatsApp (wa)
   - ícones (icon)
   - createPage(): monta o casco do app (topo, conteúdo, navegação), guarda o
     estado da sessão e redesenha a tela a cada clique.
   Sem dependências e sem build: abre em qualquer hospedagem estática.
   ========================================================================== */
(function () {
  'use strict';

  // ---------- Formatação em português do Brasil ----------
  const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const num = (n) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

  // Link do WhatsApp com mensagem pronta (sem número: a pessoa escolhe o contato).
  const wa = (text) => 'https://wa.me/?text=' + encodeURIComponent(text);

  // ---------- Ícones (traço simples, herdam a cor do texto) ----------
  const ICON_PATHS = {
    minus: '<path d="M5 12h14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    day: '<rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9.5h18M8 3v3M16 3v3M9 15l2 2 4-4"/>',
    book: '<path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6z"/><path d="M6 3v18M10 8h6M10 12h6"/>',
    truck: '<path d="M2 6h11v10H2zM13 9h4l3 3v4h-7"/><circle cx="6.5" cy="17.5" r="2"/><circle cx="16.5" cy="17.5" r="2"/>',
    chat: '<path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4.1A8 8 0 1 1 20 12z"/>',
  };
  const icon = (name, size = 24, width = 2) =>
    '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor"' +
    ' stroke-width="' + width + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    ICON_PATHS[name] + '</svg>';

  // ---------- Símbolo do Cozta (SVG original da identidade) ----------
  const LOGO =
    '<svg viewBox="0 0 64 64" width="34" height="34" role="img" aria-label="Símbolo Cozta: panela com barras ascendentes">' +
    '<rect x="27" y="5" width="10" height="8" rx="3.5" fill="#D2622A"/>' +
    '<rect x="12" y="12" width="40" height="6" rx="3" fill="#1F4D3A"/>' +
    '<rect x="3" y="27" width="10" height="6" rx="3" fill="#1F4D3A"/>' +
    '<rect x="51" y="27" width="10" height="6" rx="3" fill="#1F4D3A"/>' +
    '<path d="M10 22H54V44A12 12 0 0 1 42 56H22A12 12 0 0 1 10 44Z" fill="#1F4D3A"/>' +
    '<rect x="17.5" y="40" width="7" height="10" rx="1.5" fill="#ffffff"/>' +
    '<rect x="28.5" y="34" width="7" height="16" rx="1.5" fill="#ffffff"/>' +
    '<rect x="39.5" y="28" width="7" height="22" rx="1.5" fill="#ffffff"/>' +
    '</svg>';

  // ---------- Estado da sessão ----------
  // O estado que deve sobreviver à troca de tela fica no sessionStorage.
  // Se o navegador bloquear o armazenamento, o protótipo segue funcionando
  // (só não lembra o estado ao trocar de tela).
  const STORAGE_KEY = 'cozta:prototipo';

  function loadStored() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  function saveStored(patch) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign(loadStored(), patch)));
    } catch (error) {
      /* sem armazenamento: segue só em memória */
    }
  }

  // ---------- Barra de navegação ----------
  const TABS = [
    { id: 'meu-dia', label: 'Meu dia', href: 'index.html', icon: 'day' },
    { id: 'ficha', label: 'Fichas', href: 'ficha.html', icon: 'book' },
    { id: 'fornecedores', label: 'Fornecedores', href: 'fornecedores.html', icon: 'truck' },
  ];

  function tabbar(active) {
    const items = TABS.map((tab) =>
      '<a class="tab" href="' + tab.href + '"' + (tab.id === active ? ' aria-current="page"' : '') + '>' +
      icon(tab.icon) + '<span>' + tab.label + '</span></a>'
    ).join('');
    return '<nav class="tabbar" aria-label="Navegação principal">' + items + '</nav>';
  }

  // ---------- Montagem de uma tela ----------
  // config.active   id da aba ativa
  // config.defaults estado inicial
  // config.persist  chaves do estado que sobrevivem à troca de tela
  // config.view     função (estado) => HTML do conteúdo
  // config.actions  { nome: (estado, dataset) => alteração do estado }
  function createPage(config) {
    const root = document.getElementById('app');

    // Casco fixo: topo, área de conteúdo e navegação.
    root.innerHTML =
      '<header class="appbar">' + LOGO +
      '<span class="brand-name">Cozta</span><span class="spacer"></span>' +
      '<span class="shift">Turno da manhã</span></header>' +
      '<main class="content" id="content"></main>' +
      tabbar(config.active);
    const content = root.querySelector('#content');

    // Estado inicial: padrões da tela + o que veio da sessão.
    const persist = config.persist || [];
    const stored = loadStored();
    let state = Object.assign({}, config.defaults);
    persist.forEach((key) => {
      if (key in stored) state[key] = stored[key];
    });

    // Redesenha o conteúdo mantendo a rolagem e o foco do teclado.
    function render() {
      const scrollTop = content.scrollTop;
      const active = document.activeElement;
      const focusKey = active && active.dataset ? active.dataset.key : null;

      content.innerHTML = config.view(state);
      content.scrollTop = scrollTop;

      if (focusKey) {
        const again = content.querySelector('[data-key="' + focusKey + '"]');
        if (again && !again.disabled) again.focus({ preventScroll: true });
      }
    }

    function setState(patch) {
      state = Object.assign({}, state, patch);
      const toSave = {};
      persist.forEach((key) => { toSave[key] = state[key]; });
      saveStored(toSave);
      render();
    }

    // Um único ouvinte de clique: qualquer elemento com data-action.
    content.addEventListener('click', (event) => {
      const target = event.target.closest('[data-action]');
      if (!target || target.disabled) return;
      const action = config.actions[target.dataset.action];
      if (action) setState(action(state, target.dataset) || {});
    });

    render();
  }

  window.Cozta = { brl, num, wa, icon, createPage };
})();
