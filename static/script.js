// Notes App JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initializeApp();
});

function initializeApp() {
    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add form validation
    setupFormValidation();
    
    // Add loading states to buttons
    setupLoadingStates();
    
    // Add keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Add auto-save functionality for forms
    setupAutoSave();
    
    // Add note card animations
    setupNoteCardAnimations();
}

function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const titleInput = form.querySelector('input[name="title"]');
            const contentInput = form.querySelector('textarea[name="content"]');
            
            if (titleInput && contentInput) {
                const title = titleInput.value.trim();
                const content = contentInput.value.trim();
                
                if (!title || !content) {
                    e.preventDefault();
                    showAlert('Please fill in both title and content fields', 'error');
                    return;
                }
                
                if (title.length < 3) {
                    e.preventDefault();
                    showAlert('Title must be at least 3 characters long', 'error');
                    return;
                }
                
                if (content.length < 10) {
                    e.preventDefault();
                    showAlert('Content must be at least 10 characters long', 'error');
                    return;
                }
            }
        });
    });
}

function setupLoadingStates() {
    const submitButtons = document.querySelectorAll('button[type="submit"]');
    
    submitButtons.forEach(button => {
        button.addEventListener('click', function() {
            const form = this.closest('form');
            if (form && form.checkValidity()) {
                this.disabled = true;
                this.innerHTML = '<div class="loading"></div> Saving...';
                
                // Re-enable button after a delay (in case of errors)
                setTimeout(() => {
                    this.disabled = false;
                    this.innerHTML = this.innerHTML.replace('<div class="loading"></div> Saving...', 'Save Note');
                }, 5000);
            }
        });
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl+N or Cmd+N for new note
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            const addButton = document.querySelector('a[href*="add"]');
            if (addButton) {
                addButton.click();
            }
        }
        
        // Escape key to cancel forms
        if (e.key === 'Escape') {
            const cancelButton = document.querySelector('a[href="/"]');
            if (cancelButton && window.location.pathname !== '/') {
                cancelButton.click();
            }
        }
    });
}

function setupAutoSave() {
    const titleInput = document.querySelector('input[name="title"]');
    const contentInput = document.querySelector('textarea[name="content"]');
    
    if (titleInput && contentInput) {
        let autoSaveTimer;
        
        function saveToLocalStorage() {
            const data = {
                title: titleInput.value,
                content: contentInput.value,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('noteAutoSave', JSON.stringify(data));
            showAlert('Auto-saved', 'success', 1000);
        }
        
        function loadFromLocalStorage() {
            const saved = localStorage.getItem('noteAutoSave');
            if (saved) {
                const data = JSON.parse(saved);
                if (!titleInput.value && !contentInput.value) {
                    titleInput.value = data.title;
                    contentInput.value = data.content;
                    showAlert('Restored from auto-save', 'info', 2000);
                }
            }
        }
        
        // Load saved data on page load
        loadFromLocalStorage();
        
        // Auto-save on input
        [titleInput, contentInput].forEach(input => {
            input.addEventListener('input', function() {
                clearTimeout(autoSaveTimer);
                autoSaveTimer = setTimeout(saveToLocalStorage, 2000);
            });
        });
        
        // Clear auto-save on form submit
        const form = document.querySelector('form');
        if (form) {
            form.addEventListener('submit', function() {
                localStorage.removeItem('noteAutoSave');
            });
        }
    }
}

function setupNoteCardAnimations() {
    const noteCards = document.querySelectorAll('.note-card');
    
    // Stagger animation for note cards
    noteCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Add intersection observer for scroll animations
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        });
        
        noteCards.forEach(card => {
            observer.observe(card);
        });
    }
}

function showAlert(message, type = 'info', duration = 3000) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert-toast');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-toast`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        min-width: 300px;
        padding: 15px;
        border-radius: 10px;
        font-weight: bold;
        animation: slideInRight 0.3s ease-out;
    `;
    
    alert.innerHTML = `
        <i class="fas fa-${getAlertIcon(type)}"></i> ${message}
        <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: inherit; cursor: pointer; font-size: 1.2rem;">&times;</button>
    `;
    
    document.body.appendChild(alert);
    
    // Auto-remove alert
    setTimeout(() => {
        if (alert.parentElement) {
            alert.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => alert.remove(), 300);
        }
    }, duration);
}

function getAlertIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-triangle';
        case 'warning': return 'exclamation-circle';
        default: return 'info-circle';
    }
}

// Character counter for textarea
function