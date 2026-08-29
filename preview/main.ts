import { renderNavbar } from './src/components/navbar';
import { renderHero, initHeroAnimation } from './src/components/hero';
import { renderPlayground } from './src/components/playground';
import { renderFeatures } from './src/components/features';
import { renderUsage } from './src/components/usage';
import { renderFooter } from './src/components/footer';
import { onLanguageChange } from './src/i18n';

const revealedKeys = new Set<string>();

export function setupScrollAnimations(): void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          const key = entry.target.getAttribute('data-anim-key');
          if (key) revealedKeys.add(key);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.anim-in').forEach((el, index) => {
    const key = el.getAttribute('data-anim-key') || `anim-el-${index}`;
    if (!el.getAttribute('data-anim-key')) {
      el.setAttribute('data-anim-key', key);
    }

    if (revealedKeys.has(key)) {
      el.classList.add('visible');
    } else if (!el.classList.contains('visible')) {
      observer.observe(el);
    }
  });

  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual) {
    const heroObs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          initHeroAnimation();
          heroObs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    heroObs.observe(heroVisual);
  }
}

function initApp(): void {
  const navMount = document.getElementById('navbar-mount');
  const heroMount = document.getElementById('hero-mount');
  const playgroundMount = document.getElementById('playground-mount');
  const featuresMount = document.getElementById('features-mount');
  const usageMount = document.getElementById('usage-mount');
  const footerMount = document.getElementById('footer-mount');

  if (navMount) renderNavbar(navMount);
  if (heroMount) renderHero(heroMount);
  if (playgroundMount) renderPlayground(playgroundMount);
  if (featuresMount) renderFeatures(featuresMount);
  if (usageMount) renderUsage(usageMount);
  if (footerMount) renderFooter(footerMount);

  setupScrollAnimations();
  onLanguageChange(() => {
    setupScrollAnimations();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
