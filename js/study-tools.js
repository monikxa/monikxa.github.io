// StudySync - Study Tools

class StudyTools {
    constructor() {
        this.currentTool = 'flashcards';
        this.flashcardDecks = [];
        this.notes = [];
        this.currentDeck = null;
        this.currentNote = null;
        this.studyMode = {
            active: false,
            currentCard: 0,
            cards: [],
            flipped: false
        };
        this.pomodoro = {
            isRunning: false,
            isPaused: false,
            currentSession: 'work',
            timeLeft: 25 * 60, // 25 minutes in seconds
            cycleCount: 0,
            settings: {
                workDuration: 25,
                shortBreak: 5,
                longBreak: 15,
                cyclesUntilLongBreak: 4
            }
        };
        this.init();
    }

    init() {
        this.loadData();
        this.setupToolNavigation();
        this.setupFlashcards();
        this.setupNotes();
        this.setupQuizGenerator();
        this.setupPomodoroTimer();
        this.renderFlashcardDecks();
        this.renderNotes();
    }

    loadData() {
        // Load flashcard decks
        const savedDecks = localStorage.getItem('studysync_flashcard_decks');
        this.flashcardDecks = savedDecks ? JSON.parse(savedDecks) : [];

        // Load notes
        const savedNotes = localStorage.getItem('studysync_notes');
        this.notes = savedNotes ? JSON.parse(savedNotes) : [];

        // Load pomodoro settings
        const savedSettings = localStorage.getItem('studysync_pomodoro_settings');
        if (savedSettings) {
            this.pomodoro.settings = { ...this.pomodoro.settings, ...JSON.parse(savedSettings) };
        }
    }

    saveData() {
        localStorage.setItem('studysync_flashcard_decks', JSON.stringify(this.flashcardDecks));
        localStorage.setItem('studysync_notes', JSON.stringify(this.notes));
        localStorage.setItem('studysync_pomodoro_settings', JSON.stringify(this.pomodoro.settings));
    }

