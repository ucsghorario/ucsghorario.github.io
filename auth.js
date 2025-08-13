// Enhanced Authentication Manager with improved error handling
class AuthManager {
    constructor() {
        try {
            this.studentsAssigned = JSON.parse(localStorage.getItem('studentsAssigned') || '[]');
            this.availableCourses = ['A', 'B', 'C', 'D', 'E', 'F'];
            this.debugMode = true;
            this.debugLog('AuthManager initialized successfully');
        } catch (error) {
            console.error('Error initializing AuthManager:', error);
            this.studentsAssigned = [];
            this.availableCourses = ['A', 'B', 'C', 'D', 'E', 'F'];
        }
    }

    debugLog(message, data = null) {
        if (this.debugMode) {
            console.log(`[AuthManager] ${message}`, data || '');
        }
    }

    debugError(message, error) {
        console.error(`[AuthManager Error] ${message}`, error);
    }

    async login(email, password, userType) {
        this.debugLog(`Login attempt for ${userType}:`, email);
        
        try {
            // Simulate authentication delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Enhanced validation
            const validationResult = this.validateCredentials(email, password, userType);
            if (!validationResult.isValid) {
                throw new Error(validationResult.error);
            }

            // Simulate different authentication logic for different user types
            if (userType === 'administrador') {
                if (!this.validateAdminCredentials(email, password)) {
                    throw new Error('Credenciales de administrador inválidas. Verifique su correo y contraseña.');
                }
            } else if (userType === 'estudiante') {
                if (!this.validateStudentCredentials(email, password)) {
                    throw new Error('Credenciales de estudiante inválidas. Verifique su correo y contraseña.');
                }
            } else {
                throw new Error('Tipo de usuario no válido');
            }

            const result = {
                email,
                userType,
                loginTime: new Date().toISOString(),
                sessionToken: this.generateSessionToken()
            };

            // Store session information
            localStorage.setItem('currentUser', email);
            localStorage.setItem('userType', userType);
            localStorage.setItem('sessionToken', result.sessionToken);

            this.debugLog('Login successful', { email, userType });
            return result;

        } catch (error) {
            this.debugError('Login failed', error);
            throw error;
        }
    }

    validateCredentials(email, password, userType) {
        try {
            // Basic email format validation
            if (!email || typeof email !== 'string') {
                return { isValid: false, error: 'El correo electrónico es requerido' };
            }

            if (!email.endsWith('@cu.ucsg.edu.ec')) {
                return { 
                    isValid: false, 
                    error: 'Debe usar un correo institucional válido (@cu.ucsg.edu.ec)' 
                };
            }

            // Email format validation
            const emailRegex = /^[a-zA-Z0-9._%+-]+@cu\.ucsg\.edu\.ec$/;
            if (!emailRegex.test(email)) {
                return { 
                    isValid: false, 
                    error: 'El formato del correo electrónico no es válido' 
                };
            }

            // Password validation
            if (!password || typeof password !== 'string') {
                return { isValid: false, error: 'La contraseña es requerida' };
            }

            if (password.length < 6) {
                return { 
                    isValid: false, 
                    error: 'La contraseña debe tener al menos 6 caracteres' 
                };
            }

            if (password.length > 50) {
                return { 
                    isValid: false, 
                    error: 'La contraseña no debe exceder 50 caracteres' 
                };
            }

            // User type validation
            if (!userType || !['estudiante', 'administrador'].includes(userType)) {
                return { 
                    isValid: false, 
                    error: 'Tipo de usuario no válido' 
                };
            }

            return { isValid: true };
        } catch (error) {
            this.debugError('Error validating credentials', error);
            return { 
                isValid: false, 
                error: 'Error durante la validación de credenciales' 
            };
        }
    }

