// StudySync - Main JavaScript

class StudySync {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    init() {
        this.setupIntroAnimation();
        this.setupNavigation();
        this.setupScrollAnimations();
        this.setupTestimonialCarousel();
        this.setupMobileMenu();
        this.loadDemoData();
    }

    setupIntroAnimation() {
        const introScreen = document.getElementById('intro-screen');
        const navbar = document.getElementById('navbar');
        const mainContent = document.getElementById('main-content');

        // Hide intro screen after animation
        setTimeout(() => {
            introScreen.style.display = 'none';
            navbar.style.opacity = '1';
            mainContent.style.opacity = '1';
            this.triggerScrollAnimations();
        }, 4000);
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const pages = document.querySelectorAll('.page');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = link.getAttribute('data-page');
                this.navigateToPage(targetPage);
            });
        });

        // Handle CTA buttons
        document.getElementById('get-started-btn')?.addEventListener('click', () => {
            this.navigateToPage('study-tools');
        });

        document.getElementById('try-tools-btn')?.addEventListener('click', () => {
            this.navigateToPage('study-tools');
        });
    }

    navigateToPage(pageId) {
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageId}"]`)?.classList.add('active');

        // Show target page
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId)?.classList.add('active');

        this.currentPage = pageId;
        this.triggerScrollAnimations();

        // Close mobile menu if open
        document.getElementById('nav-menu')?.classList.remove('active');
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');
                }
            });
        }, observerOptions);

        // Observe all elements with data-aos attribute
        document.querySelectorAll('[data-aos]').forEach(el => {
            observer.observe(el);
        });
    }

    triggerScrollAnimations() {
        // Manually trigger animations for visible elements
        setTimeout(() => {
            document.querySelectorAll('[data-aos]').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    el.classList.add('aos-animate');
                }
            });
        }, 100);
    }

    setupTestimonialCarousel() {
        const testimonials = document.querySelectorAll('.testimonial');
        const dots = document.querySelectorAll('.dot');
        let currentSlide = 0;

        const showSlide = (index) => {
            testimonials.forEach((testimonial, i) => {
                testimonial.classList.toggle('active', i === index);
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
            });
        });

        // Auto-advance testimonials
        setInterval(() => {
            currentSlide = (currentSlide + 1) % testimonials.length;
            showSlide(currentSlide);
        }, 5000);
    }

    setupMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        navToggle?.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle?.contains(e.target) && !navMenu?.contains(e.target)) {
                navMenu?.classList.remove('active');
            }
        });
    }

    loadDemoData() {
        // Load demo data for all tools
        this.loadDemoFlashcards();
        this.loadDemoNotes();
        this.loadDemoTodos();
        this.loadDemoGoals();
        this.loadDemoEvents();
    }

    loadDemoFlashcards() {
        const demoDecks = [
            {
                id: 'demo-1',
                name: 'Spanish Vocabulary',
                tags: ['spanish', 'vocabulary', 'beginner'],
                color: '#E37083',
                cards: [
                    { front: 'Hello', back: 'Hola' },
                    { front: 'Goodbye', back: 'Adiós' },
                    { front: 'Thank you', back: 'Gracias' },
                    { front: 'Please', back: 'Por favor' },
                    { front: 'Yes', back: 'Sí' }
                ],
                createdAt: new Date().toISOString()
            },
            {
                id: 'demo-2',
                name: 'Math Formulas',
                tags: ['math', 'formulas', 'algebra'],
                color: '#A8BF8A',
                cards: [
                    { front: 'Quadratic Formula', back: 'x = (-b ± √(b²-4ac)) / 2a' },
                    { front: 'Pythagorean Theorem', back: 'a² + b² = c²' },
                    { front: 'Area of Circle', back: 'A = πr²' }
                ],
                createdAt: new Date().toISOString()
            }
        ];

        localStorage.setItem('studysync_flashcard_decks', JSON.stringify(demoDecks));
    }

    loadDemoNotes() {
        const demoNotes = [
            {
                id: 'note-1',
                title: 'Study Tips for Better Learning',
                content: 'Active recall is one of the most effective study techniques. Instead of just re-reading notes, try to recall information from memory. Use spaced repetition to review material at increasing intervals.',
                tags: ['study-tips', 'learning', 'memory'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'note-2',
                title: 'Time Management Strategies',
                content: 'The Pomodoro Technique involves working for 25 minutes followed by a 5-minute break. This helps maintain focus and prevents burnout. Plan your day the night before to start with clear priorities.',
                tags: ['time-management', 'productivity', 'pomodoro'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'note-3',
                title: 'Healthy Study Habits',
                content: 'Maintain good posture while studying. Take regular breaks to stretch and move around. Stay hydrated and eat brain-healthy foods like nuts, berries, and fish.',
                tags: ['health', 'wellness', 'habits'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        localStorage.setItem('studysync_notes', JSON.stringify(demoNotes));
    }

    loadDemoTodos() {
        const demoTodos = [
            {
                id: 'todo-1',
                text: 'Review Spanish flashcards',
                completed: false,
                priority: 'high',
                dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                createdAt: new Date().toISOString()
            },
            {
                id: 'todo-2',
                text: 'Complete math homework',
                completed: false,
                priority: 'medium',
                dueDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
                createdAt: new Date().toISOString()
            },
            {
                id: 'todo-3',
                text: 'Organize study notes',
                completed: true,
                priority: 'low',
                dueDate: new Date().toISOString(),
                createdAt: new Date(Date.now() - 86400000).toISOString() // Yesterday
            }
        ];

        localStorage.setItem('studysync_todos', JSON.stringify(demoTodos));
    }

    loadDemoGoals() {
        const demoGoals = [
            {
                id: 'goal-1',
                name: 'Master Spanish Basics',
                targetDate: new Date(Date.now() + 30 * 86400000).toISOString(), // 30 days from now
                progress: 65,
                milestones: [
                    { name: 'Learn 100 vocabulary words', completed: true },
                    { name: 'Complete basic grammar', completed: true },
                    { name: 'Have first conversation', completed: false }
                ],
                createdAt: new Date().toISOString()
            },
            {
                id: 'goal-2',
                name: 'Improve Math Grade',
                targetDate: new Date(Date.now() + 60 * 86400000).toISOString(), // 60 days from now
                progress: 40,
                milestones: [
                    { name: 'Complete all homework', completed: false },
                    { name: 'Score 90% on next test', completed: false },
                    { name: 'Get extra help from teacher', completed: true }
                ],
                createdAt: new Date().toISOString()
            }
        ];

        localStorage.setItem('studysync_goals', JSON.stringify(demoGoals));
    }

    loadDemoEvents() {
        const demoEvents = [
            {
                id: 'event-1',
                title: 'Math Test',
                date: new Date(Date.now() + 7 * 86400000).toISOString(), // Next week
                time: '10:00',
                notes: 'Chapter 5-7, bring calculator',
                tags: ['test', 'math'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'event-2',
                title: 'Spanish Study Group',
                date: new Date(Date.now() + 3 * 86400000).toISOString(), // 3 days from now
                time: '15:00',
                notes: 'Practice conversation with classmates',
                tags: ['study-group', 'spanish'],
                createdAt: new Date().toISOString()
            }
        ];

        localStorage.setItem('studysync_events', JSON.stringify(demoEvents));
    }

    // Utility methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    generateId() {
        return 'id-' + Math.random().toString(36).substr(2, 9);
    }

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            backgroundColor: type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'
        });

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.studySync = new StudySync();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudySync;
}

// Authentication functionality
let currentUser = null;

// Initialize auth flow
document.addEventListener('DOMContentLoaded', function() {
    // Hide main content initially
    document.getElementById('main-content').style.display = 'none';
    
    // Show intro screen for 3 seconds, then auth screen
    setTimeout(() => {
        document.getElementById('intro-screen').classList.add('hidden');
        setTimeout(() => {
            document.getElementById('auth-screen').classList.add('active');
        }, 400);
    }, 3000);
});

// Tab switching functionality
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        
        // Update active tab
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        
        // Show corresponding form
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById(`${tabName}-form`).classList.add('active');
    });
});

