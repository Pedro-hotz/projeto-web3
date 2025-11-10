// Data Storage
let users = [
    { id: 1, name: "João Silva", email: "joao@example.com", role: "admin" },
    { id: 2, name: "Maria Santos", email: "maria@example.com", role: "user" },
    { id: 3, name: "Pedro Costa", email: "pedro@example.com", role: "editor" }
];

let tasks = [
    { id: 1, title: "Revisar documentação", description: "Verificar e atualizar a documentação do sistema", completed: false },
    { id: 2, title: "Implementar nova feature", description: "Adicionar sistema de notificações", completed: false },
    { id: 3, title: "Corrigir bugs", description: "Resolver problemas reportados pelos usuários", completed: true }
];

let nextUserId = 4;
let nextTaskId = 4;

// DOM Elements
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navButtons = document.querySelectorAll('.nav-button');
const sections = document.querySelectorAll('.content-section');

// User Form Elements
const userForm = document.getElementById('userForm');
const userNameInput = document.getElementById('userName');
const userEmailInput = document.getElementById('userEmail');
const userRoleSelect = document.getElementById('userRole');
const usersList = document.getElementById('usersList');

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

// User Management Functions
function renderUsers() {
    if (users.length === 0) {
        usersList.innerHTML = '<div class="empty-state">Nenhum usuário cadastrado</div>';
        return;
    }

    usersList.innerHTML = users.map(user => `
        <div class="user-item">
            <div class="user-info">
                <div class="user-name">${user.name}</div>
                <div class="user-email">${user.email}</div>
                <span class="user-role">${getRoleName(user.role)}</span>
            </div>
            <button class="btn btn-destructive" onclick="removeUser(${user.id})">Remover</button>
        </div>
    `).join('');
}

function getRoleName(role) {
    const roleNames = {
        'admin': 'Administrador',
        'user': 'Usuário',
        'editor': 'Editor'
    };
    return roleNames[role] || role;
}

function addUser(name, email, role) {
    const newUser = {
        id: nextUserId++,
        name,
        email,
        role
    };
    users.push(newUser);
    renderUsers();
}

function removeUser(id) {
    users = users.filter(user => user.id !== id);
    renderUsers();
}

// Modal Handlers
cancelBtn.addEventListener('click', () => {
    confirmModal.classList.remove('active');
    pendingAction = null;
});

confirmBtn.addEventListener('click', () => {
    if (pendingAction) {
        pendingAction();
        pendingAction = null;
    }
    confirmModal.classList.remove('active');
});

confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
        confirmModal.classList.remove('active');
        pendingAction = null;
    }
});

// User Form Handler
userForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = userNameInput.value.trim();
    const email = userEmailInput.value.trim();
    const role = userRoleSelect.value;
    
    if (name && email) {
        addUser(name, email, role);
        userForm.reset();
        showNotification('Usuário adicionado com sucesso!');
    }
});

// Task Management Functions
function renderTasks() {
    const pendingTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);

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

function addTask(title, description) {
    const newTask = {
        id: nextTaskId++,
        title,
        description,
        completed: false
    };
    tasks.push(newTask);
    renderTasks();
}

function confirmRemoveTask(id) {
    pendingAction = () => {
        tasks = tasks.filter(task => task.id !== id);
        renderTasks();
        showNotification('Tarefa removida com sucesso!');
    };
    confirmModal.classList.add('active');
}

function completeTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = true;
        renderTasks();
        showNotification('Tarefa concluída!');
    }
}

// Task Form Handler
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    
    if (title) {
        addTask(title, description);
        taskForm.reset();
        showNotification('Tarefa adicionada com sucesso!');
    }
});

// Notification System
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: hsl(var(--primary));
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
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
    }
`;
document.head.appendChild(style);

// Initial Render
renderUsers();
renderTasks();

// Make functions available globally
window.removeUser = removeUser;
window.confirmRemoveTask = confirmRemoveTask;
window.completeTask = completeTask;

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message; // Define a mensagem
  toast.className = "toast show"; // Adiciona a classe para exibir o toast

  // Remove o toast após 3 segundos
  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

// Exemplo de uso
showToast("Olá! Este é um toast de exemplo.");