    validateAdminCredentials(email, password) {
        try {
            // Enhanced admin validation
            // In a real application, this would validate against a secure backend
            
            // For demo purposes, we'll allow specific admin patterns
            const adminPatterns = [
                /^admin[0-9]*@cu\.ucsg\.edu\.ec$/,
                /^administrador[0-9]*@cu\.ucsg\.edu\.ec$/,
                /^[a-zA-Z]+\.admin@cu\.ucsg\.edu\.ec$/
            ];

            const isAdminEmail = adminPatterns.some(pattern => pattern.test(email));
            
            // For demo, accept any valid UCSG email as admin if it matches patterns
            // or has "admin" in the name, or any email for testing
            return isAdminEmail || email.includes('admin') || true; // Allow all for demo
        } catch (error) {
            this.debugError('Error validating admin credentials', error);
            return false;
        }
    }

    validateStudentCredentials(email, password) {
        try {
            // Enhanced student validation
            // For demo purposes, accept any valid UCSG email with proper password
            
            // Additional student-specific validation could go here
            const studentPatterns = [
                /^[a-zA-Z0-9._%+-]+@cu\.ucsg\.edu\.ec$/
            ];

            return studentPatterns.some(pattern => pattern.test(email));
        } catch (error) {
            this.debugError('Error validating student credentials', error);
            return false;
        }
    }

    assignCourseToStudent(email) {
        try {
            this.debugLog('Assigning course to student:', email);
            
            // Check if student is already assigned
            const existingStudent = this.studentsAssigned.find(s => s.email === email);
            if (existingStudent) {
                this.debugLog('Student already assigned to course:', existingStudent.course);
                return existingStudent.course;
            }

            // Get currently assigned courses
            const assignedCourses = this.studentsAssigned.map(s => s.course);
            
            // Find available courses (removed any career-specific restrictions)
            let availableCourses = this.availableCourses.filter(course => {
                const courseCount = assignedCourses.filter(c => c === course).length;
                return courseCount < 5; // Allow up to 5 students per course
            });

            // If no courses available under the limit, reset and start over
            if (availableCourses.length === 0) {
                this.debugLog('All courses at capacity, allowing assignment to any course');
                availableCourses = [...this.availableCourses];
            }

            // Assign random available course
            const assignedCourse = availableCourses[Math.floor(Math.random() * availableCourses.length)];
            
            // Store assignment
            const assignment = {
                email,
                course: assignedCourse,
                assignedAt: new Date().toISOString(),
                career: this.extractCareerFromEmail(email) // Try to extract career info
            };

            this.studentsAssigned.push(assignment);

            // Persist to localStorage with error handling
            try {
                localStorage.setItem('studentsAssigned', JSON.stringify(this.studentsAssigned));
            } catch (storageError) {
                this.debugError('Error saving student assignments to localStorage', storageError);
                // Continue without failing the assignment
            }

            this.debugLog('Course assigned successfully:', { email, course: assignedCourse });
            return assignedCourse;

        } catch (error) {
            this.debugError('Error assigning course to student', error);
            // Return a fallback course
            return this.availableCourses[0];
        }
    }

    extractCareerFromEmail(email) {
        try {
            // Attempt to extract career information from email patterns
            // This is a best-effort approach for demo purposes
            const username = email.split('@')[0].toLowerCase();
            
            const careerPatterns = {
                'sistemas': 'Ingeniería en Sistemas',
                'industrial': 'Ingeniería Industrial',
                'admin': 'Administración de Empresas',
                'contabilidad': 'Contabilidad y Auditoría',
                'derecho': 'Derecho',
                'medicina': 'Medicina',
                'psicologia': 'Psicología',
                'arquitectura': 'Arquitectura',
                'comunicacion': 'Comunicación Social',
                'marketing': 'Marketing'
            };

            for (const [key, career] of Object.entries(careerPatterns)) {
                if (username.includes(key)) {
                    return career;
                }
            }

            return 'General'; // Default career
        } catch (error) {
            this.debugError('Error extracting career from email', error);
            return 'General';
        }
    }

    getStudentCourse(email) {
        try {
            const student = this.studentsAssigned.find(s => s.email === email);
            return student ? student.course : null;
        } catch (error) {
            this.debugError('Error getting student course', error);
            return null;
        }
    }