    setupToolNavigation() {
        const toolTabs = document.querySelectorAll('.tool-tab');
        const toolContents = document.querySelectorAll('.tool-content');

        toolTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const toolName = tab.getAttribute('data-tool');
                
                // Update active tab
                toolTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Show corresponding content
                toolContents.forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${toolName}-tool`).classList.add('active');

                this.currentTool = toolName;
            });
        });
    }

    // FLASHCARDS
    setupFlashcards() {
        // Create deck button
        document.getElementById('create-deck-btn')?.addEventListener('click', () => {
            this.showDeckModal();
        });

        // Deck form submission
        document.getElementById('deck-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveDeck();
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });

        // Study mode controls
        document.getElementById('exit-study')?.addEventListener('click', () => {
            this.exitStudyMode();
        });

        document.getElementById('flip-card')?.addEventListener('click', () => {
            this.flipCard();
        });

        document.getElementById('prev-card')?.addEventListener('click', () => {
            this.previousCard();
        });

        document.getElementById('next-card')?.addEventListener('click', () => {
            this.nextCard();
        });

        document.getElementById('shuffle-cards')?.addEventListener('click', () => {
            this.shuffleCards();
        });
    }

    showDeckModal(deck = null) {
        const modal = document.getElementById('deck-modal');
        const form = document.getElementById('deck-form');
        const title = document.getElementById('deck-modal-title');

        if (deck) {
            title.textContent = 'Edit Deck';
            document.getElementById('deck-name').value = deck.name;
            document.getElementById('deck-tags').value = deck.tags.join(', ');
            document.querySelector(`input[name="deck-color"][value="${deck.color}"]`).checked = true;
            form.dataset.deckId = deck.id;
        } else {
            title.textContent = 'Create New Deck';
            form.reset();
            delete form.dataset.deckId;
        }

        modal.classList.add('active');
    }

    saveDeck() {
        const form = document.getElementById('deck-form');
        const name = document.getElementById('deck-name').value.trim();
        const tags = document.getElementById('deck-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const color = document.querySelector('input[name="deck-color"]:checked').value;

        if (!name) {
            window.studySync.showNotification('Please enter a deck name', 'error');
            return;
        }

        const deckData = {
            name,
            tags,
            color,
            cards: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (form.dataset.deckId) {
            // Update existing deck
            const deckIndex = this.flashcardDecks.findIndex(d => d.id === form.dataset.deckId);
            if (deckIndex !== -1) {
                this.flashcardDecks[deckIndex] = { ...this.flashcardDecks[deckIndex], ...deckData };
            }
        } else {
            // Create new deck
            deckData.id = window.studySync.generateId();
            this.flashcardDecks.push(deckData);
        }

        this.saveData();
        this.renderFlashcardDecks();
        document.getElementById('deck-modal').classList.remove('active');
        window.studySync.showNotification('Deck saved successfully!');
    }

    renderFlashcardDecks() {
        const container = document.getElementById('decks-grid');
        if (!container) return;

        if (this.flashcardDecks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📚</div>
                    <h3>No flashcard decks yet</h3>
                    <p>Create your first deck to start studying with flashcards</p>
                    <button class="btn btn-primary" onclick="window.studyTools.showDeckModal()">Create Deck</button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.flashcardDecks.map(deck => `
            <div class="deck-card" style="border-left-color: ${deck.color}">
                <div class="deck-header">
                    <h3 class="deck-title">${deck.name}</h3>
                    <div class="deck-menu">
                        <button class="deck-menu-btn" onclick="window.studyTools.showDeckMenu('${deck.id}', event)">⋮</button>
                    </div>
                </div>
                <div class="deck-info">
                    <span class="deck-count">${deck.cards?.length || 0} cards</span>
                </div>
                <div class="deck-tags">
                    ${deck.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="deck-actions">
                    <button class="btn btn-outline" onclick="window.studyTools.editDeck('${deck.id}')">Edit</button>
                    <button class="btn btn-primary" onclick="window.studyTools.startStudyMode('${deck.id}')">Study</button>
                </div>
            </div>
        `).join('');
    }

    editDeck(deckId) {
        const deck = this.flashcardDecks.find(d => d.id === deckId);
        if (deck) {
            this.showDeckModal(deck);
        }
    }

    deleteDeck(deckId) {
        if (confirm('Are you sure you want to delete this deck? This action cannot be undone.')) {
            this.flashcardDecks = this.flashcardDecks.filter(d => d.id !== deckId);
            this.saveData();
            this.renderFlashcardDecks();
            window.studySync.showNotification('Deck deleted successfully');
        }
    }

    startStudyMode(deckId) {
        const deck = this.flashcardDecks.find(d => d.id === deckId);
        if (!deck || !deck.cards || deck.cards.length === 0) {
            window.studySync.showNotification('This deck has no cards to study', 'error');
            return;
        }

        this.studyMode = {
            active: true,
            currentCard: 0,
            cards: [...deck.cards],
            flipped: false
        };

        document.getElementById('flashcards-tool').querySelector('.tool-header').style.display = 'none';
        document.getElementById('decks-grid').style.display = 'none';
        document.getElementById('study-mode').classList.remove('hidden');

        this.updateStudyCard();
    }

    exitStudyMode() {
        this.studyMode.active = false;
        document.getElementById('flashcards-tool').querySelector('.tool-header').style.display = 'flex';
        document.getElementById('decks-grid').style.display = 'grid';
        document.getElementById('study-mode').classList.add('hidden');
    }

    updateStudyCard() {
        if (!this.studyMode.active || this.studyMode.cards.length === 0) return;

        const card = this.studyMode.cards[this.studyMode.currentCard];
        document.getElementById('card-front').textContent = card.front;
        document.getElementById('card-back').textContent = card.back;
        document.getElementById('card-counter').textContent = 
            `${this.studyMode.currentCard + 1} / ${this.studyMode.cards.length}`;

        // Reset flip state
        this.studyMode.flipped = false;
        document.getElementById('study-card').classList.remove('flipped');
    }

    flipCard() {
        this.studyMode.flipped = !this.studyMode.flipped;
        document.getElementById('study-card').classList.toggle('flipped');
    }

    previousCard() {
        if (this.studyMode.currentCard > 0) {
            this.studyMode.currentCard--;
            this.updateStudyCard();
        }
    }

    nextCard() {
        if (this.studyMode.currentCard < this.studyMode.cards.length - 1) {
            this.studyMode.currentCard++;
            this.updateStudyCard();
        }
    }

    shuffleCards() {
        for (let i = this.studyMode.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.studyMode.cards[i], this.studyMode.cards[j]] = [this.studyMode.cards[j], this.studyMode.cards[i]];
        }
        this.studyMode.currentCard = 0;
        this.updateStudyCard();
        window.studySync.showNotification('Cards shuffled!');
    }

    // NOTES
    setupNotes() {
        document.getElementById('create-note-btn')?.addEventListener('click', () => {
            this.showNoteEditor();
        });

        document.getElementById('save-note')?.addEventListener('click', () => {
            this.saveNote();
        });

        document.getElementById('close-editor')?.addEventListener('click', () => {
            this.closeNoteEditor();
        });

        // Rich text toolbar
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const command = btn.getAttribute('data-command');
                document.execCommand(command, false, null);
            });
        });

        // Auto-save functionality
        let autoSaveTimeout;
        document.getElementById('note-content')?.addEventListener('input', () => {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                this.autoSaveNote();
            }, 2000);
        });
    }

    showNoteEditor(note = null) {
        const editor = document.getElementById('note-editor');
        const titleInput = document.getElementById('note-title');
        const contentInput = document.getElementById('note-content');
        const tagsInput = document.getElementById('note-tags');

        if (note) {
            titleInput.value = note.title;
            contentInput.innerHTML = note.content;
            tagsInput.value = note.tags.join(', ');
            editor.dataset.noteId = note.id;
        } else {
            titleInput.value = '';
            contentInput.innerHTML = '';
            tagsInput.value = '';
            delete editor.dataset.noteId;
        }

        document.getElementById('notes-grid').style.display = 'none';
        document.getElementById('notes-tool').querySelector('.tool-header').style.display = 'none';
        editor.classList.remove('hidden');
        titleInput.focus();
    }

    closeNoteEditor() {
        document.getElementById('note-editor').classList.add('hidden');
        document.getElementById('notes-grid').style.display = 'grid';
        document.getElementById('notes-tool').querySelector('.tool-header').style.display = 'flex';
    }

    saveNote() {
        const editor = document.getElementById('note-editor');
        const title = document.getElementById('note-title').value.trim();
        const content = document.getElementById('note-content').innerHTML.trim();
        const tags = document.getElementById('note-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);

        if (!title) {
            window.studySync.showNotification('Please enter a note title', 'error');
            return;
        }

        const noteData = {
            title,
            content,
            tags,
            updatedAt: new Date().toISOString()
        };

        if (editor.dataset.noteId) {
            // Update existing note
            const noteIndex = this.notes.findIndex(n => n.id === editor.dataset.noteId);
            if (noteIndex !== -1) {
                this.notes[noteIndex] = { ...this.notes[noteIndex], ...noteData };
            }
        } else {
            // Create new note
            noteData.id = window.studySync.generateId();
            noteData.createdAt = new Date().toISOString();
            this.notes.push(noteData);
        }

        this.saveData();
        this.renderNotes();
        this.closeNoteEditor();
        window.studySync.showNotification('Note saved successfully!');
    }

    autoSaveNote() {
        const editor = document.getElementById('note-editor');
        if (!editor.dataset.noteId) return; // Don't auto-save new notes

        const title = document.getElementById('note-title').value.trim();
        const content = document.getElementById('note-content').innerHTML.trim();

        if (!title || !content) return;

        const noteIndex = this.notes.findIndex(n => n.id === editor.dataset.noteId);
        if (noteIndex !== -1) {
            this.notes[noteIndex].title = title;
            this.notes[noteIndex].content = content;
            this.notes[noteIndex].updatedAt = new Date().toISOString();
            this.saveData();
        }
    }

    renderNotes() {
        const container = document.getElementById('notes-grid');
        if (!container) return;

        if (this.notes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3>No notes yet</h3>
                    <p>Create your first note to start organizing your thoughts</p>
                    <button class="btn btn-primary" onclick="window.studyTools.showNoteEditor()">Create Note</button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.notes.map(note => `
            <div class="note-card" onclick="window.studyTools.editNote('${note.id}')">
                <h3 class="note-title">${note.title}</h3>
                <div class="note-preview">${this.stripHtml(note.content).substring(0, 150)}...</div>
                <div class="deck-tags">
                    ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="note-meta">
                    <span>Updated ${window.studySync.formatDate(note.updatedAt)}</span>
                    <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); window.studyTools.deleteNote('${note.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    editNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            this.showNoteEditor(note);
        }
    }

    deleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note?')) {
            this.notes = this.notes.filter(n => n.id !== noteId);
            this.saveData();
            this.renderNotes();
            window.studySync.showNotification('Note deleted successfully');
        }
    }

    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    // QUIZ GENERATOR
    setupQuizGenerator() {
        document.getElementById('create-quiz-btn')?.addEventListener('click', () => {
            this.showQuizSetup();
        });

        document.getElementById('start-quiz')?.addEventListener('click', () => {
            this.startQuiz();
        });
    }

    showQuizSetup() {
        const deckSelection = document.getElementById('deck-selection');
        if (!deckSelection) return;

        deckSelection.innerHTML = this.flashcardDecks.map(deck => `
            <div class="deck-option">
                <input type="checkbox" id="deck-${deck.id}" value="${deck.id}">
                <label for="deck-${deck.id}">${deck.name} (${deck.cards?.length || 0} cards)</label>
            </div>
        `).join('');
    }

    startQuiz() {
        const selectedDecks = Array.from(document.querySelectorAll('#deck-selection input:checked'))
            .map(input => input.value);
        
        if (selectedDecks.length === 0) {
            window.studySync.showNotification('Please select at least one deck', 'error');
            return;
        }

        const questionCount = parseInt(document.getElementById('question-count').value);
        const quizType = document.getElementById('quiz-type').value;

        // Generate quiz questions
        const allCards = [];
        selectedDecks.forEach(deckId => {
            const deck = this.flashcardDecks.find(d => d.id === deckId);
            if (deck && deck.cards) {
                allCards.push(...deck.cards);
            }
        });

        if (allCards.length === 0) {
            window.studySync.showNotification('Selected decks have no cards', 'error');
            return;
        }

        // Shuffle and limit questions
        const shuffled = allCards.sort(() => 0.5 - Math.random());
        const questions = shuffled.slice(0, Math.min(questionCount, shuffled.length));

        this.generateQuiz(questions, quizType);
    }

    generateQuiz(questions, type) {
        const container = document.getElementById('quiz-container');
        document.getElementById('quiz-setup').style.display = 'none';
        container.classList.remove('hidden');

        let quizHtml = '<div class="quiz-header"><h3>Quiz</h3></div>';
        
        questions.forEach((question, index) => {
            quizHtml += `
                <div class="quiz-question">
                    <div class="question-text">${index + 1}. ${question.front}</div>
                    <div class="quiz-options">
                        ${this.generateQuizOptions(question, type, index)}
                    </div>
                </div>
            `;
        });

        quizHtml += `
            <div class="quiz-actions">
                <button class="btn btn-primary" onclick="window.studyTools.submitQuiz()">Submit Quiz</button>
                <button class="btn btn-secondary" onclick="window.studyTools.exitQuiz()">Exit</button>
            </div>
        `;

        container.innerHTML = quizHtml;
    }

    generateQuizOptions(question, type, questionIndex) {
        switch (type) {
            case 'multiple-choice':
                // Generate multiple choice options
                const correctAnswer = question.back;
                const wrongAnswers = this.getRandomWrongAnswers(correctAnswer, 3);
                const allOptions = [correctAnswer, ...wrongAnswers].sort(() => 0.5 - Math.random());
                
                return allOptions.map((option, index) => `
                    <div class="quiz-option">
                        <input type="radio" name="question-${questionIndex}" value="${option}" id="q${questionIndex}-${index}">
                        <label for="q${questionIndex}-${index}">${option}</label>
                    </div>
                `).join('');

            case 'true-false':
                return `
                    <div class="quiz-option">
                        <input type="radio" name="question-${questionIndex}" value="true" id="q${questionIndex}-true">
                        <label for="q${questionIndex}-true">True</label>
                    </div>
                    <div class="quiz-option">
                        <input type="radio" name="question-${questionIndex}" value="false" id="q${questionIndex}-false">
                        <label for="q${questionIndex}-false">False</label>
                    </div>
                `;

            case 'short-answer':
                return `
                    <input type="text" name="question-${questionIndex}" placeholder="Enter your answer..." class="quiz-text-input">
                `;

            default:
                return '';
        }
    }

    getRandomWrongAnswers(correctAnswer, count) {
        const allAnswers = this.flashcardDecks
            .flatMap(deck => deck.cards || [])
            .map(card => card.back)
            .filter(answer => answer !== correctAnswer);
        
        return allAnswers.sort(() => 0.5 - Math.random()).slice(0, count);
    }

    submitQuiz() {
        // Quiz submission logic would go here
        window.studySync.showNotification('Quiz submitted! (Feature coming soon)');
    }

    exitQuiz() {
        document.getElementById('quiz-container').classList.add('hidden');
        document.getElementById('quiz-setup').style.display = 'block';
    }

    // POMODORO TIMER
    setupPomodoroTimer() {
        document.getElementById('timer-start')?.addEventListener('click', () => {
            this.startPomodoro();
        });

        document.getElementById('timer-pause')?.addEventListener('click', () => {
            this.pausePomodoro();
        });

        document.getElementById('timer-reset')?.addEventListener('click', () => {
            this.resetPomodoro();
        });

        // Settings inputs
        ['work-duration', 'short-break', 'long-break', 'cycles-count'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                this.updatePomodoroSettings(id, parseInt(e.target.value));
            });
        });

        this.updatePomodoroDisplay();
    }

    startPomodoro() {
        if (!this.pomodoro.isRunning) {
            this.pomodoro.isRunning = true;
            this.pomodoro.isPaused = false;
            
            document.getElementById('timer-start').disabled = true;
            document.getElementById('timer-pause').disabled = false;
            
            this.pomodoroInterval = setInterval(() => {
                this.updatePomodoro();
            }, 1000);
        }
    }

    pausePomodoro() {
        if (this.pomodoro.isRunning) {
            this.pomodoro.isPaused = !this.pomodoro.isPaused;
            const pauseBtn = document.getElementById('timer-pause');
            pauseBtn.textContent = this.pomodoro.isPaused ? 'Resume' : 'Pause';
        }
    }

    resetPomodoro() {
        this.pomodoro.isRunning = false;
        this.pomodoro.isPaused = false;
        this.pomodoro.currentSession = 'work';
        this.pomodoro.timeLeft = this.pomodoro.settings.workDuration * 60;
        this.pomodoro.cycleCount = 0;
        
        if (this.pomodoroInterval) {
            clearInterval(this.pomodoroInterval);
        }
        
        document.getElementById('timer-start').disabled = false;
        document.getElementById('timer-pause').disabled = true;
        document.getElementById('timer-pause').textContent = 'Pause';
        
        this.updatePomodoroDisplay();
    }

    updatePomodoro() {
        if (this.pomodoro.isPaused) return;

        this.pomodoro.timeLeft--;
        
        if (this.pomodoro.timeLeft <= 0) {
            this.completeSession();
        }
        
        this.updatePomodoroDisplay();
    }

    completeSession() {
        // Play notification sound (if available)
        this.playNotificationSound();
        
        // Show notification
        if (Notification.permission === 'granted') {
            new Notification('Pomodoro Timer', {
                body: `${this.pomodoro.currentSession} session completed!`,
                icon: '/favicon.ico'
            });
        }

        // Switch to next session
        if (this.pomodoro.currentSession === 'work') {
            this.pomodoro.cycleCount++;
            
            if (this.pomodoro.cycleCount % this.pomodoro.settings.cyclesUntilLongBreak === 0) {
                this.pomodoro.currentSession = 'longBreak';
                this.pomodoro.timeLeft = this.pomodoro.settings.longBreak * 60;
            } else {
                this.pomodoro.currentSession = 'shortBreak';
                this.pomodoro.timeLeft = this.pomodoro.settings.shortBreak * 60;
            }
        } else {
            this.pomodoro.currentSession = 'work';
            this.pomodoro.timeLeft = this.pomodoro.settings.workDuration * 60;
        }
        
        this.updatePomodoroDisplay();
        window.studySync.showNotification(`${this.getSessionLabel()} started!`);
    }

    updatePomodoroDisplay() {
        const minutes = Math.floor(this.pomodoro.timeLeft / 60);
        const seconds = this.pomodoro.timeLeft % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('timer-time').textContent = timeString;
        document.getElementById('timer-label').textContent = this.getSessionLabel();
        
        // Update progress circle
        const totalTime = this.getSessionDuration() * 60;
        const progress = ((totalTime - this.pomodoro.timeLeft) / totalTime) * 283;
        document.getElementById('timer-progress').style.strokeDashoffset = 283 - progress;
    }

    getSessionLabel() {
        switch (this.pomodoro.currentSession) {
            case 'work': return 'Work Time';
            case 'shortBreak': return 'Short Break';
            case 'longBreak': return 'Long Break';
            default: return 'Work Time';
        }
    }

    getSessionDuration() {
        switch (this.pomodoro.currentSession) {
            case 'work': return this.pomodoro.settings.workDuration;
            case 'shortBreak': return this.pomodoro.settings.shortBreak;
            case 'longBreak': return this.pomodoro.settings.longBreak;
            default: return this.pomodoro.settings.workDuration;
        }
    }

    updatePomodoroSettings(settingId, value) {
        const settingMap = {
            'work-duration': 'workDuration',
            'short-break': 'shortBreak',
            'long-break': 'longBreak',
            'cycles-count': 'cyclesUntilLongBreak'
        };
        
        const settingKey = settingMap[settingId];
        if (settingKey) {
            this.pomodoro.settings[settingKey] = value;
            this.saveData();
            
            // Reset timer if not running
            if (!this.pomodoro.isRunning) {
                this.pomodoro.timeLeft = this.pomodoro.settings.workDuration * 60;
                this.updatePomodoroDisplay();
            }
        }
    }

    playNotificationSound() {
        // Create a simple beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    // Request notification permission
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

// Initialize study tools when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.studyTools = new StudyTools();
    window.studyTools.requestNotificationPermission();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudyTools;
}