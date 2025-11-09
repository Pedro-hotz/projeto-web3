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

const btnCopiarPix = document.getElementById('btnCopiarPix');
const chavePixInput = document.getElementById('chavePixInput');
const mensagemCopia = document.getElementById('mensagemCopia');

const copiarChavePix = () => {
  if (!chavePixInput) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(chavePixInput.value).then(() => {
      if (mensagemCopia) mensagemCopia.textContent = 'Chave PIX copiada com sucesso!';
      setTimeout(() => {
        if (mensagemCopia) mensagemCopia.textContent = '';
      }, 3000);
    }).catch(err => {
      fallbackCopy();
    });
  } else { // fallback antigo
    fallbackCopy();
  }
  function fallbackCopy() {
    try {
      chavePixInput.select();
      document.execCommand('copy'); 5
      if (mensagemCopia) mensagemCopia.textContent = 'Chave PIX copiada (Fallback)!';
      setTimeout(() => {
        if (mensagemCopia) mensagemCopia.textContent = '';
      }, 3000);
    } catch (err) {
      console.error('Não foi possível copiar a chave PIX', err);
      if (mensagemCopia) mensagemCopia.textContent = 'Erro ao copiar chave PIX';
    }
  }
};

if (btnCopiarPix)
  btnCopiarPix.addEventListener('click', copiarChavePix);
else
  console.warn('btnCopiarPix não encontrado (id="btnCopiarPix")');

