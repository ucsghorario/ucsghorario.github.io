// Main application controller
class UCEGScheduleApp {
    constructor() {
        this.currentUser = null;
        this.currentUserType = null;
        this.currentScreen = 'login';
        this.scheduleManager = new ScheduleManager();
        this.authManager = new AuthManager();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStoredData();
        this.hideLoading();
        
        // Initialize tooltips and other UI components
        this.initializeUI();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
        });

        // Password toggle
        document.getElementById('togglePassword').addEventListener('click', () => {
            this.togglePasswordVisibility();
        });

        // User menu toggle
        document.getElementById('userButton')?.addEventListener('click', () => {
            this.toggleUserMenu();
        });

        // Close user menu when clicking outside
        document.addEventListener('click', (e) => {
            const userMenu = document.getElementById('userMenu');
            if (userMenu && !userMenu.contains(e.target)) {
                userMenu.classList.remove('active');
            }
        });

        // Form validation
        this.setupFormValidation();

        // Keyboard navigation
        this.setupKeyboardNavigation();
    }

    setupFormValidation() {
        const emailInput = document.getElementById('usuario');
        const passwordInput = document.getElementById('password');

        emailInput.addEventListener('input', () => {
            this.validateEmail(emailInput.value);
        });

        emailInput.addEventListener('blur', () => {
            this.validateEmail(emailInput.value);
        });

        passwordInput.addEventListener('input', () => {
            this.validatePassword(passwordInput.value);
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close modals, menus, etc.
                document.getElementById('userMenu')?.classList.remove('active');
            }
        });
    }

    validateEmail(email) {
        const emailError = document.getElementById('usuarioError');
        const emailRegex = /^[a-zA-Z0-9._%+-]+@cu\.ucsg\.edu\.ec$/;
        
        if (!email) {
            this.showFieldError('usuarioError', '');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            this.showFieldError('usuarioError', 'Debe usar un correo institucional válido (@cu.ucsg.edu.ec)');
            return false;
        }
        
        this.hideFieldError('usuarioError');
        return true;
    }

    validatePassword(password) {
        const passwordError = document.getElementById('passwordError');
        
        if (!password) {
            this.showFieldError('passwordError', '');
            return false;
        }
        
        if (password.length < 6) {
            this.showFieldError('passwordError', 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        
        this.hideFieldError('passwordError');
        return true;
    }

    showFieldError(fieldId, message) {
        const errorElement = document.getElementById(fieldId);
        errorElement.textContent = message;
        errorElement.classList.add('active');
    }

    hideFieldError(fieldId) {
        const errorElement = document.getElementById(fieldId);
        errorElement.classList.remove('active');
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.querySelector('#togglePassword i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            toggleIcon.className = 'fas fa-eye';
        }
    }

    toggleUserMenu() {
        const userMenu = document.getElementById('userMenu');
        userMenu.classList.toggle('active');
    }

    initializeUI() {
        // Initialize any additional UI components
        this.setupAnimations();
    }

    setupAnimations() {
        // Add intersection observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-slide-up');
                }
            });
        }, observerOptions);

        // Observe sections for animation
        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    }

    hideLoading() {
        setTimeout(() => {
            document.getElementById('loadingOverlay').classList.add('hidden');
        }, 500);
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
        
        // Update navigation
        this.updateNavigation();
    }

    updateNavigation() {
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');
        
        if (this.currentScreen === 'loginScreen') {
            userMenu.style.display = 'none';
        } else {
            userMenu.style.display = 'block';
            if (this.currentUser) {
                userName.textContent = this.currentUser.split('@')[0];
            }
        }
    }

    loadStoredData() {
        // Load saved schedules and other data
        this.scheduleManager.loadStoredSchedules();
    }

    // Public methods for login functionality
    async handleLogin(userType) {
        const email = document.getElementById('usuario').value.trim();
        const password = document.getElementById('password').value.trim();
        
        // Validate inputs
        const isEmailValid = this.validateEmail(email);
        const isPasswordValid = this.validatePassword(password);
        
        if (!isEmailValid || !isPasswordValid) {
            return;
        }
        
        this.showLoading();
        
        try {
            // Simulate login process
            await this.authManager.login(email, password, userType);
            
            this.currentUser = email;
            this.currentUserType = userType;
            
            if (userType === 'estudiante') {
                this.showStudentDashboard();
            } else {
                this.showAdminDashboard();
            }
            
            showToast('¡Bienvenido!', `Inicio de sesión exitoso como ${userType}`, 'success');
            
        } catch (error) {
            showToast('Error de autenticación', error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    showStudentDashboard() {
        // Assign course to student
        const course = this.authManager.assignCourseToStudent(this.currentUser);
        
        // Update UI
        document.getElementById('studentCourse').textContent = course;
        document.getElementById('studentWelcomeText').textContent = `¡Bienvenido, ${this.currentUser.split('@')[0]}!`;
        
        // Load student schedule
        this.loadStudentSchedule(course);
        
        this.showScreen('studentScreen');
    }

    showAdminDashboard() {
        this.scheduleManager.refreshSavedSchedules();
        this.showScreen('adminScreen');
    }

    loadStudentSchedule(course) {
        const scheduleContainer = document.getElementById('studentSchedule');
        const savedSchedule = this.scheduleManager.getSavedSchedule(course);
        
        if (savedSchedule) {
            scheduleContainer.innerHTML = savedSchedule;
        } else {
            scheduleContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h4>No hay horario asignado</h4>
                    <p>Tu horario será visible una vez que el administrador lo genere para tu curso.</p>
                </div>
            `;
        }
    }

    logout() {
        this.currentUser = null;
        this.currentUserType = null;
        
        // Clear form
        document.getElementById('usuario').value = '';
        document.getElementById('password').value = '';
        
        // Reset form errors
        this.hideFieldError('usuarioError');
        this.hideFieldError('passwordError');
        
        // Reset admin form
        this.scheduleManager.resetAdminForm();
        
        this.showScreen('loginScreen');
        showToast('Sesión cerrada', 'Has cerrado sesión exitosamente', 'info');
    }

    downloadSchedule() {
        if (this.currentUserType === 'estudiante') {
            const course = document.getElementById('studentCourse').textContent;
            const scheduleHtml = document.getElementById('studentSchedule').innerHTML;
            
            if (scheduleHtml.includes('empty-state')) {
                showToast('No disponible', 'No hay horario para descargar', 'warning');
                return;
            }
            
            this.generateSchedulePDF(course, scheduleHtml);
        }
    }

    generateSchedulePDF(course, scheduleHtml) {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Horario Curso ${course} - UCSG</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #8B1538; text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                    th { background-color: #8B1538; color: white; }
                    .subject-cell { background-color: #f0f0f0; }
                </style>
            </head>
            <body>
                <h1>Universidad Católica de Santiago de Guayaquil</h1>
                <h2>Horario de Clases - Curso ${course}</h2>
                ${scheduleHtml}
                <p><small>Generado el ${new Date().toLocaleDateString('es-ES')}</small></p>
            </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    }
}

// Global functions for onclick handlers
function login(userType) {
    app.handleLogin(userType);
}

function logout() {
    app.logout();
}

function downloadSchedule() {
    app.downloadSchedule();
}

function generateSubjectFields() {
    app.scheduleManager.generateSubjectFields();
}

function proceedToSchedule() {
    app.scheduleManager.proceedToSchedule();
}

function goBackToConfig() {
    app.scheduleManager.goBackToConfig();
}

function goBackToSubjects() {
    app.scheduleManager.goBackToSubjects();
}

function generateSchedule() {
    app.scheduleManager.generateSchedule();
}

function saveSchedule() {
    app.scheduleManager.saveSchedule();
}

// Initialize the application
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new UCEGScheduleApp();
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
