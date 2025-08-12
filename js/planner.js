// StudySync - Planner

class Planner {
    constructor() {
        this.currentTab = 'calendar';
        this.currentDate = new Date();
        this.events = [];
        this.todos = [];
        this.goals = [];
        this.init();
    }

    init() {
        this.loadData();
        this.setupTabNavigation();
        this.setupCalendar();
        this.setupTodos();
        this.setupGoals();
        this.renderCalendar();
        this.renderTodos();
        this.renderGoals();
        this.updateStats();
    }

    loadData() {
        // Load events
        const savedEvents = localStorage.getItem('studysync_events');
        this.events = savedEvents ? JSON.parse(savedEvents) : [];

        // Load todos
        const savedTodos = localStorage.getItem('studysync_todos');
        this.todos = savedTodos ? JSON.parse(savedTodos) : [];

        // Load goals
        const savedGoals = localStorage.getItem('studysync_goals');
        this.goals = savedGoals ? JSON.parse(savedGoals) : [];
    }

    saveData() {
        localStorage.setItem('studysync_events', JSON.stringify(this.events));
        localStorage.setItem('studysync_todos', JSON.stringify(this.todos));
        localStorage.setItem('studysync_goals', JSON.stringify(this.goals));
    }

    setupTabNavigation() {
        const tabs = document.querySelectorAll('.planner-tab');
        const contents = document.querySelectorAll('.planner-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Show corresponding content
                contents.forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${tabName}-tab`).classList.add('active');

                this.currentTab = tabName;
            });
        });
    }

    // CALENDAR
    setupCalendar() {
        document.getElementById('prev-month')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('next-month')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        document.getElementById('add-event-btn')?.addEventListener('click', () => {
            this.showEventModal();
        });
    }

    renderCalendar() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const currentMonthElement = document.getElementById('current-month');
        if (currentMonthElement) {
            currentMonthElement.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        }

        const calendarGrid = document.getElementById('calendar-grid');
        if (!calendarGrid) return;

        // Get first day of month and number of days
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        let calendarHtml = '';
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Add day headers
        dayNames.forEach(day => {
            calendarHtml += `<div class="calendar-day-header">${day}</div>`;
        });

        // Add calendar days
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const isCurrentMonth = date.getMonth() === this.currentDate.getMonth();
            const isToday = this.isToday(date);
            const dayEvents = this.getEventsForDate(date);

            let dayClass = 'calendar-day';
            if (!isCurrentMonth) dayClass += ' other-month';
            if (isToday) dayClass += ' today';

            calendarHtml += `
                <div class="${dayClass}" onclick="window.planner.selectDate('${date.toISOString()}')">
                    <div class="day-number">${date.getDate()}</div>
                    <div class="day-events">
                        ${dayEvents.map(event => `
                            <div class="event-item" title="${event.title}">
                                ${event.title}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        calendarGrid.innerHTML = calendarHtml;
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    getEventsForDate(date) {
        return this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === date.toDateString();
        });
    }

    selectDate(dateString) {
        const date = new Date(dateString);
        this.showEventModal(date);
    }

    showEventModal(date = null) {
        // This would show a modal to create/edit events
        const title = prompt('Event title:');
        if (!title) return;

        const time = prompt('Time (HH:MM):', '09:00');
        const notes = prompt('Notes (optional):', '');

        const event = {
            id: window.studySync.generateId(),
            title,
            date: date ? date.toISOString() : new Date().toISOString(),
            time,
            notes,
            tags: [],
            createdAt: new Date().toISOString()
        };

        this.events.push(event);
        this.saveData();
        this.renderCalendar();
        window.studySync.showNotification('Event added successfully!');
    }

    // TODOS
    setupTodos() {
        document.getElementById('add-todo-btn')?.addEventListener('click', () => {
            this.showTodoModal();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.getAttribute('data-filter');
                this.filterTodos(filter);
            });
        });
    }

    showTodoModal(todo = null) {
        const text = prompt('Task description:', todo ? todo.text : '');
        if (!text) return;

        const priority = prompt('Priority (high/medium/low):', todo ? todo.priority : 'medium');
        const dueDateStr = prompt('Due date (YYYY-MM-DD):', '');
        
        const todoData = {
            text,
            priority: ['high', 'medium', 'low'].includes(priority) ? priority : 'medium',
            completed: todo ? todo.completed : false,
            dueDate: dueDateStr ? new Date(dueDateStr).toISOString() : null,
            updatedAt: new Date().toISOString()
        };

        if (todo) {
            // Update existing todo
            const todoIndex = this.todos.findIndex(t => t.id === todo.id);
            if (todoIndex !== -1) {
                this.todos[todoIndex] = { ...this.todos[todoIndex], ...todoData };
            }
        } else {
            // Create new todo
            todoData.id = window.studySync.generateId();
            todoData.createdAt = new Date().toISOString();
            this.todos.push(todoData);
        }

        this.saveData();
        this.renderTodos();
        this.updateStats();
        window.studySync.showNotification('Task saved successfully!');
    }

    renderTodos() {
        const container = document.getElementById('todos-list');
        if (!container) return;

        if (this.todos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">✅</div>
                    <h3>No tasks yet</h3>
                    <p>Add your first task to get started with planning</p>
                    <button class="btn btn-primary" onclick="window.planner.showTodoModal()">Add Task</button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.todos.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : ''}">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} 
                       onchange="window.planner.toggleTodo('${todo.id}')">
                <div class="todo-content">
                    <div class="todo-text">${todo.text}</div>
                    <div class="todo-meta">
                        <span class="priority priority-${todo.priority}">${todo.priority}</span>
                        ${todo.dueDate ? `<span>Due: ${window.studySync.formatDate(todo.dueDate)}</span>` : ''}
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="btn btn-outline btn-sm" onclick="window.planner.editTodo('${todo.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="window.planner.deleteTodo('${todo.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    filterTodos(filter) {
        const todos = document.querySelectorAll('.todo-item');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        todos.forEach(todoElement => {
            const todoId = todoElement.querySelector('.todo-checkbox').getAttribute('onchange').match(/'([^']+)'/)[1];
            const todo = this.todos.find(t => t.id === todoId);
            
            let show = false;
            
            switch (filter) {
                case 'all':
                    show = true;
                    break;
                case 'today':
                    if (todo.dueDate) {
                        const dueDate = new Date(todo.dueDate);
                        dueDate.setHours(0, 0, 0, 0);
                        show = dueDate.getTime() === today.getTime();
                    }
                    break;
                case 'upcoming':
                    if (todo.dueDate) {
                        const dueDate = new Date(todo.dueDate);
                        show = dueDate > today && !todo.completed;
                    }
                    break;
                case 'completed':
                    show = todo.completed;
                    break;
            }
            
            todoElement.style.display = show ? 'flex' : 'none';
        });
    }

    toggleTodo(todoId) {
        const todo = this.todos.find(t => t.id === todoId);
        if (todo) {
            todo.completed = !todo.completed;
            todo.updatedAt = new Date().toISOString();
            this.saveData();
            this.renderTodos();
            this.updateStats();
            
            if (todo.completed) {
                window.studySync.showNotification('Task completed! 🎉');
            }
        }
    }

    editTodo(todoId) {
        const todo = this.todos.find(t => t.id === todoId);
        if (todo) {
            this.showTodoModal(todo);
        }
    }

    deleteTodo(todoId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(t => t.id !== todoId);
            this.saveData();
            this.renderTodos();
            this.updateStats();
            window.studySync.showNotification('Task deleted');
        }
    }

    // GOALS
    setupGoals() {
        document.getElementById('add-goal-btn')?.addEventListener('click', () => {
            this.showGoalModal();
        });
    }

    showGoalModal(goal = null) {
        const name = prompt('Goal name:', goal ? goal.name : '');
        if (!name) return;

        const targetDateStr = prompt('Target date (YYYY-MM-DD):', '');
        const targetDate = targetDateStr ? new Date(targetDateStr).toISOString() : null;

        const goalData = {
            name,
            targetDate,
            progress: goal ? goal.progress : 0,
            milestones: goal ? goal.milestones : [],
            updatedAt: new Date().toISOString()
        };

        if (goal) {
            // Update existing goal
            const goalIndex = this.goals.findIndex(g => g.id === goal.id);
            if (goalIndex !== -1) {
                this.goals[goalIndex] = { ...this.goals[goalIndex], ...goalData };
            }
        } else {
            // Create new goal
            goalData.id = window.studySync.generateId();
            goalData.createdAt = new Date().toISOString();
            this.goals.push(goalData);
        }

        this.saveData();
        this.renderGoals();
        window.studySync.showNotification('Goal saved successfully!');
    }

    renderGoals() {
        const container = document.getElementById('goals-grid');
        if (!container) return;

        if (this.goals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎯</div>
                    <h3>No goals yet</h3>
                    <p>Set your first goal to start tracking your progress</p>
                    <button class="btn btn-primary" onclick="window.planner.showGoalModal()">Add Goal</button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.goals.map(goal => `
            <div class="goal-card">
                <div class="goal-header">
                    <h3 class="goal-title">${goal.name}</h3>
                    <button class="btn btn-outline btn-sm" onclick="window.planner.editGoal('${goal.id}')">Edit</button>
                </div>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${goal.progress}%"></div>
                    </div>
                    <div class="progress-text">${goal.progress}% Complete</div>
                </div>
                <div class="goal-meta">
                    ${goal.targetDate ? `Target: ${window.studySync.formatDate(goal.targetDate)}` : 'No target date'}
                </div>
                <div class="goal-actions">
                    <button class="btn btn-outline btn-sm" onclick="window.planner.updateGoalProgress('${goal.id}')">Update Progress</button>
                    <button class="btn btn-danger btn-sm" onclick="window.planner.deleteGoal('${goal.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    editGoal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            this.showGoalModal(goal);
        }
    }

    updateGoalProgress(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;

        const newProgress = prompt(`Update progress for "${goal.name}" (0-100):`, goal.progress.toString());
        if (newProgress === null) return;

        const progress = Math.max(0, Math.min(100, parseInt(newProgress) || 0));
        goal.progress = progress;
        goal.updatedAt = new Date().toISOString();

        this.saveData();
        this.renderGoals();
        
        if (progress === 100) {
            window.studySync.showNotification('Congratulations! Goal completed! 🎉');
        } else {
            window.studySync.showNotification('Progress updated!');
        }
    }

    deleteGoal(goalId) {
        if (confirm('Are you sure you want to delete this goal?')) {
            this.goals = this.goals.filter(g => g.id !== goalId);
            this.saveData();
            this.renderGoals();
            window.studySync.showNotification('Goal deleted');
        }
    }

    // STATISTICS
    updateStats() {
        // Calculate study time (from completed pomodoro sessions)
        const studyTimeElement = document.getElementById('study-time-stat');
        if (studyTimeElement) {
            // This would be calculated from actual pomodoro data
            studyTimeElement.textContent = '12h';
        }

        // Calculate completed tasks
        const completedTasksElement = document.getElementById('completed-tasks-stat');
        if (completedTasksElement) {
            const completedCount = this.todos.filter(todo => todo.completed).length;
            completedTasksElement.textContent = completedCount.toString();
        }

        // Calculate streak (simplified)
        const streakElement = document.getElementById('streak-stat');
        if (streakElement) {
            // This would be calculated based on daily activity
            streakElement.textContent = '5';
        }
    }

    // Utility methods
    getDaysInMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }

    getFirstDayOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    }

    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }

    isOverdue(todo) {
        if (!todo.dueDate || todo.completed) return false;
        return new Date(todo.dueDate) < new Date();
    }

    getUpcomingEvents(days = 7) {
        const now = new Date();
        const future = new Date();
        future.setDate(now.getDate() + days);

        return this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= now && eventDate <= future;
        });
    }

    getGoalsByProgress() {
        return {
            notStarted: this.goals.filter(g => g.progress === 0),
            inProgress: this.goals.filter(g => g.progress > 0 && g.progress < 100),
            completed: this.goals.filter(g => g.progress === 100)
        };
    }
}

// Initialize planner when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.planner = new Planner();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Planner;
}