// backoffice.js

// Variáveis Globais (Corrigidas para refletir o uso da API e Paginação)
let users = [];
let tasks = [];
const USERS_PER_PAGE = 3; // Constante para controle da paginação
let currentPage = 1;


// DOM Elements
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navButtons = document.querySelectorAll('.nav-button');
const sections = document.querySelectorAll('.content-section');

// User Form Elements
const userForm = document.getElementById('userForm');
const usersListContainer = document.getElementById('usersList');
const paginationContainer = document.getElementById('pagination');
const usersListTitle = document.getElementById('usersListTitle');

// Task Form Elements
const formAddTasks = document.getElementById('formAddTasks');
const taskTitleInput = document.getElementById('taskTitle');
const taskDescriptionInput = document.getElementById('taskDescription');
const tasksList = document.getElementById('tasksList');
const completedTasksList = document.getElementById('completedTasksList');

// Modal Elements
const confirmModal = document.getElementById('confirmModal');
const cancelBtn = document.getElementById('cancelBtn');
const confirmBtn = document.getElementById('confirmBtn');
let pendingAction = null;

// Mobile Menu Toggle
mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
});

overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
});

// Navigation
navButtons.forEach(button => {

    button.addEventListener('click', () => {
        const section = button.dataset.section;

        // Update active button
        navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Update active section
        sections.forEach(sec => sec.classList.remove('active'));
        document.getElementById(`${section}Section`).classList.add('active');

        // Close mobile menu
        sidebar.classList.remove('open');
        overlay.classList.remove('active');

    });

});



/**
 * Busca usuários na API do Flask e atualiza a lista global.
 */
async function fetchUsers() {
    try {
        const response = await fetch("/users");
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();

        users = data.map(u => ({
            id: u.id,
            nome: u.nome,
            email: u.email,
            tipo: u.tipo || 'user'
        }));

        usersListTitle.innerHTML = `<h2 class="card-title">Usuários Cadastrados (${users.length})</h2>`;


        renderUsers();

    } catch (error) {
        usersListContainer.innerHTML = '<div class="empty-state">Erro ao carregar usuários.</div>';
        console.error("Erro ao buscar usuários:", error);
        showToast('error', 'Erro ao carregar lista de usuários!');
    }
}

async function fetchTasks() {
    try {
        const response = await fetch("/tasks");
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();

        tasks = data.map(t => ({
            'titulo': t.titulo,
            'descricao': t.descricao,
            'completa': t.completa
        }));

        usersListTitle.innerHTML = `<h2 class="card-title tasks">Tarefas Pendentes (${tasks.length})</h2>`;


        renderUsers();

    } catch (error) {
        usersListContainer.innerHTML = '<div class="empty-state">Erro ao carregar usuários.</div>';
        console.error("Erro ao buscar tasks:", error);
        showToast('error', 'Erro ao carregar tasks!');
    }
}


function renderUsers() {
    const usersList = document.getElementById("usersList");
    const pagination = document.getElementById("pagination");

    if (!users || users.length === 0) {
        usersList.innerHTML = '<div class="empty-state">Nenhum usuário cadastrado</div>';
        pagination.innerHTML = '';
        return;
    }

    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex = startIndex + USERS_PER_PAGE;
    const paginatedUsers = users.slice(startIndex, endIndex);

    usersList.innerHTML = paginatedUsers.map(user => `
    <div class="user-item">
        <div class="user-info">
            <div class="user-name">${user.nome}</div>
            <div class="user-email">${user.email}</div>
            <span class="user-role">${getRoleName(user.tipo)}</span>
        </div>
        <button class="btn btn-destructive" onclick="confirmRemoveUser(${user.id}, '${user.nome}')">Remover</button>
    </div>
  `).join('');


    // cria bolinhas de paginação
    const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const dot = document.createElement('div');
        dot.classList.add('pagination-dot');
        if (i === currentPage) dot.classList.add('active');

        dot.addEventListener('click', () => {
            currentPage = i;
            renderUsers();
        });

        pagination.appendChild(dot);
    }
}

function renderTasks() {
    const tasksList = document.getElementById("tasksList");
    const pagination = document.getElementById("paginationT");

    if (!tasks || tasks.length === 0) {
        tasksList.innerHTML = '<div class="empty-state">Nenhuma tarefa cadastrada</div>';
        pagination.innerHTML = '';
        return;
    }

    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex = startIndex + USERS_PER_PAGE;
    const paginatedUsers = tasks.slice(startIndex, endIndex);

    tasksList.innerHTML = paginatedUsers.map(t => `
    <div class="task-item">
        <div class="task-info">
            <div class="task-nome">${t.titulo}</div>
            <div class="task-descricao">${t.descricao}</div>
        </div>
        <button class="btn btn-destructive" onclick="confirmRemoveTask(${t.id})">
            Concluir
        </button>
    </div>
`).join('');


    // cria bolinhas de paginação
    const totalPages = Math.ceil(tasks.length / USERS_PER_PAGE);
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const dot = document.createElement('div');
        dot.classList.add('pagination-dot');
        if (i === currentPage) dot.classList.add('active');

        dot.addEventListener('click', () => {
            currentPage = i;
            renderTasks();
        });

        pagination.appendChild(dot);
    }
}




/**
 * Mapeia o tipo de usuário para um nome amigável.
 */
function getRoleName(tipo) {
    const roleNames = {
        'admin': 'Administrador',
        'editor': 'Editor',
        'user': 'Usuário Padrão'
    };
    return roleNames[tipo] || tipo;
}


