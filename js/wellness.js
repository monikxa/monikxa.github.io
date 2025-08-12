// StudySync - Wellness & Focus

class Wellness {
    constructor() {
        this.musicPlayer = {
            isPlaying: false,
            currentTrack: 0,
            volume: 0.5,
            tracks: [
                {
                    title: 'Ambient Study Mix',
                    artist: 'Free Music Archive',
                    url: 'https://freemusicarchive.org/track/Kai_Engel_-_Chillhop_Essentials_-_01_-_Chillhop_Essentials/stream/'
                }
            ]
        };
        this.moodHistory = [];
        this.currentMood = null;
        this.init();
    }

    init() {
        this.loadData();
        this.setupMusicPlayer();
        this.setupMoodTracker();
        this.renderMoodHistory();
    }

    loadData() {
        // Load mood history
        const savedMoods = localStorage.getItem('studysync_mood_history');
        this.moodHistory = savedMoods ? JSON.parse(savedMoods) : [];
    }

    saveData() {
        localStorage.setItem('studysync_mood_history', JSON.stringify(this.moodHistory));
    }

    // MUSIC PLAYER
    setupMusicPlayer() {
        const playBtn = document.getElementById('play-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const volumeSlider = document.getElementById('volume-slider');
        const audioPlayer = document.getElementById('audio-player');

        if (!audioPlayer) return;

        playBtn?.addEventListener('click', () => {
            this.playMusic();
        });

        pauseBtn?.addEventListener('click', () => {
            this.pauseMusic();
        });

        volumeSlider?.addEventListener('input', (e) => {
            this.setVolume(e.target.value / 100);
        });

        // Set initial volume
        audioPlayer.volume = this.musicPlayer.volume;
        if (volumeSlider) {
            volumeSlider.value = this.musicPlayer.volume * 100;
        }

        // Handle audio events
        audioPlayer.addEventListener('loadstart', () => {
            console.log('Loading audio...');
        });

        audioPlayer.addEventListener('canplay', () => {
            console.log('Audio ready to play');
        });

        audioPlayer.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            window.studySync.showNotification('Unable to load music. Please check your connection.', 'error');
        });

