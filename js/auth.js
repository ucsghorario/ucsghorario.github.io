// Authentication Manager
class AuthManager {
    constructor() {
        this.studentsAssigned = JSON.parse(localStorage.getItem('studentsAssigned')) || [];
        this.availableCourses = ['A', 'B', 'C', 'D'];
    }

    async login(email, password, userType) {
        // Simulate authentication delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Basic validation
        if (!email.endsWith('@cu.ucsg.edu.ec')) {
            throw new Error('Debe usar un correo institucional válido (@cu.ucsg.edu.ec)');
        }

        if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        // Simulate different authentication logic for different user types
        if (userType === 'administrador') {
            // Admin authentication logic
            if (!this.validateAdminCredentials(email, password)) {
                throw new Error('Credenciales de administrador inválidas');
            }
        } else {
            // Student authentication logic
            if (!this.validateStudentCredentials(email, password)) {
                throw new Error('Credenciales de estudiante inválidas');
            }
        }

        return {
            email,
            userType,
            loginTime: new Date().toISOString()
        };
    }

    validateAdminCredentials(email, password) {
        // For demo purposes, accept any valid UCSG email with any password for admin
        // In a real application, this would validate against a secure backend
        return true; // Allow any user to login as admin for testing
    }

    validateStudentCredentials(email, password) {
        // In a real application, this would validate against a secure backend
        // For demo purposes, accept any valid UCSG email with password length >= 6
        return true;
    }

    assignCourseToStudent(email) {
        // Check if student is already assigned
        const existingStudent = this.studentsAssigned.find(s => s.email === email);
        if (existingStudent) {
            return existingStudent.course;
        }

        // Get currently assigned courses
        const assignedCourses = this.studentsAssigned.map(s => s.course);
        
        // Find available courses
        let availableCourses = this.availableCourses.filter(course => 
            !assignedCourses.includes(course)
        );

        // If all courses are taken, reset and start over
        if (availableCourses.length === 0) {
            this.studentsAssigned = [];
            availableCourses = [...this.availableCourses];
        }

        // Assign random available course
        const assignedCourse = availableCourses[Math.floor(Math.random() * availableCourses.length)];
        
        // Store assignment
        this.studentsAssigned.push({
            email,
            course: assignedCourse,
            assignedAt: new Date().toISOString()
        });

        // Persist to localStorage
        localStorage.setItem('studentsAssigned', JSON.stringify(this.studentsAssigned));

        return assignedCourse;
    }

    getStudentCourse(email) {
        const student = this.studentsAssigned.find(s => s.email === email);
        return student ? student.course : null;
    }

    getAllStudentAssignments() {
        return [...this.studentsAssigned];
    }

    resetStudentAssignments() {
        this.studentsAssigned = [];
        localStorage.removeItem('studentsAssigned');
    }

    // Password strength checker
    checkPasswordStrength(password) {
        const strength = {
            score: 0,
            feedback: []
        };

        if (password.length >= 8) {
            strength.score += 1;
        } else {
            strength.feedback.push('Debe tener al menos 8 caracteres');
        }

        if (/[A-Z]/.test(password)) {
            strength.score += 1;
        } else {
            strength.feedback.push('Debe incluir al menos una letra mayúscula');
        }

        if (/[a-z]/.test(password)) {
            strength.score += 1;
        } else {
            strength.feedback.push('Debe incluir al menos una letra minúscula');
        }

        if (/\d/.test(password)) {
            strength.score += 1;
        } else {
            strength.feedback.push('Debe incluir al menos un número');
        }

        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            strength.score += 1;
        } else {
            strength.feedback.push('Debe incluir al menos un carácter especial');
        }

        return strength;
    }

    // Generate secure session token (for future use)
    generateSessionToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Validate session (for future use)
    validateSession(token) {
        // In a real application, this would validate against a secure backend
        const storedToken = localStorage.getItem('sessionToken');
        return storedToken === token;
    }

    // Clear session
    clearSession() {
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userType');
    }

    // Two-factor authentication simulation (for future enhancement)
    async sendTwoFactorCode(email) {
        // Simulate sending 2FA code
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem(`2fa_${email}`, code);
        
        return {
            success: true,
            message: 'Código de verificación enviado',
            // In real app, don't return the code!
            code: code
        };
    }

    validateTwoFactorCode(email, code) {
        const storedCode = localStorage.getItem(`2fa_${email}`);
        if (storedCode === code) {
            localStorage.removeItem(`2fa_${email}`);
            return true;
        }
        return false;
    }

    // Rate limiting for login attempts
    isRateLimited(email) {
        const attempts = JSON.parse(localStorage.getItem('loginAttempts')) || {};
        const userAttempts = attempts[email] || { count: 0, lastAttempt: 0 };
        
        const now = Date.now();
        const timeSinceLastAttempt = now - userAttempts.lastAttempt;
        
        // Reset after 15 minutes
        if (timeSinceLastAttempt > 15 * 60 * 1000) {
            userAttempts.count = 0;
        }
        
        // Block after 5 attempts
        return userAttempts.count >= 5;
    }

    recordLoginAttempt(email, successful = false) {
        const attempts = JSON.parse(localStorage.getItem('loginAttempts')) || {};
        const userAttempts = attempts[email] || { count: 0, lastAttempt: 0 };
        
        if (successful) {
            // Reset on successful login
            delete attempts[email];
        } else {
            // Increment failed attempts
            userAttempts.count += 1;
            userAttempts.lastAttempt = Date.now();
            attempts[email] = userAttempts;
        }
        
        localStorage.setItem('loginAttempts', JSON.stringify(attempts));
    }
}
