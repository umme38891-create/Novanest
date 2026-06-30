class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.storageKey = 'todos_data';
        
        this.init();
        this.attachEventListeners();
        this.loadFromStorage();
        this.render();
    }

    init() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.totalTasksEl = document.getElementById('totalTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
        this.pendingTasksEl = document.getElementById('pendingTasks');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.clearAllBtn = document.getElementById('clearAll');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    attachEventListeners() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        
        if (!text) {
            alert('Please enter a task!');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString()
        };

        this.todos.push(todo);
        this.todoInput.value = '';
        this.saveToStorage();
        this.render();
        this.todoInput.focus();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveToStorage();
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
        }
    }

    clearCompleted() {
        if (confirm('Are you sure you want to clear all completed tasks?')) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveToStorage();
            this.render();
        }
    }

    clearAll() {
        if (confirm('Are you sure you want to delete ALL tasks? This cannot be undone!')) {
            this.todos = [];
            this.saveToStorage();
            this.render();
        }
    }

    getFilteredTodos() {
        switch(this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;

        this.totalTasksEl.textContent = total;
        this.completedTasksEl.textContent = completed;
        this.pendingTasksEl.textContent = pending;
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        
        this.todoList.innerHTML = '';
        
        if (filteredTodos.length === 0) {
            this.emptyState.style.display = 'block';
        } else {
            this.emptyState.style.display = 'none';
            filteredTodos.forEach(todo => {
                const todoEl = document.createElement('div');
                todoEl.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                
                todoEl.innerHTML = `
                    <input 
                        type="checkbox" 
                        class="todo-checkbox" 
                        ${todo.completed ? 'checked' : ''}
                        onchange="app.toggleTodo(${todo.id})"
                    >
                    <div class="todo-content">
                        <div class="todo-text">${this.escapeHtml(todo.text)}</div>
                        <div class="todo-date">${todo.createdAt}</div>
                    </div>
                    <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">Delete</button>
                `;
                
                this.todoList.appendChild(todoEl);
            });
        }
        
        this.updateStats();
    }

    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.todos));
    }

    loadFromStorage() {
        const data = localStorage.getItem(this.storageKey);
        if (data) {
            try {
                this.todos = JSON.parse(data);
            } catch (e) {
                console.error('Error loading todos from storage:', e);
                this.todos = [];
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
});
