export function iniciarIdioma() {
  const languageBtn = document.getElementById('language-btn');
  const languageList = document.getElementById('language-list');
  const selectedLanguage = document.getElementById('selected-language');
  const selectedLanguageMobile = document.getElementById('selected-language-mobile');
  const langOptions = document.querySelectorAll('#language-list li button.lang-option');

  const i18nElements = document.querySelectorAll('[data-i18n]');
  const i18nPlaceholders = document.querySelectorAll('[data-i18n-placeholder]');

  const setAriaExpanded = (el, expanded) => {
    if (el) el.setAttribute('aria-expanded', String(expanded));
  };

  const actualizarVisualmenteIdioma = (lang, flagClass) => {
    const texto = lang.toUpperCase();
    if (selectedLanguage) selectedLanguage.textContent = texto;
    if (selectedLanguageMobile) selectedLanguageMobile.textContent = texto;

    const flagIcon = selectedLanguage?.previousElementSibling;
    const mobileFlagIcon = selectedLanguageMobile?.previousElementSibling;

    const claseBandera = flagClass?.split(' ').find(cls => cls.startsWith('fi-')) || '';

    if (flagIcon) flagIcon.className = `fi ${claseBandera}`;
    if (mobileFlagIcon) mobileFlagIcon.className = `fi ${claseBandera}`;
  };

  const cargarIdioma = async (lang, flagClass) => {
    try {
      const res = await fetch(`json/i18n/${lang}.json`);
      const translations = await res.json();

      i18nElements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) el.innerText = translations[key];
      });

      i18nPlaceholders.forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[key]) el.setAttribute('placeholder', translations[key]);
      });

      localStorage.setItem('language', lang);
      actualizarVisualmenteIdioma(lang, flagClass);
    } catch (error) {
      console.error("Error cargando idioma:", error);
    }
  };

  // Restaurar idioma guardado
  const langGuardado = localStorage.getItem('language') || 'es';
  setTimeout(() => {
    const btnGuardado = document.querySelector(`#language-list li[data-lang="${langGuardado}"] button`);
    const flagClass = btnGuardado?.querySelector('span')?.className || '';
    if (btnGuardado) btnGuardado.click();
    cargarIdioma(langGuardado, flagClass);
  }, 10);

  // Listeners de interfaz
  if (languageBtn && languageList && selectedLanguage) {
    languageBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = languageList.hasAttribute('hidden');
      languageBtn.setAttribute('aria-expanded', String(isHidden));
      isHidden ? languageList.removeAttribute('hidden') : languageList.setAttribute('hidden', '');
    });

    document.addEventListener('click', (e) => {
      if (!languageBtn.contains(e.target) && !languageList.contains(e.target)) {
        languageList.setAttribute('hidden', '');
        setAriaExpanded(languageBtn, false);
      }
    });

    langOptions.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const li = btn.closest('li');
        const lang = li?.getAttribute('data-lang');
        const flagClass = btn.querySelector('span')?.className || '';

        if (!lang) return;

        langOptions.forEach(b => b.classList.remove('active-lang'));
        document.querySelectorAll('#language-list li').forEach(li => li.setAttribute('aria-selected', 'false'));

        btn.classList.add('active-lang');
        li?.setAttribute('aria-selected', 'true');

        languageList.setAttribute('hidden', '');
        setAriaExpanded(languageBtn, false);

        localStorage.setItem('language', lang);
        cargarIdioma(lang, flagClass);
      });
    });
  }
}