        audioPlayer.addEventListener('ended', () => {
            this.nextTrack();
        });
    }

    playMusic() {
        const audioPlayer = document.getElementById('audio-player');
        const playBtn = document.getElementById('play-btn');
        const pauseBtn = document.getElementById('pause-btn');

        if (!audioPlayer) return;

        // For demo purposes, we'll simulate music playing since we can't guarantee external audio sources
        this.simulateMusicPlayback();

        audioPlayer.play().then(() => {
            this.musicPlayer.isPlaying = true;
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
            window.studySync.showNotification('Music started playing');
        }).catch((error) => {
            console.error('Error playing audio:', error);
            // Fallback to simulation
            this.simulateMusicPlayback();
        });
    }

    pauseMusic() {
        const audioPlayer = document.getElementById('audio-player');
        const playBtn = document.getElementById('play-btn');
        const pauseBtn = document.getElementById('pause-btn');

        if (audioPlayer) {
            audioPlayer.pause();
        }

        this.musicPlayer.isPlaying = false;
        playBtn.style.display = 'inline-block';
        pauseBtn.style.display = 'none';
        window.studySync.showNotification('Music paused');
    }

    setVolume(volume) {
        const audioPlayer = document.getElementById('audio-player');
        this.musicPlayer.volume = Math.max(0, Math.min(1, volume));
        
        if (audioPlayer) {
            audioPlayer.volume = this.musicPlayer.volume;
        }
    }

    nextTrack() {
        // For demo purposes, just restart the current track
        this.musicPlayer.currentTrack = (this.musicPlayer.currentTrack + 1) % this.musicPlayer.tracks.length;
        this.updateTrackInfo();
        
        if (this.musicPlayer.isPlaying) {
            this.playMusic();
        }
    }

    updateTrackInfo() {
        const track = this.musicPlayer.tracks[this.musicPlayer.currentTrack];
        const titleElement = document.getElementById('track-title');
        const artistElement = document.querySelector('.track-artist');

        if (titleElement) titleElement.textContent = track.title;
        if (artistElement) artistElement.textContent = track.artist;
    }

    simulateMusicPlayback() {
        // Simulate music playing for demo purposes
        this.musicPlayer.isPlaying = true;
        const playBtn = document.getElementById('play-btn');
        const pauseBtn = document.getElementById('pause-btn');
        
        if (playBtn) playBtn.style.display = 'none';
        if (pauseBtn) pauseBtn.style.display = 'inline-block';
        
        window.studySync.showNotification('🎵 Focus music is now playing (demo mode)');
    }

    // MOOD TRACKER
    setupMoodTracker() {
        const moodButtons = document.querySelectorAll('.mood-btn');
        const saveMoodBtn = document.getElementById('save-mood');

        moodButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                moodButtons.forEach(b => b.classList.remove('selected'));
                
                // Add active class to clicked button
                btn.classList.add('selected');
                
                // Store selected mood
                this.currentMood = {
                    emoji: btn.getAttribute('data-mood'),
                    label: btn.getAttribute('data-label')
                };
            });
        });

        saveMoodBtn?.addEventListener('click', () => {
            this.saveMood();
        });

        // Check if mood already recorded today
        this.checkTodaysMood();
    }

    checkTodaysMood() {
        const today = new Date().toDateString();
        const todaysMood = this.moodHistory.find(mood => 
            new Date(mood.date).toDateString() === today
        );

        if (todaysMood) {
            // Highlight the mood that was already selected today
            const moodBtn = document.querySelector(`[data-mood="${todaysMood.emoji}"]`);
            if (moodBtn) {
                moodBtn.classList.add('selected');
                this.currentMood = {
                    emoji: todaysMood.emoji,
                    label: todaysMood.label
                };
            }

            // Show the note if it exists
            const noteTextarea = document.getElementById('mood-note');
            if (noteTextarea && todaysMood.note) {
                noteTextarea.value = todaysMood.note;
            }
        }
    }

    saveMood() {
        if (!this.currentMood) {
            window.studySync.showNotification('Please select a mood first', 'error');
            return;
        }

        const note = document.getElementById('mood-note')?.value.trim() || '';
        const today = new Date().toDateString();
        
        // Check if mood already exists for today
        const existingMoodIndex = this.moodHistory.findIndex(mood => 
            new Date(mood.date).toDateString() === today
        );

        const moodEntry = {
            id: existingMoodIndex >= 0 ? this.moodHistory[existingMoodIndex].id : window.studySync.generateId(),
            emoji: this.currentMood.emoji,
            label: this.currentMood.label,
            note: note,
            date: new Date().toISOString()
        };

        if (existingMoodIndex >= 0) {
            // Update existing mood
            this.moodHistory[existingMoodIndex] = moodEntry;
            window.studySync.showNotification('Mood updated for today!');
        } else {
            // Add new mood
            this.moodHistory.unshift(moodEntry);
            window.studySync.showNotification('Mood saved for today!');
        }

        // Keep only last 30 days
        this.moodHistory = this.moodHistory.slice(0, 30);

        this.saveData();
        this.renderMoodHistory();
    }

    renderMoodHistory() {
        const timeline = document.getElementById('mood-timeline');
        if (!timeline) return;

        if (this.moodHistory.length === 0) {
            timeline.innerHTML = `
                <div class="empty-state">
                    <p>No mood entries yet. Start tracking your daily mood!</p>
                </div>
            `;
            return;
        }

        timeline.innerHTML = this.moodHistory.slice(0, 7).map(mood => `
            <div class="mood-entry">
                <div class="mood-date">${this.formatMoodDate(mood.date)}</div>
                <div class="mood-emoji">${mood.emoji}</div>
                <div class="mood-note">${mood.note || mood.label}</div>
            </div>
        `).join('');
    }

    formatMoodDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }

    // WELLNESS INSIGHTS
    getMoodInsights() {
        if (this.moodHistory.length < 7) {
            return {
                trend: 'insufficient_data',
                message: 'Track your mood for at least a week to see insights'
            };
        }

        const recentMoods = this.moodHistory.slice(0, 7);
        const moodValues = {
            '😢': 1,
            '😐': 2,
            '🙂': 3,
            '😊': 4,
            '🤩': 5
        };

        const averageMood = recentMoods.reduce((sum, mood) => 
            sum + (moodValues[mood.emoji] || 3), 0) / recentMoods.length;

        let trend, message;
        if (averageMood >= 4) {
            trend = 'positive';
            message = 'You\'ve been feeling great lately! Keep up the good work.';
        } else if (averageMood >= 3) {
            trend = 'neutral';
            message = 'Your mood has been stable. Consider activities that bring you joy.';
        } else {
            trend = 'concerning';
            message = 'You might be going through a tough time. Consider talking to someone or taking breaks.';
        }

        return { trend, message, averageMood };
    }

    // FOCUS TIPS
    getRandomFocusTip() {
        const tips = [
            {
                icon: '🧠',
                title: 'Take Brain Breaks',
                text: 'Every 90 minutes, take a 15-20 minute break to let your brain rest and consolidate information.'
            },
            {
                icon: '💧',
                title: 'Stay Hydrated',
                text: 'Dehydration can reduce concentration by up to 12%. Keep a water bottle nearby.'
            },
            {
                icon: '🌱',
                title: 'Add Some Green',
                text: 'Having plants in your study space can improve concentration and reduce stress.'
            },
            {
                icon: '🎵',
                title: 'Choose the Right Music',
                text: 'Instrumental music or nature sounds can help maintain focus without being distracting.'
            },
            {
                icon: '🌅',
                title: 'Natural Light',
                text: 'Study near a window when possible. Natural light helps regulate your circadian rhythm and improves alertness.'
            }
        ];

        return tips[Math.floor(Math.random() * tips.length)];
    }

    // SCREEN TIME REMINDERS
    setupScreenTimeReminders() {
        // 20-20-20 rule reminder
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.show2020Reminder();
            }
        }, 20 * 60 * 1000); // Every 20 minutes
    }

    show2020Reminder() {
        const reminder = document.createElement('div');
        reminder.className = 'screen-time-reminder';
        reminder.innerHTML = `
            <div class="reminder-content">
                <h4>👀 20-20-20 Break Time!</h4>
                <p>Look at something 20 feet away for 20 seconds</p>
                <button class="btn btn-primary btn-sm" onclick="this.parentElement.parentElement.remove()">Done</button>
            </div>
        `;

        Object.assign(reminder.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: '10000',
            textAlign: 'center',
            maxWidth: '300px'
        });

        document.body.appendChild(reminder);

        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (reminder.parentElement) {
                reminder.remove();
            }
        }, 30000);
    }

    // WELLNESS DASHBOARD
    getWellnessScore() {
        const insights = this.getMoodInsights();
        let score = 50; // Base score

        if (insights.trend === 'positive') {
            score += 30;
        } else if (insights.trend === 'neutral') {
            score += 10;
        } else if (insights.trend === 'concerning') {
            score -= 20;
        }

        // Add points for consistent mood tracking
        if (this.moodHistory.length >= 7) {
            score += 10;
        }

        // Add points for using focus music
        if (this.musicPlayer.isPlaying) {
            score += 10;
        }

        return Math.max(0, Math.min(100, score));
    }

    getWellnessRecommendations() {
        const recommendations = [];
        const insights = this.getMoodInsights();

        if (insights.trend === 'concerning') {
            recommendations.push({
                type: 'urgent',
                title: 'Consider Taking a Break',
                description: 'Your recent mood entries suggest you might be stressed. Consider taking longer breaks or talking to someone.'
            });
        }

        if (this.moodHistory.length < 7) {
            recommendations.push({
                type: 'suggestion',
                title: 'Track Your Mood Daily',
                description: 'Consistent mood tracking helps identify patterns and improve self-awareness.'
            });
        }

        if (!this.musicPlayer.isPlaying) {
            recommendations.push({
                type: 'tip',
                title: 'Try Focus Music',
                description: 'Background music can help improve concentration and create a better study environment.'
            });
        }

        return recommendations;
    }

    // EXPORT WELLNESS DATA
    exportWellnessData() {
        const data = {
            moodHistory: this.moodHistory,
            wellnessScore: this.getWellnessScore(),
            insights: this.getMoodInsights(),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `studysync-wellness-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        window.studySync.showNotification('Wellness data exported successfully!');
    }
}

// Initialize wellness when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.wellness = new Wellness();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Wellness;
}