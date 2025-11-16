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


const chavePixInput = document.getElementById('chavePixInput');
const mensagemCopia = document.getElementById('mensagemCopia');
const btnCopiarPix = document.getElementById('btnCopiarPix');

const copiarChavePix = () => {
  if (!chavePixInput) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(chavePixInput.value).then(() => {
      if (mensagemCopia) {
        mensagemCopia.textContent = 'Chave PIX copiada com sucesso!';
        showToast("success", "Chave PIX copiada com sucesso !")
      }
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



const urlInput = document.getElementById('urlInput'); // Opcional, se o valor de cópia for fixo
const btnCopiarUrl = document.getElementById('btnCopiarUrl');
// 1. Adicionado: Elemento para exibir o status da cópia
const mensagemStatus = document.getElementById('mensagemStatus'); 

const URL_TO_COPY = 'http://127.0.0.1:5000/';

const copiarUrl = () => {
    // Verificar se o elemento de feedback existe
    const displayStatus = (mensagem) => {
        if (mensagemStatus) {
            mensagemStatus.textContent = mensagem;
            setTimeout(() => {
                mensagemStatus.textContent = '';
            }, 3000);
        }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        // Método moderno (Recomendado)
        navigator.clipboard.writeText(URL_TO_COPY).then(() => {
            displayStatus('🔗 URL copiada com sucesso!');
            showToast("success", "Ajude a nossa causa !")
        }).catch(err => {
            console.error('Falha ao usar navigator.clipboard.writeText', err);
            fallbackCopy();
        });
    } else {
        // Fallback antigo
        fallbackCopy();
    }

    // Função de Fallback (usa o 'urlInput' temporariamente)
    function fallbackCopy() {
        if (!urlInput) {
            displayStatus('Erro: Não foi possível copiar (Fallback indisponível).');
            return;
        }
        
        // CUIDADO: Este método exige que 'urlInput' seja um <textarea> ou <input>
        const originalValue = urlInput.value;
        urlInput.value = URL_TO_COPY; // Insere o valor fixo para a cópia
        
        try {
            urlInput.select();
            document.execCommand('copy');
            showToast("sucess", "Ajude a nossa causa !")
        } catch (err) {
            console.error('Não foi possível copiar a URL', err);
            displayStatus('Erro ao copiar URL');
        } finally {
            urlInput.value = originalValue;
        }
    }
};

if (btnCopiarUrl) {
    btnCopiarUrl.addEventListener('click', copiarUrl);
} else {
    console.warn('btnCopiarUrl não encontrado (id="btnCopiarUrl")');
}


// Encontra o formulário de login pelo ID
const formLogin = document.getElementById('formLogin');

formLogin.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(formLogin);

    fetch(formLogin.action, {
        method: 'POST',
        body: formData 
    })
    .then(response => {
        return response.json().then(data => {
            if (!response.ok) throw new Error(data.mensagem);
            return data;
        });
    })
    .then(data => {
        if (data.status === 'sucesso' && data.redirect) {
            window.location.href = data.redirect;
        }
    })
    .catch(error => {
        console.error('Login Failed:', error.message);

        if (typeof showToast === 'function') {
            showToast("error", error.message);
        }

        document.getElementById('senhaLogin').value = '';
    });
});