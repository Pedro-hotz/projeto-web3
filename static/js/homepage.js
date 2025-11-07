document.addEventListener('DOMContentLoaded', () => {
  // Seleção segura de elementos (pode retornar null)
  const modalPix = document.getElementById('modalPix');
  const abrirModalBtn = document.getElementById('abrirModalPix');
  const fecharModalBtn = document.getElementById('fecharModalPix');
  const btnCopiarPix = document.getElementById('btnCopiarPix');
  const chavePixInput = document.getElementById('chavePixInput');
  const mensagemCopia = document.getElementById('mensagemCopia');

  const modalLogin = document.getElementById('modalLogin');
  const abrirModalLoginBtn = document.getElementById('abrirModalLogin');
  const fecharModalLoginBtn = document.getElementById('fecharModalLogin');
  const formLogin = document.getElementById('formLogin'); // se não existir, tudo bem
  const mensagemLogin = document.getElementById('mensagemLogin'); // se não existir, não quebramos

  // Funções
  const abrirModalPix = () => {
    if (modalPix) modalPix.style.display = 'flex';
  };

  const fecharModalPix = () => {
    if (modalPix) modalPix.style.display = 'none';
    if (mensagemCopia) mensagemCopia.textContent = '';
  };

  const abrirModalLogin = () => {
    if (modalLogin) modalLogin.style.display = 'flex';
  };

  const fecharModalLogin = () => {
    if (modalLogin) modalLogin.style.display = 'none';
    if (mensagemLogin) mensagemLogin.textContent = '';
  };

  const enviarLogin = (event) => {
    event.preventDefault();
    // Use os IDs reais do seu HTML; aqui assumo id="email" e id="tel"
    const emailEl = document.getElementById('email');
    const senhaEl = document.getElementById('tel');
    const email = emailEl ? emailEl.value : '';
    const senha = senhaEl ? senhaEl.value : '';

    if (mensagemLogin) {
      if (email === 'teste@exemplo.com' && senha === '1234') {
        mensagemLogin.textContent = 'Login realizado com sucesso!';
        mensagemLogin.style.color = 'green';
        setTimeout(fecharModalLogin, 1500);
      } else {
        mensagemLogin.textContent = 'Email ou senha incorretos!';
        mensagemLogin.style.color = 'red';
      }
    } else {
      // fallback se não houver elemento de mensagem
      if (email === 'teste@exemplo.com' && senha === '1234') {
        fecharModalLogin();
      }
    }
  };

  const copiarChavePix = () => {
    if (!chavePixInput) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(chavePixInput.value)
        .then(() => {
          if (mensagemCopia) mensagemCopia.textContent = 'Chave PIX copiada com sucesso!';
          setTimeout(() => { if (mensagemCopia) mensagemCopia.textContent = ''; }, 3000);
        })
        .catch(err => {
          fallbackCopy();
        });
    } else {
      // fallback antigo
      fallbackCopy();
    }

    function fallbackCopy() {
      try {
        chavePixInput.select();
        document.execCommand('copy');
        if (mensagemCopia) mensagemCopia.textContent = 'Chave PIX copiada (Fallback)!';
        setTimeout(() => { if (mensagemCopia) mensagemCopia.textContent = ''; }, 3000);
      } catch (err) {
        console.error('Não foi possível copiar a chave PIX', err);
        if (mensagemCopia) mensagemCopia.textContent = 'Erro ao copiar chave PIX';
      }
    }
  };

  // Adiciona listeners apenas se os elementos existirem
  if (abrirModalBtn) abrirModalBtn.addEventListener('click', abrirModalPix);
  else console.warn('abrirModalPix button não encontrado (id="abrirModalPix")');

  if (fecharModalBtn) fecharModalBtn.addEventListener('click', fecharModalPix);
  else console.warn('fecharModalPix button não encontrado (id="fecharModalPix")');

  if (btnCopiarPix) btnCopiarPix.addEventListener('click', copiarChavePix);
  else console.warn('btnCopiarPix não encontrado (id="btnCopiarPix")');

  if (abrirModalLoginBtn) abrirModalLoginBtn.addEventListener('click', abrirModalLogin);
  else console.warn('abrirModalLoginBtn não encontrado (id="abrirModalLogin")');

  if (fecharModalLoginBtn) fecharModalLoginBtn.addEventListener('click', fecharModalLogin);
  else console.warn('fecharModalLoginBtn não encontrado (id="fecharModalLogin")');

  // Submissão do formulário de login (se existir)
  if (formLogin) formLogin.addEventListener('submit', enviarLogin);

  // Clique no overlay: fecha somente se clicar diretamente no overlay (não no conteúdo)
  if (modalPix) {
    modalPix.addEventListener('click', (event) => {
      if (event.target === event.currentTarget) fecharModalPix();
    });
  }

  if (modalLogin) {
    modalLogin.addEventListener('click', (event) => {
      if (event.target === event.currentTarget) fecharModalLogin();
    });
  }

  // Tecla ESC para fechar (verifica antes se modais existem)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (modalPix && modalPix.style.display === 'flex') fecharModalPix();
      if (modalLogin && modalLogin.style.display === 'flex') fecharModalLogin();
    }
  });
});