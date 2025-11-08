document.addEventListener('DOMContentLoaded', () => {
  // Abre modal pelo atributo data-abrir-modal
  document.querySelectorAll('[data-abrir-modal]').forEach(botao => {
    botao.addEventListener('click', () => {
      const nomeModal = botao.getAttribute('data-abrir-modal');
      const modal = document.querySelector(`[data-modal="${nomeModal}"]`);
      if (modal) modal.style.display = 'flex';
      else console.warn(`Modal "${nomeModal}" não encontrada`);
    });
  });

  // Fecha modal pelo atributo data-fechar-modal
  document.querySelectorAll('[data-fechar-modal]').forEach(botao => {
    botao.addEventListener('click', () => {
      const nomeModal = botao.getAttribute('data-fechar-modal');
      const modal = document.querySelector(`[data-modal="${nomeModal}"]`);
      if (modal) modal.style.display = 'none';
    });
  });

  // Clique no overlay (fora do conteúdo)
  document.querySelectorAll('[data-modal]').forEach(modal => {
    modal.addEventListener('click', event => {
      if (event.target === event.currentTarget) {
        modal.style.display = 'none';
      }
    });
  });

  // Fecha com ESC
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      document.querySelectorAll('[data-modal]').forEach(modal => {
        if (modal.style.display === 'flex') modal.style.display = 'none';
      });
    }
  });
});