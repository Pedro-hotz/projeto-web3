let users = [];
let tasks = [];
let tasksCom = [];
const USERS_PER_PAGE = 3;
let currentPage = 1;

const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navButtons = document.querySelectorAll('.nav-button');
const sections = document.querySelectorAll('.content-section');

const userForm = document.getElementById('userForm');

const usersListContainer = document.getElementById('usersList');
const paginationContainer = document.getElementById('pagination');

const usersListTitle = document.getElementById('usersListTitle');

const formAddTasks = document.getElementById('formAddTasks');

const taskDescriptionInput = document.getElementById('taskDescription');
const tasksList = document.getElementById('tasksList');
const tasksListTitle = document.getElementById('tasksListTitle');

const completedTasksList = document.getElementById('completedTasksList');
const tasksListTitleCom = document.getElementById('tasksListTitleCom');

const confirmModal = document.getElementById('confirmModal')

const cancelBtn = document.getElementById('cancelBtn');
const confirmBtn = document.getElementById('confirmBtn');

let pendingAction = null;

mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
});

overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
});

navButtons.forEach(button => {
    button.addEventListener('click', () => {

        const section = button.dataset.section;
        
        navButtons.forEach(btn => btn.classList.remove('active'));

        button.classList.add('active');

        sections.forEach(sec => sec.classList.remove('active'));

        document.getElementById(`${section}Section`).classList.add('active');

        sidebar.classList.remove('open');

        overlay.classList.remove('active');

    });
});





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
            'id': t.id,
            'titulo': t.titulo,
            'descricao': t.descricao,
            'completa': t.completa
        }));

        tasksListTitle.innerHTML = `<h2 class="card-title">Tarefas pendentes (${tasks.length})</h2>`;


        renderTasks();

    } catch (error) {
        tasksList.innerHTML = '<div class="empty-state">Erro ao carregar as tarefas.</div>';
        console.error("Erro ao buscar tasks:", error);
        showToast('error', 'Erro ao carregar tasks!');
    }
}

async function fetchTasksCom() {
    try {
        const response = await fetch("/tasks/c");
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();

        tasksCom = data.map(t => ({
            'id': t.id,
            'titulo': t.titulo,
            'descricao': t.descricao,
            'completa': t.completa
        }));

        tasksListTitleCom.innerHTML = `<h2 class="card-title">Tarefas concluída (${tasksCom.length})</h2>`;


        renderTasksCom();

    } catch (error) {
        tasksListTitleCom.innerHTML = '<div class="empty-state">Erro ao carregar as tarefas.</div>';
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
        <div style="display: flex; gap: 10px;">
        <button class="btn btn-destructive" onclick="confirmRemoveUser(${user.id})">Remover</button>
        <button style="background-color: gray;" class="btn btn-destructive" onclick="confirmEditUser(${user.id})">Editar</button>
        </div>
    </div>
  `).join('');


    // paginação
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



    const startIndex1 = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex1 = startIndex1 + USERS_PER_PAGE;
    const paginatedUsers1 = tasks.slice(startIndex1, endIndex1);

    tasksList.innerHTML = paginatedUsers1.map(t => `

    <div class="user-item">
        <div class="user-info" style="display: flex;
                               justify-content: space-between;
                               align-items: center;
                               ">
        <div>
            <div class="user-name">${t.titulo}</div>
            <div class="user-email">${t.descricao}</div>
            </div>
            <button class="btn btn-destructive tasks" onclick="concluirTask(${t.id})">
            Concluir
            </button>
        </div>
    </div>
`).join('');




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

function renderTasksCom() {
    const pagination = document.getElementById("paginationT2");

    if (!tasksCom || tasksCom.length === 0) {
        completedTasksList.innerHTML = '<div class="empty-state">Nenhuma tarefa cadastrada</div>';
        pagination.innerHTML = '';
        return;
    }

    const startIndex2 = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex2 = startIndex2 + USERS_PER_PAGE;
    const paginatedUsers2 = tasksCom.slice(startIndex2, endIndex2);

    completedTasksList.innerHTML = paginatedUsers2.map(t => `

    <div class="user-item">
        <div class="user-info" style="display: flex;
                               justify-content: space-between;
                               align-items: center;
                               ">
            <div>
                <div class="user-name">${t.titulo}</div>
                <div class="user-email">${t.descricao}</div>
             </div>
            <button class="btn btn-destructive" onclick="confirmRemoveTask(${t.id})">
            Excluir
            </button>
        </div>
    </div>
`).join('');


    const totalPages = Math.ceil(tasksCom.length / USERS_PER_PAGE);
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const dot = document.createElement('div');
        dot.classList.add('pagination-dot');
        if (i === currentPage) dot.classList.add('active');

        dot.addEventListener('click', () => {
            currentPage = i;
            renderTasksCom();
        });

        pagination.appendChild(dot);
    }
}


async function UpdateUser(id, novoEmail = null, novaSenha = null) {
     try {
        const response = await fetch("/usuario/atualizar", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: id,
                email: novoEmail || null,
                senha: novaSenha || null
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showToast("error", data.mensagem || "Erro ao atualizar.");
            return;
        }

        showToast("success", data.mensagem);

        if (typeof fetchUsers === "function") {
            fetchUsers();
        }

    } catch (err) {
        console.error("Erro ao atualizar usuário:", err);
        showToast("error", "Erro interno ao atualizar usuário.");
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
    const task = tasksCom.find(t => t.id === id);

    console.log(task)

    Swal.fire({
        title: "Tem certeza?",
        text: ` Já concluiram a tarefa "${task.titulo}"?`,
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

function confirmEditUser(id) {
    const user = users.find(u => u.id === id);

    console.log(user)

    Swal.fire({
        title: "Tem certeza?",
        text: `Você realmente deseja editar o usuário ${user.nome}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "rgb(0, 128, 0)",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sim, Editar!",
        cancelButtonText: "Cancelar"
    }).then(result => {
        if (result.isConfirmed) {
            editUser(id);
        } else
            showToast("info", "Operação cancela !")
    });
}

