export function inicializarBuscador() {
    const input = document.getElementById('buscador');
    if (!input) return;

    // --- Configuración del historial ---
    const CACHE_KEY = 'buscador-ultimas';
    const MAX_CACHE = 5;

    // --- REUTILIZAR el panel de resultados SIEMPRE EXISTE ---
    const resultsDiv = document.getElementById('resultados-buscador');
    resultsDiv.innerHTML = '';
    resultsDiv.classList.remove('visible');
    resultsDiv.setAttribute('aria-live', 'polite'); // Accesibilidad

    // --- Definir el área de búsqueda (preciso para tu web) ---
    const buscables = [
        ...document.querySelectorAll(
            'nav#nav-menu a, .sidebar-menu a, .submenu a, section.seccion, section[id]'
        )
    ];
    const unicos = Array.from(new Set(buscables));

    // --- Historial en localStorage ---
    function getUltimasBusquedas() {
        try {
            return JSON.parse(localStorage.getItem(CACHE_KEY) || "[]");
        } catch {
            return [];
        }
    }
    function guardarBusqueda(texto) {
        if (!texto || texto.length < 2) return;
        let ultimas = getUltimasBusquedas();
        ultimas = ultimas.filter(e => e.toLowerCase() !== texto.toLowerCase());
        ultimas.unshift(texto);
        if (ultimas.length > MAX_CACHE) ultimas = ultimas.slice(0, MAX_CACHE);
        localStorage.setItem(CACHE_KEY, JSON.stringify(ultimas));
    }

    // --- Mostrar historial ---
    function mostrarRecientes() {
        let ultimas = getUltimasBusquedas();
        if (!ultimas.length) {
            resultsDiv.classList.remove('visible');
            resultsDiv.innerHTML = '';
            return;
        }
        resultsDiv.innerHTML = ultimas.map(txt => `
      <div class="resultado-item resultado-cache">
        <a href="#" tabindex="0" onclick="document.getElementById('buscador').value='${txt.replace(/'/g, "\\'")}';document.getElementById('buscador').dispatchEvent(new Event('input'));return false;">
          <i class="fas fa-history"></i> <span>${txt.replace(/</g, "&lt;")}</span>
        </a>
      </div>
    `).join('');
        resultsDiv.classList.add('visible');
    }

    // --- Buscar y mostrar resultados ---
    function buscarYMostrar(texto) {
        const query = texto.trim().toLowerCase();
        resultsDiv.innerHTML = '';

        if (query.length < 2) {
            mostrarRecientes();
            return;
        }

        let encontrados = [];
        unicos.forEach(el => {
            if (el.offsetParent === null) return;
            let contenido = (el.textContent || '').trim();
            if (!contenido.toLowerCase().includes(query)) return;

            // Limitar contexto para mostrar
            let contexto = contenido;
            if (contexto.length > 120) contexto = contexto.slice(0, 120) + '…';

            // Garantizar id
            let id = el.id;
            if (!id) {
                id = 'resultado-' + Math.random().toString(36).substr(2, 9);
                el.id = id;
            }

            encontrados.push({ contexto, id });
        });

        if (encontrados.length === 0) {
            resultsDiv.innerHTML = `
        <div class="no-results">
          <span>😕</span>
          <p>No se encontró nada.<br>Prueba otra palabra.</p>
        </div>`;
            resultsDiv.classList.add('visible');
            return;
        }

        // Guarda solo búsquedas exitosas
        guardarBusqueda(texto.trim());

        resultsDiv.innerHTML = encontrados.map(r => `
      <div class="resultado-item">
        <a href="#${r.id}" tabindex="0"
           onclick="window.location.hash='${r.id}';document.getElementById('${r.id}').scrollIntoView({behavior:'smooth'});document.getElementById('resultados-buscador').classList.remove('visible');return false;">
          ${resaltar(r.contexto, query)}
        </a>
      </div>
    `).join('');
        resultsDiv.classList.add('visible');
    }

    // --- Resalta coincidencias ---
    function resaltar(str, term) {
        if (!term) return str;
        const reg = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return str.replace(reg, '<mark>$1</mark>');
    }

    // --- Eventos UX ---
    input.addEventListener('input', function () {
        buscarYMostrar(this.value);
    });

    input.addEventListener('focus', function () {
        if (this.value.trim().length < 2) {
            mostrarRecientes();
        } else {
            buscarYMostrar(this.value);
        }
    });

    // Si borra todo, muestra historial; si vuelve a escribir, busca
    input.addEventListener('keyup', function (e) {
        if (this.value.trim() === "") {
            mostrarRecientes();
        }
    });

    // Oculta panel al hacer click fuera
    document.addEventListener('mousedown', function (e) {
        if (
            !input.contains(e.target) &&
            !resultsDiv.contains(e.target)
        ) {
            resultsDiv.classList.remove('visible');
        }
    });

    // Accesibilidad: escapa con Escape
    input.addEventListener('keydown', function (e) {
        if (e.key === "Escape") resultsDiv.classList.remove('visible');
    });

    // Accesibilidad para cerrar con Escape desde el panel
    resultsDiv.addEventListener('keydown', function (e) {
        if (e.key === "Escape") resultsDiv.classList.remove('visible');
    });

    // Al final de inicializarBuscador()
    resultsDiv.classList.remove('hidden-by-js');


}
