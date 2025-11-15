// backoffice.js

// Variáveis Globais (Corrigidas para refletir o uso da API e Paginação)
let users = [];
let tasks = [];
const USERS_PER_PAGE = 3; // Constante para controle da paginação
let currentPage = 1;

// Próximo ID para tarefas locais
let nextTaskId = 1;


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
const taskForm = document.getElementById('taskForm');
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



// Função auxiliar para exibir Toast (substitui showNotification)
function showToast(icon, title) {
    Swal.fire({
        icon: icon,
        title: title,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
    });
}


// --- 1. Lógica de Usuários (API e Paginação) ---

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
        // Altera a rota de chamada para a sua rota Flask /deleteUser/<id>
        const response = await fetch(`/deleteUser/${id}`, {
            method: 'DELETE'
        });

        // Tenta ler a resposta JSON (status ou erro)
        const data = await response.json();

        if (response.ok && data.status === 'sucesso') {
            // Sucesso na remoção
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


// --- 2. Lógica de Tarefas (Local) ---

/**
 * Adiciona uma nova tarefa à lista local.
 */
function addTask(title, description) {
    const newTask = {
        id: nextTaskId++,
        title: title,
        description: description,
        completed: false
    };
    tasks.push(newTask);
    renderTasks();
    showToast('success', 'Tarefa adicionada!');
}

/**
 * Marca uma tarefa como concluída.
 */
function completeTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = true;
        renderTasks();
        showToast('success', 'Tarefa concluída!');
    }
}

/**
 * Remove uma tarefa da lista local.
 */
function removeTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    renderTasks();
    showToast('info', 'Tarefa removida.');
}

/**
 * Mostra o modal de confirmação para remoção de tarefa (Local).
 */
function confirmRemoveTask(id) {
    Swal.fire({
        title: "Tem certeza?",
        text: "Você removerá esta tarefa permanentemente.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sim, remover!",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            removeTask(id);
        }
    });
}

/**
 * Renderiza as listas de tarefas (pendentes e concluídas).
 */
function renderTasks() {
    const pendingTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);

    // Renderiza pendentes
    if (pendingTasks.length === 0) {
        tasksList.innerHTML = '<div class="empty-state">Nenhuma tarefa pendente</div>';
    } else {
        tasksList.innerHTML = pendingTasks.map(task => `
             <div class="task-item">
                <div class="task-header">
                    <div class="task-info" style="flex: 1;">
                        <div class="task-title">${task.title}</div>
                        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn btn-success" onclick="completeTask(${task.id})">Concluir</button>
                    <button class="btn btn-destructive" onclick="confirmRemoveTask(${task.id})">Remover</button>
                </div>
            </div>
        `).join('');
    }

    // Renderiza concluídas
    if (completedTasks.length === 0) {
        completedTasksList.innerHTML = '<div class="empty-state">Nenhuma tarefa concluída</div>';
    } else {
        completedTasksList.innerHTML = completedTasks.map(task => `
             <div class="task-item completed">
                <div class="task-header">
                    <div class="task-info" style="flex: 1;">
                        <div class="task-title">${task.title}</div>
                        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn btn-destructive" onclick="confirmRemoveTask(${task.id})">Remover</button>
                </div>
            </div>
        `).join('');
    }
}


// Task Form Handler (Para tarefas locais)
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();

    if (title) {
        addTask(title, description);
        taskForm.reset();
    } else {
        showToast('warning', 'O título da tarefa é obrigatório.');
    }
});

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
});`


// Inicializa o painel
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
    renderTasks();
});

// Torna funções globais para serem usadas no onclick no HTML gerado
window.confirmRemoveUser = confirmRemoveUser;
window.confirmRemoveTask = confirmRemoveTask;
window.completeTask = completeTask;





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