function editUser(id) {
    const user = users.find(u => u.id === id);

    Swal.fire({
        title: `Editar usuário`,
        html: `
            <p><strong>${user.nome}</strong></p>

            <input id="newEmail" class="swal2-input" placeholder="Novo e-mail (opcional)" value="${user.email}">
            <input id="newSenha" type="password" class="swal2-input" placeholder="Nova senha (opcional)">
        `,
        showCancelButton: true,
        confirmButtonText: "Salvar",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
            const email = document.getElementById("newEmail").value.trim();
            const senha = document.getElementById("newSenha").value.trim();

            if (!email && !senha) {
                Swal.showValidationMessage("Digite pelo menos um campo para atualizar.");
                return false;
            }

            return { email, senha };
        }
    }).then(result => {
        if (result.isConfirmed) {
            UpdateUser(id, result.value.email, result.value.senha);
        }
    });
}

async function concluirTask(id) {
    const response = await fetch(`/tasks/converte/${id}`, {
        method: 'PUT'
    });

    const data = await response.json();

    if (data.status === 'sucesso') {
        showToast("success", "Tarefa atualizada!");
        setTimeout(() => {
            location.reload();
        }, 2000);
    } else {
        showToast("error", data.mensagem);
    }
}


/**
 * Busca usuários na API do Flask, armazena globalmente e inicia a renderização.
 * @param {string} searchTerm - O termo de busca opcional (nome).
 */
async function fetchAndRenderUsers(searchTerm = '') {
    currentPage = 1;

    let url = '/users';
    if (searchTerm) {
        url = `/searchUsers?nome=${encodeURIComponent(searchTerm)}`;
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const usersData = await response.json();

        users = usersData;

        // refresh
        renderUsers();

    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        usersListContainer.innerHTML = '<p class="error-message">Não foi possível carregar os usuários.</p>';
        showToast('error', 'Erro ao carregar lista de usuários!');
    }
}


// animação
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
    fetchTasksCom();
    renderTasksCom();
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

                formAddUser.reset(); // limpar formulário
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
                    setTimeout(() => {
                        location.reload();
                    }, 2000);
                }
                formAddTasks.reset();
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