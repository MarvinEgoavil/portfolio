export function iniciarIdioma() {
  // Referencias móviles y escritorio
  const menus = [
    {
      btn: document.getElementById('language-btn'),
      list: document.getElementById('language-list'),
      selected: document.getElementById('selected-language'),
    },
    {
      btn: document.getElementById('language-btn-desktop'),
      list: document.getElementById('language-list-desktop'),
      selected: document.getElementById('selected-language-desktop'),
    }
  ];

  const i18nElements = document.querySelectorAll('[data-i18n]');
  const i18nPlaceholders = document.querySelectorAll('[data-i18n-placeholder]');

  const actualizarVisualmenteIdioma = (lang, flagClass) => {
    menus.forEach(menu => {
      if (menu.selected) {
        menu.selected.textContent = lang.toUpperCase();
        const flagIcon = menu.selected.previousElementSibling;
        if (flagIcon) flagIcon.className = `fi ${flagClass}`;
      }
    });
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

  menus.forEach(menu => {
    if (!menu.btn || !menu.list) return;
    // Listener abrir/cerrar menú
    menu.btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = menu.list.hasAttribute('hidden');
      menu.btn.setAttribute('aria-expanded', String(isHidden));
      isHidden ? menu.list.removeAttribute('hidden') : menu.list.setAttribute('hidden', '');
    });

    document.addEventListener('click', (e) => {
      if (!menu.btn.contains(e.target) && !menu.list.contains(e.target)) {
        menu.list.setAttribute('hidden', '');
        menu.btn.setAttribute('aria-expanded', 'false');
      }
    });

    // Listener idioma
    menu.list.querySelectorAll('li button.lang-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const li = btn.closest('li');
        const lang = li?.getAttribute('data-lang');
        const flagClass = btn.querySelector('span')?.className || '';
        if (!lang) return;

        // Marca seleccionado en ambos menús
        menus.forEach(m => {
          m.list.querySelectorAll('li button.lang-option').forEach(b => b.classList.remove('active-lang'));
          m.list.querySelectorAll('li').forEach(li => li.setAttribute('aria-selected', 'false'));
        });

        btn.classList.add('active-lang');
        li?.setAttribute('aria-selected', 'true');
        menu.list.setAttribute('hidden', '');
        menu.btn.setAttribute('aria-expanded', 'false');

        localStorage.setItem('language', lang);
        cargarIdioma(lang, flagClass);
      });
    });
  });

  // Inicializa el idioma visualmente
  setTimeout(() => {
    menus.forEach(menu => {
      const btnGuardado = menu.list.querySelector(`li[data-lang="${langGuardado}"] button`);
      const flagClass = btnGuardado?.querySelector('span')?.className || '';
      if (btnGuardado) btnGuardado.click();
      // cargarIdioma(langGuardado, flagClass); // Quita esto si usas click()
    });
  }, 10);
}
