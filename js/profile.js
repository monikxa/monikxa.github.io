// StudySync - Profile Management

class Profile {
    constructor() {
        this.profileData = {
            name: '',
            email: '',
            avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150',
            settings: {
                darkMode: false,
                notifications: true,
                autoSave: true
            },
            stats: {
                totalStudyTime: 0,
                studyStreak: 0,
                flashcardsReviewed: 0,
                quizzesTaken: 0,
                notesCreated: 0,
                goalsCompleted: 0
            },
            savedContent: {
                decks: [],
                notes: [],
                resources: []
            }
        };
        this.availableAvatars = [
            'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150',
            'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
            'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
            'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
            'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150',
            'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150',
            'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=150',
            'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=150'
        ];
        this.init();
    }

    init() {
        this.loadProfile();
        this.setupProfileForm();
        this.setupAvatarSelection();
        this.setupSettings();
        this.setupSavedContent();
        this.renderProfile();
        this.updateStats();
    }

    loadProfile() {
        const savedProfile = localStorage.getItem('studysync_profile');
        if (savedProfile) {
            this.profileData = { ...this.profileData, ...JSON.parse(savedProfile) };
        }
        
        // Apply dark mode if enabled
        if (this.profileData.settings.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    saveProfile() {
        localStorage.setItem('studysync_profile', JSON.stringify(this.profileData));
    }

    setupProfileForm() {
        const saveBtn = document.getElementById('save-profile');
        const nameInput = document.getElementById('profile-name');
        const emailInput = document.getElementById('profile-email');

        saveBtn?.addEventListener('click', () => {
            this.profileData.name = nameInput?.value.trim() || '';
            this.profileData.email = emailInput?.value.trim() || '';
            this.saveProfile();
            window.studySync.showNotification('Profile updated successfully!');
        });
    }

    setupAvatarSelection() {
        const changeAvatarBtn = document.getElementById('change-avatar-btn');
        const avatarModal = document.getElementById('avatar-modal');

        changeAvatarBtn?.addEventListener('click', () => {
            this.showAvatarModal();
        });

        // Close modal when clicking outside
        avatarModal?.addEventListener('click', (e) => {
            if (e.target === avatarModal) {
                avatarModal.classList.remove('active');
            }
        });
    }

    showAvatarModal() {
        const modal = document.getElementById('avatar-modal');
        const avatarGrid = document.getElementById('avatar-grid');

        if (!modal || !avatarGrid) return;

        avatarGrid.innerHTML = this.availableAvatars.map((avatar, index) => `
            <div class="avatar-option ${avatar === this.profileData.avatar ? 'selected' : ''}" 
                 onclick="window.profile.selectAvatar('${avatar}')">
                <img src="${avatar}" alt="Avatar option ${index + 1}" loading="lazy">
            </div>
        `).join('');

        modal.classList.add('active');
    }

    selectAvatar(avatarUrl) {
        this.profileData.avatar = avatarUrl;
        this.saveProfile();
        this.updateAvatarDisplay();
        document.getElementById('avatar-modal')?.classList.remove('active');
        window.studySync.showNotification('Avatar updated!');
    }

    updateAvatarDisplay() {
        const avatarImg = document.getElementById('current-avatar');
        if (avatarImg) {
            avatarImg.src = this.profileData.avatar;
        }
    }

    setupSettings() {
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        const notificationsToggle = document.getElementById('notifications-toggle');
        const exportDataBtn = document.getElementById('export-data');
        const clearDataBtn = document.getElementById('clear-data');

        darkModeToggle?.addEventListener('change', (e) => {
            this.toggleDarkMode(e.target.checked);
        });

        notificationsToggle?.addEventListener('change', (e) => {
            this.profileData.settings.notifications = e.target.checked;
            this.saveProfile();
            window.studySync.showNotification(
                e.target.checked ? 'Notifications enabled' : 'Notifications disabled'
            );
        });

        exportDataBtn?.addEventListener('click', () => {
            this.exportAccountData();
        });

        clearDataBtn?.addEventListener('click', () => {
            this.clearAllData();
        });
    }

    toggleDarkMode(enabled) {
        this.profileData.settings.darkMode = enabled;
        this.saveProfile();

        if (enabled) {
            document.documentElement.setAttribute('data-theme', 'dark');
            window.studySync.showNotification('Dark mode enabled');
        } else {
            document.documentElement.removeAttribute('data-theme');
            window.studySync.showNotification('Dark mode disabled');
        }
    }

    setupSavedContent() {
        const savedTabs = document.querySelectorAll('.saved-tab');
        const savedLists = document.querySelectorAll('.saved-list');

        savedTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                
                // Update active tab
                savedTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Show corresponding list
                savedLists.forEach(list => {
                    list.classList.remove('active');
                });
                document.getElementById(`saved-${tabName}`)?.classList.add('active');

                this.renderSavedContent(tabName);
            });
        });
    }

    renderProfile() {
        // Update profile form
        const nameInput = document.getElementById('profile-name');
        const emailInput = document.getElementById('profile-email');
        
        if (nameInput) nameInput.value = this.profileData.name;
        if (emailInput) emailInput.value = this.profileData.email;

        // Update avatar
        this.updateAvatarDisplay();

        // Update settings
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        const notificationsToggle = document.getElementById('notifications-toggle');
        
        if (darkModeToggle) darkModeToggle.checked = this.profileData.settings.darkMode;
        if (notificationsToggle) notificationsToggle.checked = this.profileData.settings.notifications;

        // Render saved content
        this.renderSavedContent('decks');
    }

    updateStats() {
        // Calculate stats from stored data
        this.calculateStudyStats();
        
        // Update stat displays
        const totalStudyTimeEl = document.getElementById('total-study-time');
        const studyStreakEl = document.getElementById('study-streak');
        const flashcardsReviewedEl = document.getElementById('flashcards-reviewed');
        const quizzesTakenEl = document.getElementById('quizzes-taken');

        if (totalStudyTimeEl) {
            const hours = Math.floor(this.profileData.stats.totalStudyTime / 60);
            const minutes = this.profileData.stats.totalStudyTime % 60;
            totalStudyTimeEl.textContent = `${hours}h ${minutes}m`;
        }

        if (studyStreakEl) {
            studyStreakEl.textContent = this.profileData.stats.studyStreak.toString();
        }

        if (flashcardsReviewedEl) {
            flashcardsReviewedEl.textContent = this.profileData.stats.flashcardsReviewed.toString();
        }

        if (quizzesTakenEl) {
            quizzesTakenEl.textContent = this.profileData.stats.quizzesTaken.toString();
        }
    }

    calculateStudyStats() {
        // Get data from other modules
        const flashcardDecks = JSON.parse(localStorage.getItem('studysync_flashcard_decks') || '[]');
        const notes = JSON.parse(localStorage.getItem('studysync_notes') || '[]');
        const goals = JSON.parse(localStorage.getItem('studysync_goals') || '[]');
        const todos = JSON.parse(localStorage.getItem('studysync_todos') || '[]');

        // Calculate flashcards reviewed (estimate based on deck usage)
        this.profileData.stats.flashcardsReviewed = flashcardDecks.reduce((total, deck) => {
            return total + (deck.cards?.length || 0);
        }, 0) * 3; // Estimate 3 reviews per card

        // Calculate notes created
        this.profileData.stats.notesCreated = notes.length;

        // Calculate goals completed
        this.profileData.stats.goalsCompleted = goals.filter(goal => goal.progress === 100).length;

        // Calculate study streak (simplified - based on recent activity)
        this.profileData.stats.studyStreak = this.calculateStudyStreak();

        // Estimate total study time (based on pomodoro sessions and activity)
        this.profileData.stats.totalStudyTime = this.estimateStudyTime();

        this.saveProfile();
    }

    calculateStudyStreak() {
        // Simplified streak calculation based on recent activity
        const recentActivity = this.getRecentActivity();
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateString = checkDate.toDateString();
            
            if (recentActivity.some(activity => 
                new Date(activity.date).toDateString() === dateString)) {
                if (i === streak) {
                    streak++;
                } else {
                    break;
                }
            } else if (i === 0) {
                // No activity today, but check yesterday
                continue;
            } else {
                break;
            }
        }
        
        return streak;
    }

    getRecentActivity() {
        const activities = [];
        
        // Get recent notes
        const notes = JSON.parse(localStorage.getItem('studysync_notes') || '[]');
        notes.forEach(note => {
            activities.push({ type: 'note', date: note.updatedAt });
        });

        // Get recent todos
        const todos = JSON.parse(localStorage.getItem('studysync_todos') || '[]');
        todos.forEach(todo => {
            if (todo.completed) {
                activities.push({ type: 'todo', date: todo.updatedAt });
            }
        });

        // Get mood entries
        const moods = JSON.parse(localStorage.getItem('studysync_mood_history') || '[]');
        moods.forEach(mood => {
            activities.push({ type: 'mood', date: mood.date });
        });

        return activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    estimateStudyTime() {
        // Estimate based on activity - simplified calculation
        const flashcardDecks = JSON.parse(localStorage.getItem('studysync_flashcard_decks') || '[]');
        const notes = JSON.parse(localStorage.getItem('studysync_notes') || '[]');
        
        let estimatedMinutes = 0;
        
        // Estimate 2 minutes per flashcard
        flashcardDecks.forEach(deck => {
            estimatedMinutes += (deck.cards?.length || 0) * 2;
        });
        
        // Estimate 10 minutes per note
        estimatedMinutes += notes.length * 10;
        
        // Add base study time
        estimatedMinutes += 120; // 2 hours base
        
        return estimatedMinutes;
    }

    renderSavedContent(contentType) {
        const container = document.getElementById(`saved-${contentType}`);
        if (!container) return;

        let content = '';
        
        switch (contentType) {
            case 'decks':
                const decks = JSON.parse(localStorage.getItem('studysync_flashcard_decks') || '[]');
                content = this.renderSavedDecks(decks);
                break;
            case 'notes':
                const notes = JSON.parse(localStorage.getItem('studysync_notes') || '[]');
                content = this.renderSavedNotes(notes);
                break;
            case 'resources':
                const resources = this.profileData.savedContent.resources;
                content = this.renderSavedResources(resources);
                break;
        }

        container.innerHTML = content;
    }

    renderSavedDecks(decks) {
        if (decks.length === 0) {
            return '<div class="empty-state"><p>No flashcard decks created yet</p></div>';
        }

        return decks.map(deck => `
            <div class="saved-item">
                <div class="saved-item-info">
                    <div class="saved-item-title">${deck.name}</div>
                    <div class="saved-item-meta">${deck.cards?.length || 0} cards • Created ${window.studySync.formatDate(deck.createdAt)}</div>
                </div>
                <button class="btn btn-outline btn-sm" onclick="window.profile.openDeck('${deck.id}')">Open</button>
            </div>
        `).join('');
    }

    renderSavedNotes(notes) {
        if (notes.length === 0) {
            return '<div class="empty-state"><p>No notes created yet</p></div>';
        }

        return notes.map(note => `
            <div class="saved-item">
                <div class="saved-item-info">
                    <div class="saved-item-title">${note.title}</div>
                    <div class="saved-item-meta">Updated ${window.studySync.formatDate(note.updatedAt)}</div>
                </div>
                <button class="btn btn-outline btn-sm" onclick="window.profile.openNote('${note.id}')">Open</button>
            </div>
        `).join('');
    }

    renderSavedResources(resources) {
        if (resources.length === 0) {
            return '<div class="empty-state"><p>No resources saved yet</p></div>';
        }

        return resources.map(resource => `
            <div class="saved-item">
                <div class="saved-item-info">
                    <div class="saved-item-title">${resource.name}</div>
                    <div class="saved-item-meta">Saved ${window.studySync.formatDate(resource.savedAt)}</div>
                </div>
                <button class="btn btn-outline btn-sm" onclick="window.profile.openResource('${resource.url}')">Open</button>
            </div>
        `).join('');
    }

    openDeck(deckId) {
        window.studySync.navigateToPage('study-tools');
        // Additional logic to open specific deck would go here
    }

    openNote(noteId) {
        window.studySync.navigateToPage('study-tools');
        // Additional logic to open specific note would go here
    }

    openResource(url) {
        window.open(url, '_blank');
    }

    saveResource(resourceName, resourceUrl) {
        const resource = {
            id: window.studySync.generateId(),
            name: resourceName,
            url: resourceUrl,
            savedAt: new Date().toISOString()
        };

        this.profileData.savedContent.resources.push(resource);
        this.saveProfile();
        window.studySync.showNotification('Resource saved to profile!');
    }

    exportAccountData() {
        const exportData = {
            profile: this.profileData,
            flashcardDecks: JSON.parse(localStorage.getItem('studysync_flashcard_decks') || '[]'),
            notes: JSON.parse(localStorage.getItem('studysync_notes') || '[]'),
            todos: JSON.parse(localStorage.getItem('studysync_todos') || '[]'),
            goals: JSON.parse(localStorage.getItem('studysync_goals') || '[]'),
            events: JSON.parse(localStorage.getItem('studysync_events') || '[]'),
            moodHistory: JSON.parse(localStorage.getItem('studysync_mood_history') || '[]'),
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `studysync-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        window.studySync.showNotification('Account data exported successfully!');
    }

    clearAllData() {
        const confirmMessage = 'Are you sure you want to clear all your data? This action cannot be undone.\n\nType "DELETE" to confirm:';
        const confirmation = prompt(confirmMessage);
        
        if (confirmation === 'DELETE') {
            // Clear all localStorage data
            const keysToRemove = [
                'studysync_profile',
                'studysync_flashcard_decks',
                'studysync_notes',
                'studysync_todos',
                'studysync_goals',
                'studysync_events',
                'studysync_mood_history',
                'studysync_pomodoro_settings'
            ];

            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });

            // Reset profile data
            this.profileData = {
                name: '',
                email: '',
                avatar: this.availableAvatars[0],
                settings: {
                    darkMode: false,
                    notifications: true,
                    autoSave: true
                },
                stats: {
                    totalStudyTime: 0,
                    studyStreak: 0,
                    flashcardsReviewed: 0,
                    quizzesTaken: 0,
                    notesCreated: 0,
                    goalsCompleted: 0
                },
                savedContent: {
                    decks: [],
                    notes: [],
                    resources: []
                }
            };

            // Reload the page to reset everything
            window.location.reload();
        } else if (confirmation !== null) {
            window.studySync.showNotification('Data clearing cancelled - confirmation text did not match', 'error');
        }
    }

    // Import data functionality
    importAccountData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                // Validate import data structure
                if (!importData.profile || !importData.version) {
                    throw new Error('Invalid data format');
                }

                // Confirm import
                if (confirm('This will replace all your current data. Are you sure you want to continue?')) {
                    // Import all data
                    Object.keys(importData).forEach(key => {
                        if (key !== 'exportDate' && key !== 'version') {
                            const storageKey = key === 'profile' ? 'studysync_profile' : `studysync_${key}`;
                            localStorage.setItem(storageKey, JSON.stringify(importData[key]));
                        }
                    });

                    window.studySync.showNotification('Data imported successfully! Reloading page...');
                    setTimeout(() => window.location.reload(), 2000);
                }
            } catch (error) {
                window.studySync.showNotification('Error importing data: Invalid file format', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Achievements system
    checkAchievements() {
        const achievements = [
            {
                id: 'first_deck',
                name: 'First Steps',
                description: 'Created your first flashcard deck',
                condition: () => JSON.parse(localStorage.getItem('studysync_flashcard_decks') || '[]').length >= 1
            },
            {
                id: 'note_taker',
                name: 'Note Taker',
                description: 'Created 10 notes',
                condition: () => JSON.parse(localStorage.getItem('studysync_notes') || '[]').length >= 10
            },
            {
                id: 'streak_master',
                name: 'Streak Master',
                description: 'Maintained a 7-day study streak',
                condition: () => this.profileData.stats.studyStreak >= 7
            },
            {
                id: 'goal_achiever',
                name: 'Goal Achiever',
                description: 'Completed your first goal',
                condition: () => this.profileData.stats.goalsCompleted >= 1
            }
        ];

        const unlockedAchievements = achievements.filter(achievement => 
            achievement.condition() && !this.hasAchievement(achievement.id)
        );

        unlockedAchievements.forEach(achievement => {
            this.unlockAchievement(achievement);
        });
    }

    hasAchievement(achievementId) {
        return this.profileData.achievements?.includes(achievementId) || false;
    }

    unlockAchievement(achievement) {
        if (!this.profileData.achievements) {
            this.profileData.achievements = [];
        }
        
        this.profileData.achievements.push(achievement.id);
        this.saveProfile();
        
        // Show achievement notification
        this.showAchievementNotification(achievement);
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">🏆</div>
                <div class="achievement-text">
                    <h4>Achievement Unlocked!</h4>
                    <p><strong>${achievement.name}</strong></p>
                    <p>${achievement.description}</p>
                </div>
            </div>
        `;

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: '10001',
            maxWidth: '300px',
            animation: 'slideInRight 0.5s ease-out'
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-in';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 500);
        }, 5000);
    }
}

// Initialize profile when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profile = new Profile();
    
    // Check for achievements periodically
    setInterval(() => {
        window.profile.checkAchievements();
    }, 30000); // Check every 30 seconds
});

// Handle contact form submission
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    contactForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('contact-name').value,
            email: document.getElementById('contact-email').value,
            subject: document.getElementById('contact-subject').value,
            message: document.getElementById('contact-message').value
        };

        // Simulate form submission
        window.studySync.showNotification('Message sent successfully! We\'ll get back to you soon.');
        contactForm.reset();
    });
});

// Handle resource saving
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.save-resource').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const resourceName = btn.getAttribute('data-resource');
            const resourceUrl = btn.closest('.resource-card').querySelector('a').href;
            window.profile.saveResource(resourceName, resourceUrl);
        });
    });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Profile;
}