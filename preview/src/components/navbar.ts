import { getT, getLanguage, setLanguage, onLanguageChange } from '../i18n';
import logoUrl from '../../public/logo.svg';

export function renderNavbar(container: HTMLElement): void {
  function update(): void {
    const t = getT();
    const currentLang = getLanguage();
    const isScrolled = window.scrollY > 20;

    container.innerHTML = `
      <nav class="nav ${isScrolled ? 'scrolled' : ''}" id="mainNav">
        <a href="#" class="nav-logo">
          <img src="${logoUrl}" alt="ShareDOM logo" class="nav-logo-img" width="32" height="32" />
          <span class="nav-logo-text">ShareDOM</span>
        </a>

        <div class="nav-links">
          <a href="#playground">${t.nav.playground}</a>
          <a href="#pdf-demo">PDF Demo</a>
          <a href="#features">${t.nav.features}</a>
          <a href="#usage">${t.nav.usage}</a>
          <a href="https://chromewebstore.google.com/detail/sharedom-dom-screenshot-i/nnpbohgnnkkagbbfjeknpeokbppddjnm" target="_blank" rel="noopener noreferrer" class="nav-extension-link" title="Chrome Extension">${t.nav.extension}</a>
          <a href="https://www.npmjs.com/package/sharedom" target="_blank" rel="noopener">${t.nav.npm}</a>
          <a href="https://github.com/Erickgiber/sharedom" target="_blank" rel="noopener">${t.nav.github}</a>
        </div>


        <div class="nav-right">
          <a href="https://www.paypal.com/ncp/payment/62GKBN5BDSAWL" target="_blank" rel="noopener noreferrer" class="nav-coffee-btn" title="${t.nav.buyCoffee}">
            ${t.nav.buyCoffee}
          </a>
          <button type="button" class="lang-switch-btn" id="langSwitchBtn" title="Switch language">
            ${currentLang.toUpperCase()}
          </button>
        </div>
      </nav>
    `;

    document.getElementById('langSwitchBtn')?.addEventListener('click', () => {
      setLanguage(currentLang === 'en' ? 'es' : 'en');
    });
  }

  update();
  onLanguageChange(() => update());

  window.addEventListener(
    'scroll',
    () => {
      const nav = document.getElementById('mainNav');
      if (!nav) return;
      if (window.scrollY > 20) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    },
    { passive: true }
  );
}
