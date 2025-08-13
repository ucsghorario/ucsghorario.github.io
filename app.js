// Main application controller with enhanced error handling and debugging
class UCEGScheduleApp {
    constructor() {
        this.currentUser = null;
        this.currentUserType = null;
        this.currentScreen = 'login';
        this.scheduleManager = new ScheduleManager();
        this.authManager = new AuthManager();
        this.debugMode = true; // Enable debug mode for better error tracking
        
        this.init();
    }

    init() {
        try {
            this.setupEventListeners();
            this.loadStoredData();
            this.hideLoading();
            this.initializeUI();
            this.debugLog('Application initialized successfully');
        } catch (error) {
            this.handleError(error, 'Error durante la inicialización de la aplicación');
        }
    }

    debugLog(message, data = null) {
        if (this.debugMode) {
            console.log(`[UCEG App] ${message}`, data || '');
        }
    }

    debugError(message, error) {
        console.error(`[UCEG App Error] ${message}`, error);
    }

    handleError(error, userMessage = 'Ha ocurrido un error inesperado') {
        this.debugError(userMessage, error);
        showToast('Error', userMessage, 'error', 7000);
    }

    setupEventListeners() {
        try {
            // Login form
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.debugLog('Login form submitted via form event');
                });
            }

            // Password toggle
            const togglePassword = document.getElementById('togglePassword');
            if (togglePassword) {
                togglePassword.addEventListener('click', () => {
                    this.togglePasswordVisibility();
                });
            }

            // User menu toggle
            const userButton = document.getElementById('userButton');
            if (userButton) {
                userButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleUserMenu();
                });
            }

            // Close user menu when clicking outside
            document.addEventListener('click', (e) => {
                const userMenu = document.getElementById('userMenu');
                if (userMenu && !userMenu.contains(e.target)) {
                    userMenu.classList.remove('active');
                }
            });

            // Enhanced form validation
            this.setupFormValidation();
            this.setupKeyboardNavigation();
            
            this.debugLog('Event listeners setup completed');
        } catch (error) {
            this.handleError(error, 'Error configurando eventos de la aplicación');
        }
    }

    setupFormValidation() {
        try {
            const emailInput = document.getElementById('usuario');
            const passwordInput = document.getElementById('password');

            if (emailInput) {
                // Real-time validation with debouncing
                let emailTimeout;
                emailInput.addEventListener('input', () => {
                    clearTimeout(emailTimeout);
                    emailTimeout = setTimeout(() => {
                        this.validateEmail(emailInput.value);
                    }, 300);
                });

                emailInput.addEventListener('blur', () => {
                    this.validateEmail(emailInput.value);
                });
            }

            if (passwordInput) {
                let passwordTimeout;
                passwordInput.addEventListener('input', () => {
                    clearTimeout(passwordTimeout);
                    passwordTimeout = setTimeout(() => {
                        this.validatePassword(passwordInput.value);
                    }, 300);
                });
            }

            this.debugLog('Form validation setup completed');
        } catch (error) {
            this.handleError(error, 'Error configurando validación de formularios');
        }
    }

    setupKeyboardNavigation() {
        try {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    // Close modals, menus, etc.
                    const userMenu = document.getElementById('userMenu');
                    if (userMenu) {
                        userMenu.classList.remove('active');
                    }
                }
                
                // Enter key handling for buttons
                if (e.key === 'Enter' && e.target.tagName === 'BUTTON') {
                    e.target.click();
                }
            });
            
            this.debugLog('Keyboard navigation setup completed');
        } catch (error) {
            this.handleError(error, 'Error configurando navegación por teclado');
        }
    }

    validateEmail(email) {
        try {
            const emailInput = document.getElementById('usuario');
            const emailRegex = /^[a-zA-Z0-9._%+-]+@cu\.ucsg\.edu\.ec$/;
            
            // Clear previous states
            this.clearFieldState('usuario');
            
            if (!email || email.trim() === '') {
                this.hideFieldError('usuarioError');
                return false;
            }
            
            if (!emailRegex.test(email)) {
                this.showDetailedFieldError('usuarioError', 
                    'Correo institucional inválido',
                    [
                        'Debe usar un correo institucional de UCSG',
                        'El formato debe ser: usuario@cu.ucsg.edu.ec',
                        'Ejemplo: juan.perez@cu.ucsg.edu.ec'
                    ]
                );
                emailInput.classList.add('error');
                // Keep error message visible longer for email validation
                setTimeout(() => {
                    const errorElement = document.getElementById('usuarioError');
                    if (errorElement && errorElement.classList.contains('active')) {
                        // Keep visible for at least 4 seconds for email errors
                        setTimeout(() => {
                            if (emailInput.value.trim() === '' || this.validateEmail(emailInput.value)) {
                                this.hideFieldError('usuarioError');
                            }
                        }, 4000);
                    }
                }, 100);
                return false;
            }
            
            this.showFieldSuccess('usuarioError', 'Correo válido');
            emailInput.classList.add('success');
            return true;
        } catch (error) {
            this.debugError('Error validating email', error);
            return false;
        }
    }

    validatePassword(password) {
        try {
            const passwordInput = document.getElementById('password');
            
            // Clear previous states
            this.clearFieldState('password');
            
            if (!password || password.trim() === '') {
                this.hideFieldError('passwordError');
                return false;
            }
            
            const errors = [];
            if (password.length < 6) {
                errors.push('Debe tener al menos 6 caracteres');
            }
            if (password.length > 50) {
                errors.push('No debe exceder 50 caracteres');
            }
            if (!/[a-zA-Z]/.test(password)) {
                errors.push('Debe contener al menos una letra');
            }
            
            if (errors.length > 0) {
                this.showDetailedFieldError('passwordError', 
                    'Contraseña no válida',
                    errors
                );
                passwordInput.classList.add('error');
                // Keep error message visible longer for password validation
                setTimeout(() => {
                    const errorElement = document.getElementById('passwordError');
                    if (errorElement && errorElement.classList.contains('active')) {
                        // Keep visible for at least 5 seconds for password errors
                        setTimeout(() => {
                            if (passwordInput.value.trim() === '' || this.validatePassword(passwordInput.value)) {
                                this.hideFieldError('passwordError');
                            }
                        }, 5000);
                    }
                }, 100);
                return false;
            }
            
            this.showFieldSuccess('passwordError', 'Contraseña válida');
            passwordInput.classList.add('success');
            return true;
        } catch (error) {
            this.debugError('Error validating password', error);
            return false;
        }
    }

    showDetailedFieldError(fieldId, title, errors) {
        try {
            const errorElement = document.getElementById(fieldId);
            if (!errorElement) {
                console.warn(`Error element not found: ${fieldId}`);
                return;
            }

            let errorHtml = `<div class="field-error-detailed active">
                <strong>${title}</strong>`;
            
            if (Array.isArray(errors) && errors.length > 0) {
                errorHtml += '<ul>';
                errors.forEach(error => {
                    errorHtml += `<li>${error}</li>`;
                });
                errorHtml += '</ul>';
            }
            
            errorHtml += '</div>';
            
            errorElement.innerHTML = errorHtml;
            errorElement.classList.add('active');
            
            this.debugLog(`Detailed error shown for ${fieldId}`, { title, errors });
        } catch (error) {
            this.debugError('Error showing detailed field error', error);
        }
    }

    showFieldError(fieldId, message) {
        try {
            const errorElement = document.getElementById(fieldId);
            if (errorElement) {
                errorElement.innerHTML = message;
                errorElement.classList.add('active');
                this.debugLog(`Field error shown: ${fieldId} - ${message}`);
            }
        } catch (error) {
            this.debugError('Error showing field error', error);
        }
    }

    showFieldSuccess(fieldId, message) {
        try {
            const errorElement = document.getElementById(fieldId);
            if (errorElement) {
                errorElement.innerHTML = `<div class="field-success active">${message}</div>`;
                errorElement.classList.add('active');
                this.debugLog(`Field success shown: ${fieldId} - ${message}`);
            }
        } catch (error) {
            this.debugError('Error showing field success', error);
        }
    }

    hideFieldError(fieldId) {
        try {
            const errorElement = document.getElementById(fieldId);
            if (errorElement) {
                errorElement.classList.remove('active');
                setTimeout(() => {
                    errorElement.innerHTML = '';
                }, 1000); // Increased from 300ms to 1000ms for better visibility
            }
        } catch (error) {
            this.debugError('Error hiding field error', error);
        }
    }

    clearFieldState(fieldId) {
        try {
            const field = document.getElementById(fieldId);
            if (field) {
                field.classList.remove('error', 'success', 'validating');
            }
            this.hideFieldError(fieldId + 'Error');
        } catch (error) {
            this.debugError('Error clearing field state', error);
        }
    }

    togglePasswordVisibility() {
        try {
            const passwordInput = document.getElementById('password');
            const toggleIcon = document.querySelector('#togglePassword i');
            
            if (passwordInput && toggleIcon) {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    toggleIcon.className = 'fas fa-eye-slash';
                } else {
                    passwordInput.type = 'password';
                    toggleIcon.className = 'fas fa-eye';
                }
                this.debugLog('Password visibility toggled');
            }
        } catch (error) {
            this.handleError(error, 'Error alternando visibilidad de contraseña');
        }
    }

    toggleUserMenu() {
        try {
            const userMenu = document.getElementById('userMenu');
            if (userMenu) {
                userMenu.classList.toggle('active');
                this.debugLog('User menu toggled', userMenu.classList.contains('active'));
            }
        } catch (error) {
            this.handleError(error, 'Error alternando menú de usuario');
        }
    }

    initializeUI() {
        try {
            this.setupAnimations();
            this.debugLog('UI initialization completed');
        } catch (error) {
            this.handleError(error, 'Error inicializando interfaz de usuario');
        }
    }

    setupAnimations() {
        try {
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

            document.querySelectorAll('.section').forEach(section => {
                observer.observe(section);
            });
            
            this.debugLog('Animations setup completed');
        } catch (error) {
            this.debugError('Error setting up animations', error);
        }
    }

    showLoading() {
        try {
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.classList.remove('hidden');
            }
        } catch (error) {
            this.debugError('Error showing loading overlay', error);
        }
    }

    hideLoading() {
        try {
            setTimeout(() => {
                const loadingOverlay = document.getElementById('loadingOverlay');
                if (loadingOverlay) {
                    loadingOverlay.classList.add('hidden');
                }
            }, 500);
        } catch (error) {
            this.debugError('Error hiding loading overlay', error);
        }
    }

    showScreen(screenId) {
        try {
            this.debugLog(`Switching to screen: ${screenId}`);
            
            // Hide all screens
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            
            // Show target screen
            const targetScreen = document.getElementById(screenId);
            if (targetScreen) {
                targetScreen.classList.add('active');
                this.currentScreen = screenId;
                this.updateNavigation();
                this.debugLog(`Screen switched successfully to: ${screenId}`);
            } else {
                throw new Error(`Screen not found: ${screenId}`);
            }
        } catch (error) {
            this.handleError(error, `Error cambiando a la pantalla: ${screenId}`);
        }
    }

    updateNavigation() {
        try {
            const userMenu = document.getElementById('userMenu');
            const userName = document.getElementById('userName');
            
            if (this.currentScreen === 'loginScreen') {
                if (userMenu) userMenu.style.display = 'none';
            } else {
                if (userMenu) userMenu.style.display = 'block';
                if (this.currentUser && userName) {
                    userName.textContent = this.currentUser.split('@')[0];
                }
            }
            
            this.debugLog('Navigation updated for screen:', this.currentScreen);
        } catch (error) {
            this.debugError('Error updating navigation', error);
        }
    }

    loadStoredData() {
        try {
            this.scheduleManager.loadStoredSchedules();
            this.debugLog('Stored data loaded successfully');
        } catch (error) {
            this.handleError(error, 'Error cargando datos guardados');
        }
    }

    // Enhanced login with comprehensive error handling
    async handleLogin(userType) {
        this.debugLog(`Login attempt for user type: ${userType}`);
        
        try {
            const email = document.getElementById('usuario').value.trim();
            const password = document.getElementById('password').value.trim();
            
            // Clear any previous errors
            this.clearFieldState('usuario');
            this.clearFieldState('password');
            
            // Validate inputs with detailed feedback
            const isEmailValid = this.validateEmail(email);
            const isPasswordValid = this.validatePassword(password);
            
            if (!isEmailValid || !isPasswordValid) {
                showToast('Campos requeridos', 
                    'Por favor, corrija los errores en el formulario antes de continuar', 
                    'warning', 6000);
                return;
            }
            
            // Check rate limiting
            if (this.authManager.isRateLimited(email)) {
                showToast('Demasiados intentos', 
                    'Has excedido el número máximo de intentos. Intenta de nuevo en 15 minutos', 
                    'error', 8000);
                return;
            }
            
            this.showLoading();
            
            try {
                // Attempt login
                const result = await this.authManager.login(email, password, userType);
                
                this.currentUser = email;
                this.currentUserType = userType;
                
                // Record successful login
                this.authManager.recordLoginAttempt(email, true);
                
                if (userType === 'estudiante') {
                    this.showStudentDashboard();
                } else {
                    this.showAdminDashboard();
                }
                
                showToast('¡Bienvenido!', 
                    `Inicio de sesión exitoso como ${userType}`, 
                    'success', 4000);
                
                this.debugLog(`Login successful for ${userType}: ${email}`);
                
            } catch (authError) {
                // Record failed login
                this.authManager.recordLoginAttempt(email, false);
                
                // Show specific error message
                let errorMessage = 'Error de autenticación';
                let errorDetail = authError.message || 'Credenciales inválidas';
                
                if (authError.message.includes('correo')) {
                    this.showDetailedFieldError('usuarioError', 'Error de correo', [authError.message]);
                } else if (authError.message.includes('contraseña')) {
                    this.showDetailedFieldError('passwordError', 'Error de contraseña', [authError.message]);
                }
                
                showToast(errorMessage, errorDetail, 'error', 6000);
                this.debugError('Login failed', authError);
            }
            
        } catch (error) {
            this.handleError(error, 'Error durante el proceso de inicio de sesión');
        } finally {
            this.hideLoading();
        }
    }

    showStudentDashboard() {
        try {
            // Assign course to student
            const course = this.authManager.assignCourseToStudent(this.currentUser);
            
            // Update UI
            const studentCourse = document.getElementById('studentCourse');
            const studentWelcomeText = document.getElementById('studentWelcomeText');
            
            if (studentCourse) {
                studentCourse.textContent = course;
            }
            
            if (studentWelcomeText) {
                studentWelcomeText.textContent = `¡Bienvenido, ${this.currentUser.split('@')[0]}!`;
            }
            
            // Load student schedule
            this.loadStudentSchedule(course);
            
            this.showScreen('studentScreen');
            this.debugLog(`Student dashboard loaded for course: ${course}`);
        } catch (error) {
            this.handleError(error, 'Error cargando panel de estudiante');
        }
    }

    showAdminDashboard() {
        try {
            this.scheduleManager.refreshSavedSchedules();
            this.showScreen('adminScreen');
            this.debugLog('Admin dashboard loaded');
        } catch (error) {
            this.handleError(error, 'Error cargando panel de administrador');
        }
    }

    loadStudentSchedule(course) {
        try {
            const scheduleContainer = document.getElementById('studentSchedule');
            if (!scheduleContainer) {
                throw new Error('Schedule container not found');
            }
            
            const savedSchedule = this.scheduleManager.getSavedSchedule(course);
            
            if (savedSchedule) {
                scheduleContainer.innerHTML = savedSchedule;
                this.debugLog(`Schedule loaded for course: ${course}`);
            } else {
                scheduleContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-calendar-times"></i>
                        <h4>No hay horario asignado</h4>
                        <p>Tu horario será visible una vez que el administrador lo genere para tu curso.</p>
                    </div>
                `;
                this.debugLog(`No schedule found for course: ${course}`);
            }
        } catch (error) {
            this.handleError(error, 'Error cargando horario del estudiante');
        }
    }

    logout() {
        try {
            this.debugLog(`Logout initiated for user: ${this.currentUser}`);
            
            this.currentUser = null;
            this.currentUserType = null;
            
            // Clear form
            const emailInput = document.getElementById('usuario');
            const passwordInput = document.getElementById('password');
            
            if (emailInput) emailInput.value = '';
            if (passwordInput) passwordInput.value = '';
            
            // Reset form errors and states
            this.clearFieldState('usuario');
            this.clearFieldState('password');
            
            // Reset admin form
            this.scheduleManager.resetAdminForm();
            
            this.showScreen('loginScreen');
            showToast('Sesión cerrada', 'Has cerrado sesión exitosamente', 'info', 3000);
            
            this.debugLog('Logout completed successfully');
        } catch (error) {
            this.handleError(error, 'Error cerrando sesión');
        }
    }

    downloadSchedule() {
        try {
            if (this.currentUserType === 'estudiante') {
                const courseElement = document.getElementById('studentCourse');
                const scheduleElement = document.getElementById('studentSchedule');
                
                if (!courseElement || !scheduleElement) {
                    throw new Error('Required elements not found for download');
                }
                
                const course = courseElement.textContent;
                const scheduleHtml = scheduleElement.innerHTML;
                
                if (scheduleHtml.includes('empty-state')) {
                    showToast('No disponible', 'No hay horario para descargar', 'warning');
                    return;
                }
                
                this.generateSchedulePDF(course, scheduleHtml);
                this.debugLog(`Schedule download initiated for course: ${course}`);
            }
        } catch (error) {
            this.handleError(error, 'Error descargando horario');
        }
    }

    generateSchedulePDF(course, scheduleHtml) {
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                throw new Error('Popup blocked - unable to generate PDF');
            }
            
            const printContent = `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Horario Curso ${course} - UCSG</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px; 
                            color: #333;
                        }
                        h1 { 
                            color: #8B1538; 
                            text-align: center; 
                            margin-bottom: 10px;
                        }
                        h2 { 
                            color: #666; 
                            text-align: center; 
                            margin-bottom: 30px;
                        }
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin: 20px 0; 
                            font-size: 12px;
                        }
                        th, td { 
                            border: 1px solid #ddd; 
                            padding: 8px; 
                            text-align: center; 
                        }
                        th { 
                            background-color: #8B1538; 
                            color: white; 
                            font-weight: bold;
                        }
                        .subject-cell { 
                            background-color: #f8f9fa; 
                            font-weight: bold;
                        }
                        .footer { 
                            margin-top: 30px; 
                            text-align: center; 
                            font-size: 10px; 
                            color: #666;
                        }
                    </style>
                </head>
                <body>
                    <h1>Universidad Católica de Santiago de Guayaquil</h1>
                    <h2>Horario de Clases - Curso ${course}</h2>
                    ${scheduleHtml}
                    <div class="footer">
                        <p>Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                        <p>Sistema de Gestión de Horarios UCSG</p>
                    </div>
                </body>
                </html>
            `;
            
            printWindow.document.write(printContent);
            printWindow.document.close();
            
            // Wait for content to load before printing
            printWindow.onload = () => {
                printWindow.print();
                this.debugLog('PDF generation completed');
            };
            
        } catch (error) {
            this.handleError(error, 'Error generando PDF del horario');
        }
    }
}

// Global functions for onclick handlers with error handling
function login(userType) {
    try {
        if (app) {
            app.handleLogin(userType);
        } else {
            console.error('App not initialized');
            showToast('Error', 'Aplicación no inicializada correctamente', 'error');
        }
    } catch (error) {
        console.error('Error in login function:', error);
        showToast('Error', 'Error durante el inicio de sesión', 'error');
    }
}

function logout() {
    try {
        if (app) {
            app.logout();
        }
    } catch (error) {
        console.error('Error in logout function:', error);
        showToast('Error', 'Error cerrando sesión', 'error');
    }
}

function downloadSchedule() {
    try {
        if (app) {
            app.downloadSchedule();
        }
    } catch (error) {
        console.error('Error in downloadSchedule function:', error);
        showToast('Error', 'Error descargando horario', 'error');
    }
}

function generateSubjectFields() {
    try {
        if (app && app.scheduleManager) {
            app.scheduleManager.generateSubjectFields();
        }
    } catch (error) {
        console.error('Error in generateSubjectFields function:', error);
        showToast('Error', 'Error generando campos de materias', 'error');
    }
}

function proceedToSchedule() {
    try {
        if (app && app.scheduleManager) {
            app.scheduleManager.proceedToSchedule();
        }
    } catch (error) {
        console.error('Error in proceedToSchedule function:', error);
        showToast('Error', 'Error procediendo a generar horario', 'error');
    }
}

function goBackToConfig() {
    try {
        if (app && app.scheduleManager) {
            app.scheduleManager.goBackToConfig();
        }
    } catch (error) {
        console.error('Error in goBackToConfig function:', error);
        showToast('Error', 'Error regresando a configuración', 'error');
    }
}

function goBackToSubjects() {
    try {
        if (app && app.scheduleManager) {
            app.scheduleManager.goBackToSubjects();
        }
    } catch (error) {
        console.error('Error in goBackToSubjects function:', error);
        showToast('Error', 'Error regresando a materias', 'error');
    }
}

function generateSchedule() {
    try {
        if (app && app.scheduleManager) {
            app.scheduleManager.generateSchedule();
        }
    } catch (error) {
        console.error('Error in generateSchedule function:', error);
        showToast('Error', 'Error generando horario', 'error');
    }
}

function saveSchedule() {
    try {
        if (app && app.scheduleManager) {
            app.scheduleManager.saveSchedule();
        }
    } catch (error) {
        console.error('Error in saveSchedule function:', error);
        showToast('Error', 'Error guardando horario', 'error');
    }
}

function editSchedule(course) {
    try {
        if (app && app.scheduleManager) {
            app.scheduleManager.editSchedule(course);
        }
    } catch (error) {
        console.error('Error in editSchedule function:', error);
        showToast('Error', 'Error editando horario', 'error');
    }
}

function deleteSchedule(course) {
    try {
        if (app && app.scheduleManager) {
            app.scheduleManager.deleteSchedule(course);
        }
    } catch (error) {
        console.error('Error in deleteSchedule function:', error);
        showToast('Error', 'Error eliminando horario', 'error');
    }
}

// Initialize the application with error handling
let app;

document.addEventListener('DOMContentLoaded', () => {
    try {
        app = new UCEGScheduleApp();
        console.log('UCEG Schedule App initialized successfully');
    } catch (error) {
        console.error('Failed to initialize UCEG Schedule App:', error);
        showToast('Error crítico', 'No se pudo inicializar la aplicación', 'error', 10000);
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    showToast('Error inesperado', 'Se ha producido un error en la aplicación', 'error');
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showToast('Error de promesa', 'Error no manejado en operación asíncrona', 'error');
});
