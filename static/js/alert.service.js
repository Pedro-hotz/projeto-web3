// alertas.js

document.addEventListener('DOMContentLoaded', () => {
    // Verifica se a variável global foi definida pelo bloco Jinja no HTML
    if (window.flashMessage) {
        const { icon, title } = window.flashMessage;

        // Usa o SweetAlert2 para exibir a mensagem como um Toast
        // Como o backoffice.js já definiu a função showToast, 
        // e ele é carregado primeiro, podemos usá-la aqui.
        if (typeof showToast === 'function') {
             showToast(icon, title);
        } else {
            // Fallback caso showToast não esteja definida
            Swal.fire({
                icon: icon,
                title: title,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
        
        // Limpa a variável para garantir que o toast não apareça novamente em F5
        delete window.flashMessage;
    }
});