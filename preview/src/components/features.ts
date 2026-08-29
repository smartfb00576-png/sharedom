import { getT, onLanguageChange } from '../i18n';

export function renderFeatures(container: HTMLElement): void {
  function update(): void {
    const t = getT();

    container.innerHTML = `
      <section class="features" id="features">
        <div class="section-header anim-in" data-anim-key="features-header">
          <h2>${t.features.title}</h2>
          <p>${t.features.subtitle}</p>
        </div>

        <div class="features-grid">
          <div class="feature-card anim-in" style="transition-delay:0ms" data-anim-key="feat-1">
            <span class="feature-icon">⚡</span>
            <div class="feature-title">${t.features.f1Title}</div>
            <div class="feature-desc">${t.features.f1Desc}</div>
          </div>

          <div class="feature-card anim-in" style="transition-delay:80ms" data-anim-key="feat-2">
            <span class="feature-icon">🎯</span>
            <div class="feature-title">${t.features.f2Title}</div>
            <div class="feature-desc">${t.features.f2Desc}</div>
          </div>

          <div class="feature-card anim-in" style="transition-delay:160ms" data-anim-key="feat-3">
            <span class="feature-icon">🖼️</span>
            <div class="feature-title">${t.features.f3Title}</div>
            <div class="feature-desc">${t.features.f3Desc}</div>
          </div>

          <div class="feature-card anim-in" style="transition-delay:240ms" data-anim-key="feat-4">
            <span class="feature-icon">🔢</span>
            <div class="feature-title">${t.features.f4Title}</div>
            <div class="feature-desc">${t.features.f4Desc}</div>
          </div>

          <div class="feature-card anim-in" style="transition-delay:320ms" data-anim-key="feat-5">
            <span class="feature-icon">🔄</span>
            <div class="feature-title">${t.features.f5Title}</div>
            <div class="feature-desc">${t.features.f5Desc}</div>
          </div>

          <div class="feature-card anim-in" style="transition-delay:400ms" data-anim-key="feat-6">
            <span class="feature-icon">🔒</span>
            <div class="feature-title">${t.features.f6Title}</div>
            <div class="feature-desc">${t.features.f6Desc}</div>
          </div>
        </div>
      </section>
    `;
  }

  update();
  onLanguageChange(() => update());
}
