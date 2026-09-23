export function inicializarTitulo() {
  const modal = document.getElementById('titulo-modal');
  if (!modal) return;

  const triggers = document.querySelectorAll('.titulo-modal-trigger');
  const closeBtn = document.getElementById('close-titulo-modal');
  const overlay = modal.querySelector('.cv-modal-overlay');
  const modalImg = modal.querySelector('.cv-modal-img');
  const passwordInput = document.getElementById('titulo-password');
  const unlockBtn = document.getElementById('titulo-unlock-btn');
  const lockPanel = document.getElementById('titulo-lock-panel');
  const errorMsg = document.getElementById('titulo-password-error');

  const FIREBASE_URL =
    'https://us-central1-portofolio-marvin.cloudfunctions.net/obtenerTitulo';

  let tituloObjectUrl = null;

  function bloquearTitulo() {
    if (modalImg) {
      modalImg.classList.add('titulo-bloqueado');

      // Eliminamos la imagen protegida del navegador
      if (tituloObjectUrl) {
        URL.revokeObjectURL(tituloObjectUrl);
        tituloObjectUrl = null;
      }

      modalImg.removeAttribute('src');
    }

    if (lockPanel) {
      lockPanel.hidden = false;
    }

    if (passwordInput) {
      passwordInput.value = '';
      passwordInput.type = 'password';
      passwordInput.disabled = false;
    }

    if (unlockBtn) {
      unlockBtn.disabled = false;
    }

    if (errorMsg) {
      errorMsg.textContent = '';
      errorMsg.classList.remove('error-activo');
    }
  }

  async function desbloquearTitulo() {
    if (!passwordInput) return;

    const password = passwordInput.value;

    if (!password) {
      mostrarError('Introduce la clave.');
      passwordInput.focus();
      return;
    }

    try {
      passwordInput.disabled = true;

      if (unlockBtn) {
        unlockBtn.disabled = true;
      }

      if (errorMsg) {
        errorMsg.textContent = 'Comprobando clave...';
        errorMsg.classList.remove('error-activo');
      }

      const response = await fetch(FIREBASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: password
        })
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('PASSWORD');
        }

        throw new Error('SERVER');
      }

      const blob = await response.blob();

      tituloObjectUrl = URL.createObjectURL(blob);

      if (modalImg) {
        modalImg.src = tituloObjectUrl;
        modalImg.classList.remove('titulo-bloqueado');
      }

      if (lockPanel) {
        lockPanel.hidden = true;
      }

      passwordInput.value = '';

      if (errorMsg) {
        errorMsg.textContent = '';
        errorMsg.classList.remove('error-activo');
      }

    } catch (error) {

      if (error.message === 'PASSWORD') {
        mostrarError('Clave incorrecta.');
      } else {
        mostrarError('No se pudo cargar el título. Inténtalo de nuevo.');
        console.error(error);
      }

      passwordInput.value = '';
      passwordInput.focus();

    } finally {

      passwordInput.disabled = false;

      if (unlockBtn) {
        unlockBtn.disabled = false;
      }
    }
  }

  function mostrarError(mensaje) {
    if (!errorMsg) return;

    errorMsg.textContent = mensaje;
    errorMsg.classList.remove('error-activo');

    void errorMsg.offsetWidth;

    errorMsg.classList.add('error-activo');
  }

  function openModal() {
    bloquearTitulo();

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modal.focus();

    setTimeout(() => {
      if (passwordInput) {
        passwordInput.focus();
      }
    }, 150);
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';

    bloquearTitulo();
  }

  triggers.forEach(trigger => {

    trigger.addEventListener('click', openModal);

    trigger.addEventListener('keydown', e => {

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal();
      }

    });

  });

  if (unlockBtn) {
    unlockBtn.addEventListener('click', desbloquearTitulo);
  }

  if (passwordInput) {

    passwordInput.addEventListener('keydown', e => {

      if (e.key === 'Enter') {
        e.preventDefault();
        desbloquearTitulo();
      }

    });

  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (overlay) {
    overlay.addEventListener('click', closeModal);
  }

  modal.addEventListener('mousedown', e => {

    if (e.target === modal) {
      closeModal();
    }

  });

  document.addEventListener('keydown', e => {

    if (
      modal.classList.contains('active') &&
      e.key === 'Escape'
    ) {
      closeModal();
    }

  });

  bloquearTitulo();
}

// INICIALIZAR MODAL DE CERTIFICACIONES
export function inicializarCertModal() {
  const modal = document.getElementById('cert-modal');
  if (!modal) return;

  const triggers = document.querySelectorAll('.cert-modal-trigger');
  const closeBtn = document.getElementById('close-cert-modal');
  const overlay = modal.querySelector('.cv-modal-overlay');
  const modalImg = document.getElementById('cert-modal-img');

  function openModal() {
    const imgSrc = this.dataset.img || this.src;
    const imgAlt = this.dataset.alt || this.alt || '';

    modalImg.src = imgSrc;
    modalImg.alt = imgAlt;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modal.focus();
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';

    setTimeout(() => {
      modalImg.src = '';
      modalImg.alt = '';
    }, 200);
  }

  triggers.forEach(trigger => {
    trigger.addEventListener('click', openModal);

    trigger.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal.call(this);
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', closeModal);

  modal.addEventListener('mousedown', e => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (modal.classList.contains('active') && e.key === 'Escape') {
      closeModal();
    }
  });
}