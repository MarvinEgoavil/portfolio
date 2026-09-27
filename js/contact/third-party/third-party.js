// ==========================================================
// THIRD PARTY
// Vista y comportamiento del canal "A tercero"
// ==========================================================

import {
    montarTurnstile,
    obtenerTokenTurnstile,
    suspenderTurnstile,
    resetearTurnstile
} from './turnstile.js';

import {
    obtenerEstadoTercero,
    desbloquearTercero,
    enviarMensajeTercero
} from './third-party-api.js';

let tokenAccesoTercero = '';
let intervaloBloqueo = null;

export function mostrarTercero({
    panel,
    limpiarPanel,
    crearCabecera
}) {
    limpiarPanel();
    detenerContadorBloqueo();

    panel.setAttribute(
        'aria-labelledby',
        'contacto-tab-third-party'
    );

    const contenedor = document.createElement('div');
    contenedor.className = 'contacto-tercero';

    const cabecera = crearCabecera(
        'fas fa-lock',
        'Comunicación a tercero',
        'Acceso protegido para el envío de mensajes internacionales.'
    );

    const caja = document.createElement('div');
    caja.className =
        'contacto-lock-box tercero-unlock-box';

    const icono = document.createElement('div');
    icono.className = 'contacto-lock-icon';
    icono.innerHTML =
        '<i class="fas fa-lock" aria-hidden="true"></i>';

    const titulo = document.createElement('h4');
    titulo.textContent = 'Función bloqueada';

    const descripcion = document.createElement('p');
    descripcion.textContent =
        'Introduce la clave de acceso para habilitar temporalmente el envío de mensajes a terceros.';

    const claveWrapper =
        document.createElement('div');

    claveWrapper.className =
        'contacto-tercero-clave-wrapper';

    const campoClave =
        document.createElement('input');

    campoClave.type = 'password';
    campoClave.id = 'tercero-clave';
    campoClave.className =
        'contacto-tercero-clave';
    campoClave.placeholder = 'Clave de acceso';
    campoClave.autocomplete = 'current-password';

    const botonVerClave =
        document.createElement('button');

    botonVerClave.type = 'button';
    botonVerClave.className =
        'contacto-tercero-ver-clave';

    botonVerClave.setAttribute(
        'aria-label',
        'Mostrar clave'
    );

    botonVerClave.setAttribute(
        'aria-pressed',
        'false'
    );

    botonVerClave.innerHTML =
        '<i class="fas fa-eye" aria-hidden="true"></i>';

    botonVerClave.addEventListener('click', () => {
        const visible =
            campoClave.type === 'text';

        campoClave.type =
            visible ? 'password' : 'text';

        botonVerClave.setAttribute(
            'aria-label',
            visible
                ? 'Mostrar clave'
                : 'Ocultar clave'
        );

        botonVerClave.setAttribute(
            'aria-pressed',
            String(!visible)
        );

        botonVerClave.innerHTML = visible
            ? '<i class="fas fa-eye" aria-hidden="true"></i>'
            : '<i class="fas fa-eye-slash" aria-hidden="true"></i>';

        campoClave.focus();
    });

    claveWrapper.append(
        campoClave,
        botonVerClave
    );

    // ==========================================
    // INFORMACIÓN DE INTENTOS
    // ==========================================

    const intentosInfo =
        document.createElement('div');

    intentosInfo.className =
        'tercero-intentos-info';

    // ==========================================
    // TURNSTILE
    // ==========================================

    const turnstile =
        document.createElement('div');

    turnstile.id = 'tercero-turnstile';
    turnstile.className =
        'contacto-tercero-turnstile';

    // ==========================================
    // LOADER OVNI — SE CONSERVA
    // ==========================================

    const loader =
        document.createElement('div');

    loader.className =
        'tercero-space-loader';

    loader.hidden = true;

    loader.innerHTML = `
        <div class="tercero-orbita" aria-hidden="true">
            <div class="tercero-planeta">🌎</div>
            <div class="tercero-ovni">
                <span class="tercero-ovni-cupula"></span>
                <span class="tercero-ovni-nave"></span>
                <span class="tercero-ovni-luz"></span>
            </div>
        </div>
        <strong>Verificando acceso...</strong>
        <span>Comprobando la clave de forma segura.</span>
    `;

    const boton =
        document.createElement('button');

    boton.type = 'button';
    boton.className =
        'contacto-tercero-desbloquear';

    boton.innerHTML =
        '<i class="fas fa-key" aria-hidden="true"></i> Desbloquear';

    const estado =
        document.createElement('div');

    estado.id = 'tercero-estado';
    estado.className =
        'contacto-tercero-estado';

    estado.setAttribute(
        'aria-live',
        'polite'
    );

    caja.append(
        icono,
        titulo,
        descripcion,
        claveWrapper,
        intentosInfo,
        turnstile,
        loader,
        boton,
        estado
    );

    contenedor.append(
        cabecera,
        caja
    );

    panel.appendChild(contenedor);

    function pintarIntentos(
        intentos = 0,
        maxIntentos = 3
    ) {
        const restantes =
            Math.max(
                0,
                maxIntentos - intentos
            );

        let detalle =
            'Al tercer intento fallido, el acceso se bloqueará durante 5 minutos.';

        if (intentos === 1) {
            detalle =
                'Te quedan 2 intentos antes del bloqueo.';
        }

        if (intentos === 2) {
            detalle =
                'Te queda 1 intento. El siguiente fallo bloqueará el acceso durante 5 minutos.';
        }

        intentosInfo.innerHTML = `
            <div class="tercero-intentos-linea">
                <span>Intentos</span>
                <strong>${intentos} / ${maxIntentos}</strong>
            </div>
            <div class="tercero-intentos-detalle">
                ${detalle}
            </div>
        `;

        if (restantes <= 1 && intentos > 0) {
            intentosInfo.classList.add(
                'tercero-intentos-alerta'
            );
        } else {
            intentosInfo.classList.remove(
                'tercero-intentos-alerta'
            );
        }
    }

    function limpiarEstadoVisual() {
        estado.textContent = '';
        estado.classList.remove(
            'error',
            'ok'
        );

        campoClave.classList.remove(
            'tercero-clave-error'
        );
    }

    function activarCarga() {
        limpiarEstadoVisual();

        turnstile.hidden = true;
        intentosInfo.hidden = true;
        loader.hidden = false;

        campoClave.disabled = true;
        botonVerClave.disabled = true;
        boton.disabled = true;

        boton.innerHTML =
            '<i class="fas fa-key" aria-hidden="true"></i> Verificando...';
    }

    function restaurarFormulario() {
        loader.hidden = true;
        turnstile.hidden = false;
        intentosInfo.hidden = false;

        campoClave.disabled = false;
        botonVerClave.disabled = false;
        boton.disabled = false;

        boton.innerHTML =
            '<i class="fas fa-key" aria-hidden="true"></i> Desbloquear';
    }

    function mostrarClaveIncorrecta(datos) {
        restaurarFormulario();

        const intentos =
            Number(datos?.intentos) || 0;

        const maxIntentos =
            Number(datos?.maxIntentos) || 3;

        pintarIntentos(
            intentos,
            maxIntentos
        );

        campoClave.classList.add(
            'tercero-clave-error'
        );

        estado.classList.remove('ok');
        estado.classList.add('error');

        estado.innerHTML = `
            <i class="fas fa-times-circle" aria-hidden="true"></i>
            <span>La clave de acceso no es correcta.</span>
        `;

        campoClave.select();
    }

    function montarSeguridad() {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const widgetId =
                    montarTurnstile(
                        turnstile,
                        {
                            onSuccess() {
                                limpiarEstadoVisual();
                            },

                            onExpired() {
                                restaurarFormulario();

                                estado.classList.add(
                                    'error'
                                );

                                estado.textContent =
                                    'La verificación ha caducado. Verifica nuevamente.';
                            },

                            onError() {
                                restaurarFormulario();

                                estado.classList.add(
                                    'error'
                                );

                                estado.textContent =
                                    'No se pudo completar la verificación de seguridad.';
                            }
                        }
                    );

                if (widgetId === null) {
                    restaurarFormulario();

                    estado.classList.add(
                        'error'
                    );

                    estado.textContent =
                        'No se pudo cargar la verificación de seguridad.';
                }
            });
        });
    }

    function formatearTiempo(segundos) {
        const total =
            Math.max(
                0,
                Math.ceil(segundos)
            );

        const minutos =
            Math.floor(total / 60);

        const resto =
            total % 60;

        return `${String(minutos).padStart(2, '0')}:${String(resto).padStart(2, '0')}`;
    }

    function detenerContadorBloqueo() {
        if (intervaloBloqueo !== null) {
            clearInterval(intervaloBloqueo);
            intervaloBloqueo = null;
        }
    }

    function mostrarBloqueo(datos) {
        detenerContadorBloqueo();
        suspenderTurnstile();

        const bloqueadoHasta =
            Number(datos?.bloqueadoHasta) ||
            (
                Date.now() +
                (
                    Number(
                        datos?.segundosRestantes
                    ) || 300
                ) * 1000
            );

        caja.classList.add(
            'tercero-bloqueado'
        );

        caja.replaceChildren();

        const lock =
            document.createElement('div');

        lock.className =
            'tercero-bloqueo-icono';

        lock.innerHTML =
            '<i class="fas fa-lock" aria-hidden="true"></i>';

        const lockTitle =
            document.createElement('h4');

        lockTitle.textContent =
            'Acceso bloqueado';

        const lockText =
            document.createElement('p');

        lockText.textContent =
            'Has alcanzado el límite de 3 intentos fallidos. Por seguridad, el acceso se ha bloqueado durante 5 minutos.';

        const etiqueta =
            document.createElement('span');

        etiqueta.className =
            'tercero-bloqueo-etiqueta';

        etiqueta.textContent =
            'Podrás volver a intentarlo en';

        const reloj =
            document.createElement('div');

        reloj.className =
            'tercero-bloqueo-reloj';

        const actualizar = () => {
            const restantes =
                Math.max(
                    0,
                    Math.ceil(
                        (
                            bloqueadoHasta -
                            Date.now()
                        ) / 1000
                    )
                );

            reloj.textContent =
                formatearTiempo(restantes);

            if (restantes <= 0) {
                detenerContadorBloqueo();

                // Consultamos al servidor antes de
                // volver a habilitar realmente.
                mostrarTercero({
                    panel,
                    limpiarPanel,
                    crearCabecera
                });
            }
        };

        caja.append(
            lock,
            lockTitle,
            lockText,
            etiqueta,
            reloj
        );

        actualizar();

        intervaloBloqueo =
            setInterval(
                actualizar,
                1000
            );
    }

    function mostrarAccesoConcedido(resultado) {
        tokenAccesoTercero =
            resultado.token ||
            resultado.accessToken ||
            resultado.access_token ||
            '';

        detenerContadorBloqueo();
        suspenderTurnstile();

        caja.classList.add(
            'tercero-acceso-concedido'
        );

        caja.replaceChildren();

        const successIcon =
            document.createElement('div');

        successIcon.className =
            'tercero-success-icon';

        successIcon.innerHTML =
            '<i class="fas fa-unlock-alt" aria-hidden="true"></i>';

        const successTitle =
            document.createElement('h4');

        successTitle.textContent =
            'Acceso habilitado';

        const successText =
            document.createElement('p');

        successText.textContent =
            'Ya puedes enviar mensajes a terceros.';

        const successBox =
            document.createElement('div');

        successBox.className =
            'tercero-success-box';

        successBox.innerHTML = `
            <i class="fas fa-check-circle" aria-hidden="true"></i>
            <div>
                <strong>Acceso concedido correctamente.</strong>
                <span>Válido temporalmente.</span>
            </div>
        `;

        const irFormulario =
            document.createElement('button');

        irFormulario.type = 'button';

        irFormulario.className =
            'contacto-tercero-desbloquear';

        irFormulario.innerHTML =
            '<i class="fas fa-paper-plane" aria-hidden="true"></i> Ir al formulario de envío';

        irFormulario.addEventListener('click', () => {

            caja.replaceChildren();

            const iconoEnvio = document.createElement('div');
            iconoEnvio.className = 'tercero-success-icon';
            iconoEnvio.innerHTML =
                '<i class="fas fa-paper-plane" aria-hidden="true"></i>';

            const tituloEnvio = document.createElement('h4');
            tituloEnvio.textContent = 'Enviar mensaje';

            const descripcionEnvio = document.createElement('p');
            descripcionEnvio.textContent =
                'Introduce el número internacional y escribe tu mensaje.';

            // ==========================================
            // TELÉFONO + PAÍS
            // ==========================================

            const labelNumero = document.createElement('label');
            labelNumero.className = 'contacto-v2-field-label';

            const textoNumero = document.createElement('span');
            textoNumero.textContent = 'Número de teléfono';

            const telefonoWrapper = document.createElement('div');
            telefonoWrapper.className = 'tercero-telefono-wrapper';


            // Países iniciales.
            // Luego podemos ampliar la lista sin tocar la lógica.
            const paises = [
                { codigo: 'ES', nombre: 'España', prefijo: '+34', bandera: '🇪🇸' },
                { codigo: 'PE', nombre: 'Perú', prefijo: '+51', bandera: '🇵🇪' },

                { codigo: 'US', nombre: 'Estados Unidos', prefijo: '+1', bandera: '🇺🇸' },
                { codigo: 'CA', nombre: 'Canadá', prefijo: '+1', bandera: '🇨🇦' },
                { codigo: 'DO', nombre: 'República Dominicana', prefijo: '+1', bandera: '🇩🇴' },

                { codigo: 'MX', nombre: 'México', prefijo: '+52', bandera: '🇲🇽' },
                { codigo: 'CO', nombre: 'Colombia', prefijo: '+57', bandera: '🇨🇴' },
                { codigo: 'VE', nombre: 'Venezuela', prefijo: '+58', bandera: '🇻🇪' },
                { codigo: 'AR', nombre: 'Argentina', prefijo: '+54', bandera: '🇦🇷' },
                { codigo: 'BR', nombre: 'Brasil', prefijo: '+55', bandera: '🇧🇷' },
                { codigo: 'CL', nombre: 'Chile', prefijo: '+56', bandera: '🇨🇱' },
                { codigo: 'PY', nombre: 'Paraguay', prefijo: '+595', bandera: '🇵🇾' },

                { codigo: 'IT', nombre: 'Italia', prefijo: '+39', bandera: '🇮🇹' },
                { codigo: 'FR', nombre: 'Francia', prefijo: '+33', bandera: '🇫🇷' },
                { codigo: 'DE', nombre: 'Alemania', prefijo: '+49', bandera: '🇩🇪' },
                { codigo: 'CH', nombre: 'Suiza', prefijo: '+41', bandera: '🇨🇭' },
                { codigo: 'SE', nombre: 'Suecia', prefijo: '+46', bandera: '🇸🇪' },
                { codigo: 'NL', nombre: 'Países Bajos', prefijo: '+31', bandera: '🇳🇱' },
                { codigo: 'UA', nombre: 'Ucrania', prefijo: '+380', bandera: '🇺🇦' },
                { codigo: 'FI', nombre: 'Finlandia', prefijo: '+358', bandera: '🇫🇮' },
                { codigo: 'EE', nombre: 'Estonia', prefijo: '+372', bandera: '🇪🇪' },
                { codigo: 'NO', nombre: 'Noruega', prefijo: '+47', bandera: '🇳🇴' }
            ];

            let paisSeleccionado = paises[0];


            // ==========================================
            // SELECTOR
            // ==========================================

            const selectorPais = document.createElement('button');
            selectorPais.type = 'button';
            selectorPais.className = 'tercero-selector-pais';

            selectorPais.innerHTML = `
    <img
        class="tercero-bandera-selector"
        src="https://flagcdn.com/${paisSeleccionado.codigo.toLowerCase()}.svg"
        alt=""
        aria-hidden="true"
    >
    <span class="tercero-prefijo">${paisSeleccionado.prefijo}</span>
    <i class="fas fa-chevron-down tercero-selector-flecha"
       aria-hidden="true"></i>
`;


            // ==========================================
            // MENÚ DE PAÍSES
            // ==========================================

            const menuPaises = document.createElement('div');
            menuPaises.className = 'tercero-menu-paises';
            menuPaises.hidden = true;

            const buscadorPais = document.createElement('input');
            buscadorPais.type = 'search';
            buscadorPais.className = 'tercero-buscador-pais';
            buscadorPais.placeholder = 'Buscar país...';
            buscadorPais.autocomplete = 'off';

            const listaPaises = document.createElement('div');
            listaPaises.className = 'tercero-lista-paises';

            menuPaises.append(
                buscadorPais,
                listaPaises
            );


            // ==========================================
            // NÚMERO
            // ==========================================

            const inputNumero = document.createElement('input');
            inputNumero.type = 'tel';
            inputNumero.className = 'contacto-v2-input tercero-numero-input';
            inputNumero.placeholder = 'Número de teléfono';
            inputNumero.autocomplete = 'tel-national';
            inputNumero.inputMode = 'numeric';


            // ==========================================
            // CREAR LISTA
            // ==========================================

            function pintarPaises(filtro = '') {

                listaPaises.replaceChildren();

                const textoFiltro =
                    filtro.trim().toLowerCase();

                const resultados = paises.filter(pais =>
                    pais.nombre.toLowerCase().includes(textoFiltro) ||
                    pais.prefijo.includes(textoFiltro)
                );

                resultados.forEach(pais => {

                    const opcion = document.createElement('button');

                    opcion.type = 'button';
                    opcion.className = 'tercero-pais-opcion';

                    opcion.innerHTML = `
    <img
        class="tercero-bandera"
        src="https://flagcdn.com/${pais.codigo.toLowerCase()}.svg"
        alt=""
        aria-hidden="true"
    >
    <span>${pais.nombre}</span>
    <span>${pais.prefijo}</span>
`;

                    opcion.addEventListener('click', () => {

                        paisSeleccionado = pais;

                        selectorPais.innerHTML = `
    <img
        class="tercero-bandera-selector"
        src="https://flagcdn.com/${pais.codigo.toLowerCase()}.svg"
        alt=""
        aria-hidden="true"
    >

    <span class="tercero-prefijo">
        ${pais.prefijo}
    </span>

    <i class="fas fa-chevron-down tercero-selector-flecha"
       aria-hidden="true"></i>
`;

                        menuPaises.hidden = true;

                        buscadorPais.value = '';

                        pintarPaises();

                        inputNumero.focus();
                    });

                    listaPaises.appendChild(opcion);
                });
            }

            pintarPaises();


            // ==========================================
            // EVENTOS SELECTOR
            // ==========================================

            selectorPais.addEventListener('click', () => {

                menuPaises.hidden = !menuPaises.hidden;

                if (!menuPaises.hidden) {
                    buscadorPais.focus();
                }
            });

            document.addEventListener('click', (event) => {

                if (!telefonoWrapper.contains(event.target)) {
                    menuPaises.hidden = true;
                    buscadorPais.value = '';
                    pintarPaises();
                }

            });


            buscadorPais.addEventListener('input', () => {
                pintarPaises(buscadorPais.value);
            });


            // Solo permitimos números, espacios y guiones visuales.
            inputNumero.addEventListener('input', () => {

                inputNumero.value =
                    inputNumero.value.replace(
                        /[^0-9\s-]/g,
                        ''
                    );
            });


            // ==========================================
            // CONSTRUCCIÓN
            // ==========================================

            telefonoWrapper.append(
                selectorPais,
                inputNumero,
                menuPaises
            );

            labelNumero.append(
                textoNumero,
                telefonoWrapper
            );

            // ==========================================
            // MENSAJE
            // ==========================================

            const labelMensaje = document.createElement('label');
            labelMensaje.className = 'contacto-v2-field-label';

            const textoMensaje = document.createElement('span');
            textoMensaje.textContent = 'Mensaje';

            const textareaMensaje = document.createElement('textarea');
            textareaMensaje.className = 'contacto-v2-textarea';
            textareaMensaje.placeholder = 'Escribe tu mensaje...';
            textareaMensaje.maxLength = 500;
            textareaMensaje.rows = 5;

            const contador = document.createElement('span');
            contador.className = 'tercero-mensaje-contador';

            contador.textContent = '0 / 500';

            textareaMensaje.addEventListener('input', () => {
                contador.textContent =
                    `${textareaMensaje.value.length} / 500`;
            });

            labelMensaje.append(
                textoMensaje,
                textareaMensaje,
                contador
            );

            // ==========================================
            // ESTADO
            // ==========================================

            const estadoEnvio = document.createElement('div');
            estadoEnvio.className = 'contacto-tercero-estado';
            estadoEnvio.setAttribute('aria-live', 'polite');

            // ==========================================
            // BOTÓN
            // ==========================================

            const botonEnviar = document.createElement('button');
            botonEnviar.type = 'button';
            botonEnviar.className =
                'contacto-tercero-desbloquear';

            botonEnviar.innerHTML =
                '<i class="fas fa-paper-plane" aria-hidden="true"></i> Enviar mensaje';



            // ==========================================
            // ENVIAR
            // ==========================================

            function mostrarAccesoCaducado() {

                tokenAccesoTercero = '';

                botonEnviar.disabled = true;

                estadoEnvio.classList.remove('ok');
                estadoEnvio.classList.add('error');

                estadoEnvio.replaceChildren();

                const mensajeCaducado = document.createElement('div');
                mensajeCaducado.className = 'tercero-acceso-caducado';

                mensajeCaducado.innerHTML = `
        <i class="fas fa-lock" aria-hidden="true"></i>
        <span>El acceso ha caducado.</span>
    `;

                const volverDesbloquear = document.createElement('button');

                volverDesbloquear.type = 'button';
                volverDesbloquear.className = 'tercero-volver-desbloquear';

                volverDesbloquear.innerHTML = `
        <i class="fas fa-key" aria-hidden="true"></i>
        Volver a desbloquear
    `;

                volverDesbloquear.addEventListener('click', () => {

                    mostrarTercero({
                        panel,
                        limpiarPanel,
                        crearCabecera
                    });

                });

                estadoEnvio.append(
                    mensajeCaducado,
                    volverDesbloquear
                );
            }

            botonEnviar.addEventListener('click', async () => {

                estadoEnvio.textContent = '';
                estadoEnvio.classList.remove('error', 'ok');

                const numeroNacional =
                    inputNumero.value.replace(/\D/g, '');

                const numero =
                    `${paisSeleccionado.prefijo}${numeroNacional}`;
                const mensaje =
                    textareaMensaje.value.trim();

                if (!numero) {
                    estadoEnvio.classList.add('error');
                    estadoEnvio.textContent =
                        'Introduce el número de teléfono.';
                    inputNumero.focus();
                    return;
                }

                if (!mensaje) {
                    estadoEnvio.classList.add('error');
                    estadoEnvio.textContent =
                        'Escribe el mensaje que deseas enviar.';
                    textareaMensaje.focus();
                    return;
                }

                if (!tokenAccesoTercero) {
                    mostrarAccesoCaducado();
                    return;
                }

                botonEnviar.disabled = true;

                botonEnviar.innerHTML =
                    '<i class="fas fa-circle-notch fa-spin" aria-hidden="true"></i> Enviando...';

                try {

                    await enviarMensajeTercero(
                        tokenAccesoTercero,
                        numero,
                        mensaje
                    );

                    estadoEnvio.classList.add('ok');

                    estadoEnvio.innerHTML =
                        '<i class="fas fa-check-circle" aria-hidden="true"></i> ' +
                        '<span>Mensaje enviado correctamente.</span>';

                    textareaMensaje.value = '';
                    contador.textContent = '0 / 500';

                    // Consumimos el acceso después de un envío correcto
                    tokenAccesoTercero = '';

                    botonEnviar.disabled = true;

                    botonEnviar.innerHTML =
                        '<i class="fas fa-check" aria-hidden="true"></i> Mensaje enviado';

                    const botonVolverDesbloquear = document.createElement('button');
                    botonVolverDesbloquear.type = 'button';
                    botonVolverDesbloquear.className =
                        'contacto-tercero-desbloquear';

                    botonVolverDesbloquear.innerHTML =
                        '<i class="fas fa-key" aria-hidden="true"></i> ' +
                        'Volver a desbloquear';

                    botonVolverDesbloquear.addEventListener('click', () => {

                        mostrarTercero({
                            panel,
                            limpiarPanel,
                            crearCabecera
                        });

                    });

                    estadoEnvio.insertAdjacentElement(
                        'afterend',
                        botonVolverDesbloquear
                    );



                } catch (error) {

                    console.error(
                        'Error al enviar mensaje a tercero:',
                        error
                    );

                    estadoEnvio.classList.add('error');

                    if (
                        error?.status === 401 ||
                        error?.status === 403
                    ) {
                        mostrarAccesoCaducado();

                    } else {

                        estadoEnvio.textContent =
                            error?.data?.error ||
                            error?.message ||
                            'No se pudo enviar el mensaje.';
                    }

                } finally {

                    // Solo restauramos el texto si el botón sigue habilitado.
                    if (!botonEnviar.disabled) {
                        botonEnviar.innerHTML =
                            '<i class="fas fa-paper-plane" aria-hidden="true"></i> Enviar mensaje';
                    }
                }

            });

            // ==========================================
            // CONSTRUIR
            // ==========================================

            caja.append(
                iconoEnvio,
                tituloEnvio,
                descripcionEnvio,
                labelNumero,
                labelMensaje,
                botonEnviar,
                estadoEnvio
            );

            inputNumero.focus();
        });
        caja.append(
            successIcon,
            successTitle,
            successText,
            successBox,
            irFormulario
        );
    }

    async function inicializar() {
        pintarIntentos(0, 3);

        try {
            const datos =
                await obtenerEstadoTercero();

            if (datos.bloqueado) {
                mostrarBloqueo(datos);
                return;
            }

            pintarIntentos(
                datos.intentos || 0,
                datos.maxIntentos || 3
            );

        } catch (error) {
            console.warn(
                'No se pudo consultar el estado de intentos:',
                error
            );
        }

        montarSeguridad();
    }

    boton.addEventListener(
        'click',
        async () => {
            limpiarEstadoVisual();

            const clave =
                campoClave.value.trim();

            const turnstileToken =
                obtenerTokenTurnstile();

            if (!clave) {
                estado.classList.add(
                    'error'
                );

                estado.textContent =
                    'Introduce la clave de acceso.';

                campoClave.focus();
                return;
            }

            if (!turnstileToken) {
                estado.classList.add(
                    'error'
                );

                estado.textContent =
                    'Completa primero la verificación de seguridad.';
                return;
            }

            // El OVNI aparece SIEMPRE que comienza
            // una comprobación de clave.
            activarCarga();

            try {
                const resultado =
                    await desbloquearTercero(
                        clave,
                        turnstileToken
                    );

                mostrarAccesoConcedido(
                    resultado
                );

            } catch (error) {
                console.error(
                    'Error al desbloquear comunicación a tercero:',
                    error
                );

                const datos =
                    error?.data || {};

                const mensajeServidor =
                    datos.error ||
                    error?.message ||
                    '';

                const texto =
                    mensajeServidor.toLowerCase();

                // 429 = bloqueo real del Worker.
                if (
                    error?.status === 429 ||
                    datos.bloqueado === true
                ) {
                    mostrarBloqueo(datos);
                    return;
                }

                // 401 = clave incorrecta.
                if (
                    error?.status === 401 ||
                    texto.includes(
                        'clave incorrecta'
                    )
                ) {
                    // El token usado ya no se reutiliza.
                    resetearTurnstile();

                    mostrarClaveIncorrecta(
                        datos
                    );

                    return;
                }

                // 403 = Turnstile inválido/consumido.
                if (
                    error?.status === 403 ||
                    texto.includes('turnstile') ||
                    texto.includes('verificación') ||
                    texto.includes('verification')
                ) {
                    resetearTurnstile();
                    restaurarFormulario();

                    estado.classList.add(
                        'error'
                    );

                    estado.textContent =
                        'La verificación de seguridad debe renovarse. Intenta nuevamente.';

                    return;
                }

                resetearTurnstile();
                restaurarFormulario();

                estado.classList.add(
                    'error'
                );

                estado.textContent =
                    'No se pudo verificar el acceso. Intenta nuevamente.';
            }
        }
    );

    campoClave.addEventListener(
        'keydown',
        event => {
            if (
                event.key === 'Enter' &&
                !boton.disabled
            ) {
                boton.click();
            }
        }
    );

    inicializar();
}

export function limpiarTercero() {
    detenerContadorBloqueo();
    suspenderTurnstile();
}

export function obtenerTokenAccesoTercero() {
    return tokenAccesoTercero;
}

function detenerContadorBloqueo() {
    if (intervaloBloqueo !== null) {
        clearInterval(intervaloBloqueo);
        intervaloBloqueo = null;
    }
}
