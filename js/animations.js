// StudySync - Animation Controller

class AnimationController {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupHoverAnimations();
        this.setupParallaxEffects();
        this.setupMorphingShapes();
        this.setupTextAnimations();
    }

    setupScrollAnimations() {
        // Enhanced scroll-triggered animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerAnimation(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for animations
        document.querySelectorAll('[data-aos]').forEach(el => {
            animationObserver.observe(el);
        });

        // Setup stagger animations
        this.setupStaggerAnimations();
    }

    triggerAnimation(element) {
        const animationType = element.getAttribute('data-aos');
        const delay = element.getAttribute('data-aos-delay') || 0;

        setTimeout(() => {
            element.classList.add('aos-animate');
            
            // Add specific animation classes based on type
            switch (animationType) {
                case 'fade-up':
                    element.style.transform = 'translateY(0)';
                    element.style.opacity = '1';
                    break;
                case 'fade-down':
                    element.style.transform = 'translateY(0)';
                    element.style.opacity = '1';
                    break;
                case 'fade-left':
                    element.style.transform = 'translateX(0)';
                    element.style.opacity = '1';
                    break;
                case 'fade-right':
                    element.style.transform = 'translateX(0)';
                    element.style.opacity = '1';
                    break;
                case 'zoom-in':
                    element.style.transform = 'scale(1)';
                    element.style.opacity = '1';
                    break;
                case 'bounce':
                    element.style.animation = 'bounce 0.6s ease-out';
                    break;
                case 'pulse':
                    element.style.animation = 'pulse 1s ease-in-out';
                    break;
            }
        }, delay);
    }

    setupStaggerAnimations() {
        const staggerContainers = document.querySelectorAll('[data-stagger]');
        
        staggerContainers.forEach(container => {
            const children = container.children;
            const staggerDelay = parseInt(container.getAttribute('data-stagger')) || 100;
            
            Array.from(children).forEach((child, index) => {
                child.classList.add('stagger-item');
                child.style.transitionDelay = `${index * staggerDelay}ms`;
            });

            // Trigger stagger animation when container is visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        Array.from(children).forEach(child => {
                            child.classList.add('animate');
                        });
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(container);
        });
    }

    setupHoverAnimations() {
        // Enhanced hover effects
        document.querySelectorAll('.hover-lift').forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'translateY(-8px)';
                element.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            });

            element.addEventListener('mouseleave', () => {
                element.style.transform = 'translateY(0)';
                element.style.boxShadow = '';
            });
        });

        document.querySelectorAll('.hover-scale').forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'scale(1.05)';
            });

            element.addEventListener('mouseleave', () => {
                element.style.transform = 'scale(1)';
            });
        });

        document.querySelectorAll('.hover-glow').forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.boxShadow = '0 0 20px rgba(227, 112, 131, 0.3)';
            });

            element.addEventListener('mouseleave', () => {
                element.style.boxShadow = '';
            });
        });
    }

    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.parallax');
        
        if (parallaxElements.length === 0) return;

        const handleScroll = () => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const rate = scrolled * -0.5;
                element.style.transform = `translateY(${rate}px)`;
            });
        };

        // Throttle scroll events for performance
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    setupMorphingShapes() {
        document.querySelectorAll('.morph-shape').forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.borderRadius = '50%';
                element.style.transform = 'rotate(45deg)';
            });

            element.addEventListener('mouseleave', () => {
                element.style.borderRadius = '';
                element.style.transform = 'rotate(0deg)';
            });
        });
    }

    setupTextAnimations() {
        // Typewriter effect
        document.querySelectorAll('.typewriter').forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            element.style.borderRight = '2px solid var(--primary-pink)';
            
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                } else {
                    // Blinking cursor effect
                    setInterval(() => {
                        element.style.borderRight = element.style.borderRight === 'none' 
                            ? '2px solid var(--primary-pink)' 
                            : 'none';
                    }, 500);
                }
            };
            
            // Start typewriter when element is visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        typeWriter();
                        observer.unobserve(element);
                    }
                });
            });
            
            observer.observe(element);
        });

        // Text gradient animation
        document.querySelectorAll('.text-gradient').forEach(element => {
            element.style.backgroundSize = '200% 200%';
            element.style.animation = 'gradientShift 3s ease-in-out infinite';
        });
    }

    // Card flip animation
    flipCard(cardElement) {
        cardElement.classList.toggle('flipped');
    }

    // Progress bar animation
    animateProgressBar(progressBar, targetWidth) {
        const progressFill = progressBar.querySelector('.progress-fill');
        if (!progressFill) return;

        let currentWidth = 0;
        const increment = targetWidth / 50; // 50 steps for smooth animation
        
        const animate = () => {
            if (currentWidth < targetWidth) {
                currentWidth += increment;
                progressFill.style.width = `${Math.min(currentWidth, targetWidth)}%`;
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    // Loading animations
    showLoadingSpinner(container) {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = '<div></div><div></div><div></div><div></div>';
        container.appendChild(spinner);
        return spinner;
    }

    showLoadingDots(container) {
        const dots = document.createElement('div');
        dots.className = 'loading-dots';
        dots.innerHTML = '<span></span><span></span><span></span>';
        container.appendChild(dots);
        return dots;
    }

    hideLoading(loadingElement) {
        if (loadingElement && loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }
    }

    // Reveal animation for elements
    revealElement(element, delay = 0) {
        setTimeout(() => {
            element.classList.add('revealed');
        }, delay);
    }

    // Shake animation for errors
    shakeElement(element) {
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    // Pulse animation for notifications
    pulseElement(element) {
        element.style.animation = 'pulse 1s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 1000);
    }

    // Bounce animation for success
    bounceElement(element) {
        element.style.animation = 'bounce 0.6s ease-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 600);
    }

    // Glow animation for highlights
    glowElement(element, duration = 2000) {
        element.style.animation = 'glow 1s ease-in-out infinite';
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    // Smooth scroll to element
    scrollToElement(element, offset = 0) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // Page transition animation
    transitionToPage(fromPage, toPage, callback) {
        // Fade out current page
        fromPage.style.opacity = '0';
        fromPage.style.transform = 'translateX(-50px)';
        
        setTimeout(() => {
            fromPage.classList.remove('active');
            toPage.classList.add('active');
            
            // Fade in new page
            toPage.style.opacity = '0';
            toPage.style.transform = 'translateX(50px)';
            
            setTimeout(() => {
                toPage.style.opacity = '1';
                toPage.style.transform = 'translateX(0)';
                
                if (callback) callback();
            }, 50);
        }, 300);
    }

    // Cleanup animations on page unload
    cleanup() {
        // Remove all animation observers
        if (this.animationObserver) {
            this.animationObserver.disconnect();
        }
        
        // Clear any running intervals
        if (this.intervals) {
            this.intervals.forEach(interval => clearInterval(interval));
        }
        
        // Clear any running timeouts
        if (this.timeouts) {
            this.timeouts.forEach(timeout => clearTimeout(timeout));
        }
    }
}

// Initialize animation controller
document.addEventListener('DOMContentLoaded', () => {
    window.animationController = new AnimationController();
});

// Handle reduced motion preference
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Disable animations for users who prefer reduced motion
    document.documentElement.style.setProperty('--transition-fast', '0s');
    document.documentElement.style.setProperty('--transition-normal', '0s');
    document.documentElement.style.setProperty('--transition-slow', '0s');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationController;
}