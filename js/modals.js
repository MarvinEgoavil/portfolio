export function inicializarTitulo() {
  const modal = document.getElementById('titulo-modal');
  if (!modal) return;

  const triggers = document.querySelectorAll('.titulo-modal-trigger');
  const closeBtn = document.getElementById('close-titulo-modal');
  const overlay = modal.querySelector('.cv-modal-overlay');
  const modalContent = modal.querySelector('.cv-modal-content');

  function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modal.focus();
  }
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Abrir modal por triggers
  triggers.forEach(trigger => {
    trigger.addEventListener('click', openModal);
    trigger.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openModal();
    });
  });

  // Cerrar modal por botón
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Cerrar modal haciendo clic fuera del contenido
  if (overlay) {
    overlay.addEventListener('click', closeModal);
  }
  // Seguridad: Si hacen clic fuera del modal-content y no es overlay
  modal.addEventListener('mousedown', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Cerrar con Escape
  document.addEventListener('keydown', e => {
    if (modal.classList.contains('active') && e.key === 'Escape') closeModal();
  });
}
// INICIALIZAR MODAL

export function inicializarCertModal() {
  const modal = document.getElementById('cert-modal');
  if (!modal) return;

  const triggers = document.querySelectorAll('.cert-modal-trigger');
  const closeBtn = document.getElementById('close-cert-modal');
  const overlay = modal.querySelector('.cv-modal-overlay');
  const modalImg = document.getElementById('cert-modal-img');

  function openModal(e) {
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
      if (e.key === 'Enter' || e.key === ' ') openModal.call(this, e);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', closeModal);

  modal.addEventListener('mousedown', function(e) {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (modal.classList.contains('active') && e.key === 'Escape') closeModal();
  });
}