async function removeUser(id) {
    try {
        const response = await fetch(`/deleteUser/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok && data.status === 'sucesso') {
            showToast('info', data.mensagem);
            setTimeout(() => {
                location.reload();
            }, 2000);


        } else {
            throw new Error(data.mensagem || 'Falha desconhecida ao remover usuário.');
        }

    } catch (error) {
        console.error('Erro na remoção:', error);
        showToast('error', error.message || 'Erro de conexão com a API.');
    }
}

async function removeTask(id) {
    try {
        const response = await fetch(`/deleteTask/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok && data.status === 'sucesso') {
            showToast('info', data.mensagem);
            setTimeout(() => {
                location.reload();
            }, 2000);


        } else {
            throw new Error(data.mensagem || 'Falha desconhecida ao remover a tarefa.');
        }

    } catch (error) {
        console.error('Erro na remoção:', error);
        showToast('error', error.message || 'Erro de conexão com a API.');
    }
}


/**
 * Mostra o modal de confirmação para remoção de usuário (usando SweetAlert2).
 * Esta função deve chamar removeUser(id) se confirmada.
 */
function confirmRemoveUser(id) {
    const user = users.find(u => u.id === id);

    Swal.fire({
        title: "Tem certeza?",
        text: `Você realmente deseja remover o usuário ${user.nome}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sim, remover!",
        cancelButtonText: "Cancelar"
    }).then(result => {
        if (result.isConfirmed) {
            removeUser(id);
        } else
            showToast("info", "Operação cancela !")
    });
}

function confirmRemoveTask(id) {
    const task = tasks.find(t => t.id === id);

    Swal.fire({
        title: "Tem certeza?",
        text: `Você realmente deseja remover a tarefa "${task.nome}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sim, remover!",
        cancelButtonText: "Cancelar"
    }).then(result => {
        if (result.isConfirmed) {
            removeTask(id);
        } else
            showToast("info", "Operação cancela !")
    });
}


/**
 * Busca usuários na API do Flask, armazena globalmente e inicia a renderização.
 * @param {string} searchTerm - O termo de busca opcional (nome).
 */
async function fetchAndRenderUsers(searchTerm = '') {
    currentPage = 1; // Sempre volta para a primeira página em uma nova busca

    let url = '/users';
    if (searchTerm) {
        // Usa a rota /searchUsers se você a implementou separadamente
        url = `/searchUsers?nome=${encodeURIComponent(searchTerm)}`;
    }
    // NOTA: Se você usou a rota única '/searchUsers' que lida com o parâmetro opcional,
    // a URL seria sempre: `/searchUsers?nome=${encodeURIComponent(searchTerm)}`

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const usersData = await response.json();

        // 1. Armazena a lista de usuários buscados
        users = usersData;

        // 2. Renderiza a lista e a paginação
        renderUsers();

    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        usersListContainer.innerHTML = '<p class="error-message">Não foi possível carregar os usuários.</p>';
        showToast('error', 'Erro ao carregar lista de usuários!');
    }
}


async function fetchAndRenderTasks(searchTerm = '') {
    currentPage = 1; // Sempre volta para a primeira página em uma nova busca

    let url = '/tasks';
    if (searchTerm) {
        // Usa a rota /searchUsers se você a implementou separadamente
        url = `/searchUsers?nome=${encodeURIComponent(searchTerm)}`;
    }
    // NOTA: Se você usou a rota única '/searchUsers' que lida com o parâmetro opcional,
    // a URL seria sempre: `/searchUsers?nome=${encodeURIComponent(searchTerm)}`

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const usersData = await response.json();

        // 1. Armazena a lista de usuários buscados
        users = usersData;

        // 2. Renderiza a lista e a paginação
        renderUsers();

    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        usersListContainer.innerHTML = '<p class="error-message">Não foi possível carregar os usuários.</p>';
        showToast('error', 'Erro ao carregar lista de usuários!');
    }
}


// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    });
})`;


// Inicializa o painel
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
    renderUsers();
    fetchTasks();
    renderTasks();
});

// Torna funções globais para serem usadas no onclick no HTML gerado
window.confirmRemoveUser = confirmRemoveUser;
window.confirmRemoveTask = confirmRemoveTask;










const formAddUser = document.getElementById("formAddUser");

formAddUser.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(formAddUser);

    fetch(formAddUser.action, {
        method: "POST",
        body: formData
    })
        .then(response => {
            return response.json().then(json => {
                return { ok: response.ok, json };
            });
        })
        .then(result => {
            const { ok, json } = result;

            if (ok) {

                if (typeof showToast === "function") {
                    showToast("success", "Usuário adicionado com sucesso!");
                }

                if (json.redirect) {
                    setTimeout(() => {
                        window.location.href = json.redirect;
                    }, 2000);
                }

                // limpar formulário
                formAddUser.reset();
            }

            else {

                if (typeof showToast === "function") {
                    showToast("error", "Erro ao adicionar usuário!");
                }
            }
        })
        .catch(err => {
            console.error("Erro:", err);
            showToast("error", err);
        });
});



formAddTasks.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(formAddTasks);

    fetch(formAddTasks.action, {
        method: "POST",
        body: formData
    })
        .then(response => {
            return response.json().then(json => {
                return { ok: response.ok, json };
            });
        })
        .then(result => {
            const { ok, json } = result;

            if (ok) {

                if (typeof showToast === "function") {
                    showToast("success", "Tarefa adicionada com sucesso");
                }

                if (json.redirect) {
                    setTimeout(() => {
                        window.location.href = json.redirect;
                    }, 2000);
                }

                // limpar formulário
                taskForm.reset();
            }

            else {

                if (typeof showToast === "function") {
                    showToast("error", "Erro ao adicionar Tarefa!");
                }
            }
        })
        .catch(err => {
            console.error("Erro:", err);
            showToast("error", err);
        });
});