    getAllStudentAssignments() {
        try {
            return [...this.studentsAssigned];
        } catch (error) {
            this.debugError('Error getting all student assignments', error);
            return [];
        }
    }

    resetStudentAssignments() {
        try {
            this.studentsAssigned = [];
            localStorage.removeItem('studentsAssigned');
            this.debugLog('Student assignments reset successfully');
        } catch (error) {
            this.debugError('Error resetting student assignments', error);
        }
    }

    // Enhanced password strength checker
    checkPasswordStrength(password) {
        try {
            const strength = {
                score: 0,
                level: 'weak',
                feedback: [],
                hasMinLength: false,
                hasUpperCase: false,
                hasLowerCase: false,
                hasNumbers: false,
                hasSpecialChars: false
            };

            if (!password) {
                strength.feedback.push('La contraseña es requerida');
                return strength;
            }

            // Length check
            if (password.length >= 8) {
                strength.score += 1;
                strength.hasMinLength = true;
            } else {
                strength.feedback.push('Debe tener al menos 8 caracteres');
            }

            // Uppercase check
            if (/[A-Z]/.test(password)) {
                strength.score += 1;
                strength.hasUpperCase = true;
            } else {
                strength.feedback.push('Debe incluir al menos una letra mayúscula');
            }

            // Lowercase check
            if (/[a-z]/.test(password)) {
                strength.score += 1;
                strength.hasLowerCase = true;
            } else {
                strength.feedback.push('Debe incluir al menos una letra minúscula');
            }

            // Numbers check
            if (/\d/.test(password)) {
                strength.score += 1;
                strength.hasNumbers = true;
            } else {
                strength.feedback.push('Debe incluir al menos un número');
            }

            // Special characters check
            if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                strength.score += 1;
                strength.hasSpecialChars = true;
            } else {
                strength.feedback.push('Debe incluir al menos un carácter especial');
            }

            // Determine strength level
            if (strength.score >= 4) {
                strength.level = 'strong';
            } else if (strength.score >= 2) {
                strength.level = 'medium';
            } else {
                strength.level = 'weak';
            }

            return strength;
        } catch (error) {
            this.debugError('Error checking password strength', error);
            return {
                score: 0,
                level: 'unknown',
                feedback: ['Error verificando la contraseña'],
                hasMinLength: false,
                hasUpperCase: false,
                hasLowerCase: false,
                hasNumbers: false,
                hasSpecialChars: false
            };
        }
    }

    // Generate secure session token
    generateSessionToken() {
        try {
            const array = new Uint8Array(32);
            crypto.getRandomValues(array);
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            this.debugError('Error generating session token', error);
            // Fallback to less secure method
            return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        }
    }

    // Validate session
    validateSession(token) {
        try {
            const storedToken = localStorage.getItem('sessionToken');
            return storedToken === token && token !== null;
        } catch (error) {
            this.debugError('Error validating session', error);
            return false;
        }
    }

    // Clear session
    clearSession() {
        try {
            localStorage.removeItem('sessionToken');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userType');
            this.debugLog('Session cleared successfully');
        } catch (error) {
            this.debugError('Error clearing session', error);
        }
    }

    // Two-factor authentication simulation
    async sendTwoFactorCode(email) {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            localStorage.setItem(`2fa_${email}`, code);
            localStorage.setItem(`2fa_${email}_timestamp`, Date.now().toString());
            
            this.debugLog('2FA code sent for:', email);
            
            return {
                success: true,
                message: 'Código de verificación enviado',
                // In real app, don't return the code!
                code: code // Only for demo purposes
            };
        } catch (error) {
            this.debugError('Error sending 2FA code', error);
            return {
                success: false,
                message: 'Error enviando código de verificación'
            };
        }
    }

    validateTwoFactorCode(email, code) {
        try {
            const storedCode = localStorage.getItem(`2fa_${email}`);
            const timestamp = localStorage.getItem(`2fa_${email}_timestamp`);
            
            if (!storedCode || !timestamp) {
                return false;
            }
            
            // Check if code is expired (5 minutes)
            const codeAge = Date.now() - parseInt(timestamp);
            if (codeAge > 5 * 60 * 1000) {
                localStorage.removeItem(`2fa_${email}`);
                localStorage.removeItem(`2fa_${email}_timestamp`);
                return false;
            }
            
            if (storedCode === code) {
                localStorage.removeItem(`2fa_${email}`);
                localStorage.removeItem(`2fa_${email}_timestamp`);
                return true;
            }
            
            return false;
        } catch (error) {
            this.debugError('Error validating 2FA code', error);
            return false;
        }
    }

    // Enhanced rate limiting for login attempts
    isRateLimited(email) {
        try {
            const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
            const userAttempts = attempts[email] || { count: 0, lastAttempt: 0 };
            
            const now = Date.now();
            const timeSinceLastAttempt = now - userAttempts.lastAttempt;
            
            // Reset after 15 minutes
            if (timeSinceLastAttempt > 15 * 60 * 1000) {
                userAttempts.count = 0;
            }
            
            // Progressive blocking: 3 attempts = 5 min, 5 attempts = 15 min, 10 attempts = 1 hour
            if (userAttempts.count >= 10 && timeSinceLastAttempt < 60 * 60 * 1000) {
                return true; // 1 hour block
            } else if (userAttempts.count >= 5 && timeSinceLastAttempt < 15 * 60 * 1000) {
                return true; // 15 minute block
            } else if (userAttempts.count >= 3 && timeSinceLastAttempt < 5 * 60 * 1000) {
                return true; // 5 minute block
            }
            
            return false;
        } catch (error) {
            this.debugError('Error checking rate limit', error);
            return false; // Allow login on error
        }
    }

    recordLoginAttempt(email, successful = false) {
        try {
            const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
            const userAttempts = attempts[email] || { count: 0, lastAttempt: 0 };
            
            if (successful) {
                // Reset on successful login
                delete attempts[email];
                this.debugLog('Login attempt recorded as successful, counter reset for:', email);
            } else {
                // Increment failed attempts
                userAttempts.count += 1;
                userAttempts.lastAttempt = Date.now();
                attempts[email] = userAttempts;
                this.debugLog('Failed login attempt recorded for:', email, 'Count:', userAttempts.count);
            }
            
            localStorage.setItem('loginAttempts', JSON.stringify(attempts));
        } catch (error) {
            this.debugError('Error recording login attempt', error);
        }
    }

    // Get remaining lockout time
    getRemainingLockoutTime(email) {
        try {
            const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
            const userAttempts = attempts[email] || { count: 0, lastAttempt: 0 };
            
            const now = Date.now();
            const timeSinceLastAttempt = now - userAttempts.lastAttempt;
            
            if (userAttempts.count >= 10) {
                const remaining = (60 * 60 * 1000) - timeSinceLastAttempt;
                return Math.max(0, remaining);
            } else if (userAttempts.count >= 5) {
                const remaining = (15 * 60 * 1000) - timeSinceLastAttempt;
                return Math.max(0, remaining);
            } else if (userAttempts.count >= 3) {
                const remaining = (5 * 60 * 1000) - timeSinceLastAttempt;
                return Math.max(0, remaining);
            }
            
            return 0;
        } catch (error) {
            this.debugError('Error getting remaining lockout time', error);
            return 0;
        }
    }

    // Format lockout time for display
    formatLockoutTime(milliseconds) {
        try {
            const minutes = Math.ceil(milliseconds / (60 * 1000));
            if (minutes >= 60) {
                const hours = Math.floor(minutes / 60);
                const remainingMinutes = minutes % 60;
                return `${hours} hora(s) y ${remainingMinutes} minuto(s)`;
            }
            return `${minutes} minuto(s)`;
        } catch (error) {
            this.debugError('Error formatting lockout time', error);
            return 'tiempo desconocido';
        }
    }
}