// Login form handler
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (email && password) {
        showLoading();
        
        // Simulate API call delay
        setTimeout(() => {
            login(email, password);
        }, 1500);
    }
});

// Signup form handler
document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    if (name && email && password && confirmPassword) {
        showLoading();
        
        // Simulate API call delay
        setTimeout(() => {
            signup(name, email, password);
        }, 1500);
    }
});

function showLoading() {
    document.getElementById('loading-overlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('active');
}

function login(email, password) {
    // Simulate login process
    currentUser = {
        name: email.split('@')[0],
        email: email
    };
    
    hideLoading();
    showMainContent();
}

function signup(name, email, password) {
    // Simulate signup process
    currentUser = {
        name: name,
        email: email
    };
    
    hideLoading();
    showMainContent();
}

function showMainContent() {
    // Hide auth screen
    document.getElementById('auth-screen').classList.add('hidden');
    
    // Show main content
    setTimeout(() => {
        document.getElementById('main-content').style.display = 'block';
        document.getElementById('main-content').classList.add('active');
        updateWelcomeMessage();
    }, 800);
}

function updateWelcomeMessage() {
    if (currentUser) {
        document.getElementById('welcome-message').textContent = `Welcome, ${currentUser.name}!`;
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        
        // Hide main content
        document.getElementById('main-content').classList.remove('active');
        document.getElementById('main-content').style.display = 'none';
        
        // Reset forms
        document.getElementById('login-form').reset();
        document.getElementById('signup-form').reset();
        
        // Show auth screen again
        setTimeout(() => {
            document.getElementById('auth-screen').classList.remove('hidden');
            document.getElementById('auth-screen').classList.add('active');
        }, 300);
    }
}

// Password strength and confirmation validation
document.getElementById('signup-password').addEventListener('input', (e) => {
    const password = e.target.value;
    const isStrong = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
    
    if (password.length > 0) {
        e.target.style.borderColor = isStrong ? '#A8BF8A' : '#F49AA2';
    } else {
        e.target.style.borderColor = '#e1e5e9';
    }
});

document.getElementById('signup-confirm-password').addEventListener('input', (e) => {
    const password = document.getElementById('signup-password').value;
    const confirmPassword = e.target.value;
    
    if (confirmPassword.length > 0) {
        e.target.style.borderColor = password === confirmPassword ? '#A8BF8A' : '#F49AA2';
    } else {
        e.target.style.borderColor = '#e1e5e9';
    }
});
