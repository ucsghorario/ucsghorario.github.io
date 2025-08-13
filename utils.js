// Enhanced utility functions with comprehensive error handling and debugging capabilities

// Toast notification system with improved error display
function showToast(title, message, type = 'info', duration = 8000) {
    try {
        const container = document.getElementById('toastContainer');
        if (!container) {
            console.error('Toast container not found');
            return null;
        }
        
        const toast = createToastElement(title, message, type, duration);
        if (!toast) {
            console.error('Failed to create toast element');
            return null;
        }
        
        container.appendChild(toast);
        
        // Auto remove after duration
        const timeoutId = setTimeout(() => {
            removeToast(toast);
        }, duration);
        
        // Store timeout ID for potential cancellation
        toast.dataset.timeoutId = timeoutId;
        
        return toast;
    } catch (error) {
        console.error('Error showing toast:', error);
        return null;
    }
}

function createToastElement(title, message, type, duration = 8000) {
    try {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
        toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        // Sanitize content
        const sanitizedTitle = sanitizeHtml(title);
        const sanitizedMessage = sanitizeHtml(message);
        
        toast.innerHTML = `
            <i class="${iconMap[type] || iconMap.info}" aria-hidden="true"></i>
            <div class="toast-content">
                <div class="toast-title">${sanitizedTitle}</div>
                <div class="toast-message">${sanitizedMessage}</div>
            </div>
            <button class="toast-close" onclick="removeToast(this.parentElement)" aria-label="Cerrar notificación">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
            <div class="toast-progress" aria-hidden="true"></div>
        `;
        
        // Add click handler for accessibility
        toast.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                removeToast(toast);
            }
        });
        
        // Make toast focusable for keyboard navigation
        toast.setAttribute('tabindex', '0');
        
        return toast;
    } catch (error) {
        console.error('Error creating toast element:', error);
        return null;
    }
}

function removeToast(toast) {
    try {
        if (!toast || !toast.parentElement) {
            return;
        }
        
        // Clear timeout if it exists
        const timeoutId = toast.dataset.timeoutId;
        if (timeoutId) {
            clearTimeout(parseInt(timeoutId));
        }
        
        toast.classList.add('removing');
        
        setTimeout(() => {
            if (toast && toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 250);
    } catch (error) {
        console.error('Error removing toast:', error);
    }
}

// Enhanced HTML sanitization
function sanitizeHtml(input) {
    try {
        if (typeof input !== 'string') {
            return String(input);
        }
        
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    } catch (error) {
        console.error('Error sanitizing HTML:', error);
        return 'Error procesando contenido';
    }
}

// Enhanced Local Storage utilities with error handling
function saveToLocalStorage(key, data) {
    try {
        if (!key) {
            throw new Error('Key is required for localStorage operation');
        }
        
        const serializedData = JSON.stringify(data);
        
        // Check if we're approaching localStorage limit
        const storageUsed = getLocalStorageSize();
        const dataSize = new Blob([serializedData]).size;
        
        if (storageUsed + dataSize > 5 * 1024 * 1024) { // 5MB limit warning
            console.warn('LocalStorage approaching size limit');
            showToast('Advertencia de almacenamiento', 
                'El almacenamiento local está casi lleno. Considere limpiar datos antiguos.', 
                'warning');
        }
        
        localStorage.setItem(key, serializedData);
        return true;
    } catch (error) {
        console.error(`Error saving to localStorage (key: ${key}):`, error);
        
        if (error.name === 'QuotaExceededError') {
            showToast('Almacenamiento lleno', 
                'No hay suficiente espacio en el navegador. Elimine algunos horarios antiguos.', 
                'error', 8000);
        } else {
            showToast('Error de almacenamiento', 
                'No se pudo guardar la información localmente', 
                'error');
        }
        return false;
    }
}

function loadFromLocalStorage(key, defaultValue = null) {
    try {
        if (!key) {
            console.warn('Key is required for localStorage operation');
            return defaultValue;
        }
        
        const data = localStorage.getItem(key);
        if (data === null) {
            return defaultValue;
        }
        
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error loading from localStorage (key: ${key}):`, error);
        
        // If parsing fails, try to recover by returning default value
        if (error instanceof SyntaxError) {
            console.warn(`Invalid JSON in localStorage for key: ${key}, using default value`);
            localStorage.removeItem(key); // Clean up corrupted data
        }
        
        return defaultValue;
    }
}

function removeFromLocalStorage(key) {
    try {
        if (!key) {
            throw new Error('Key is required for localStorage operation');
        }
        
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing from localStorage (key: ${key}):`, error);
        return false;
    }
}

function getLocalStorageSize() {
    try {
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }
        return totalSize;
    } catch (error) {
        console.error('Error calculating localStorage size:', error);
        return 0;
    }
}

function clearExpiredLocalStorage(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days default
    try {
        const now = Date.now();
        const keysToRemove = [];
        
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                try {
                    const data = JSON.parse(localStorage[key]);
                    if (data && data.createdAt) {
                        const age = now - new Date(data.createdAt).getTime();
                        if (age > maxAge) {
                            keysToRemove.push(key);
                        }
                    }
                } catch (e) {
                    // Not JSON data, skip
                }
            }
        }
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log(`Removed expired localStorage item: ${key}`);
        });
        
        if (keysToRemove.length > 0) {
            showToast('Limpieza automática', 
                `Se eliminaron ${keysToRemove.length} elementos antiguos del almacenamiento`, 
                'info');
        }
        
        return keysToRemove.length;
    } catch (error) {
        console.error('Error clearing expired localStorage:', error);
        return 0;
    }
}

// Enhanced form validation utilities
function validateEmail(email) {
    try {
        if (!email || typeof email !== 'string') {
            return { isValid: false, error: 'Email es requerido' };
        }
        
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            return { isValid: false, error: 'Email no puede estar vacío' };
        }
        
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(trimmedEmail)) {
            return { isValid: false, error: 'Formato de email inválido' };
        }
        
        return { isValid: true };
    } catch (error) {
        console.error('Error validating email:', error);
        return { isValid: false, error: 'Error validando email' };
    }
}

function validateUCSGEmail(email) {
    try {
        const basicValidation = validateEmail(email);
        if (!basicValidation.isValid) {
            return basicValidation;
        }
        
        const ucsgRegex = /^[a-zA-Z0-9._%+-]+@cu\.ucsg\.edu\.ec$/;
        if (!ucsgRegex.test(email.trim())) {
            return { 
                isValid: false, 
                error: 'Debe usar un correo institucional UCSG (@cu.ucsg.edu.ec)' 
            };
        }
        
        return { isValid: true };
    } catch (error) {
        console.error('Error validating UCSG email:', error);
        return { isValid: false, error: 'Error validando correo UCSG' };
    }
}

function validateRequired(value, fieldName = 'Campo') {
    try {
        if (value === null || value === undefined) {
            return { isValid: false, error: `${fieldName} es requerido` };
        }
        
        const trimmedValue = String(value).trim();
        if (!trimmedValue) {
            return { isValid: false, error: `${fieldName} no puede estar vacío` };
        }
        
        return { isValid: true };
    } catch (error) {
        console.error('Error validating required field:', error);
        return { isValid: false, error: 'Error validando campo requerido' };
    }
}

function validateLength(value, minLength = 0, maxLength = Infinity, fieldName = 'Campo') {
    try {
        if (value === null || value === undefined) {
            return { isValid: false, error: `${fieldName} es requerido` };
        }
        
        const stringValue = String(value);
        const length = stringValue.length;
        
        if (length < minLength) {
            return { 
                isValid: false, 
                error: `${fieldName} debe tener al menos ${minLength} caracteres` 
            };
        }
        
        if (length > maxLength) {
            return { 
                isValid: false, 
                error: `${fieldName} no debe exceder ${maxLength} caracteres` 
            };
        }
        
        return { isValid: true };
    } catch (error) {
        console.error('Error validating length:', error);
        return { isValid: false, error: 'Error validando longitud' };
    }
}

function validatePattern(value, pattern, fieldName = 'Campo', patternDescription = '') {
    try {
        if (!value) {
            return { isValid: false, error: `${fieldName} es requerido` };
        }
        
        const regex = new RegExp(pattern);
        if (!regex.test(String(value))) {
            const errorMessage = patternDescription 
                ? `${fieldName} ${patternDescription}` 
                : `${fieldName} tiene formato inválido`;
            return { isValid: false, error: errorMessage };
        }
        
        return { isValid: true };
    } catch (error) {
        console.error('Error validating pattern:', error);
        return { isValid: false, error: 'Error validando formato' };
    }
}

// Enhanced date and time utilities
function formatDate(date, locale = 'es-ES', options = {}) {
    try {
        let dateObj = date;
        if (!(date instanceof Date)) {
            dateObj = new Date(date);
        }
        
        if (isNaN(dateObj.getTime())) {
            throw new Error('Invalid date');
        }
        
        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        
        return dateObj.toLocaleDateString(locale, { ...defaultOptions, ...options });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Fecha inválida';
    }
}

function formatTime(date, locale = 'es-ES', options = {}) {
    try {
        let dateObj = date;
        if (!(date instanceof Date)) {
            dateObj = new Date(date);
        }
        
        if (isNaN(dateObj.getTime())) {
            throw new Error('Invalid date');
        }
        
        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        
        return dateObj.toLocaleTimeString(locale, { ...defaultOptions, ...options });
    } catch (error) {
        console.error('Error formatting time:', error);
        return 'Hora inválida';
    }
}

function formatDateTime(date, locale = 'es-ES') {
    try {
        const formattedDate = formatDate(date, locale);
        const formattedTime = formatTime(date, locale);
        return `${formattedDate} ${formattedTime}`;
    } catch (error) {
        console.error('Error formatting datetime:', error);
        return 'Fecha y hora inválida';
    }
}

function isValidDate(date) {
    try {
        return date instanceof Date && !isNaN(date.getTime());
    } catch (error) {
        return false;
    }
}

function addDays(date, days) {
    try {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    } catch (error) {
        console.error('Error adding days to date:', error);
        return new Date();
    }
}

function getDateDifference(date1, date2, unit = 'days') {
    try {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        
        if (!isValidDate(d1) || !isValidDate(d2)) {
            throw new Error('Invalid dates provided');
        }
        
        const diffTime = Math.abs(d2 - d1);
        
        switch (unit) {
            case 'milliseconds':
                return diffTime;
            case 'seconds':
                return Math.floor(diffTime / 1000);
            case 'minutes':
                return Math.floor(diffTime / (1000 * 60));
            case 'hours':
                return Math.floor(diffTime / (1000 * 60 * 60));
            case 'days':
                return Math.floor(diffTime / (1000 * 60 * 60 * 24));
            default:
                return Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }
    } catch (error) {
        console.error('Error calculating date difference:', error);
        return 0;
    }
}

// Enhanced array utilities
function shuffleArray(array) {
    try {
        if (!Array.isArray(array)) {
            throw new Error('Input must be an array');
        }
        
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    } catch (error) {
        console.error('Error shuffling array:', error);
        return array || [];
    }
}

function removeDuplicates(array, keyFn = null) {
    try {
        if (!Array.isArray(array)) {
            throw new Error('Input must be an array');
        }
        
        if (keyFn && typeof keyFn === 'function') {
            const seen = new Set();
            return array.filter(item => {
                try {
                    const key = keyFn(item);
                    if (seen.has(key)) {
                        return false;
                    }
                    seen.add(key);
                    return true;
                } catch (e) {
                    console.warn('Error applying key function to item:', item, e);
                    return true; // Keep item if key function fails
                }
            });
        }
        
        return [...new Set(array)];
    } catch (error) {
        console.error('Error removing duplicates:', error);
        return array || [];
    }
}

function groupBy(array, keyFn) {
    try {
        if (!Array.isArray(array)) {
            throw new Error('Input must be an array');
        }
        
        if (typeof keyFn !== 'function') {
            throw new Error('Key function must be a function');
        }
        
        return array.reduce((groups, item) => {
            try {
                const key = keyFn(item);
                if (!groups[key]) {
                    groups[key] = [];
                }
                groups[key].push(item);
                return groups;
            } catch (e) {
                console.warn('Error applying key function to item:', item, e);
                return groups;
            }
        }, {});
    } catch (error) {
        console.error('Error grouping array:', error);
        return {};
    }
}

function sortArray(array, compareFn = null) {
    try {
        if (!Array.isArray(array)) {
            throw new Error('Input must be an array');
        }
        
        const newArray = [...array];
        
        if (compareFn && typeof compareFn === 'function') {
            return newArray.sort(compareFn);
        }
        
        return newArray.sort();
    } catch (error) {
        console.error('Error sorting array:', error);
        return array || [];
    }
}

// Enhanced DOM utilities
function createElement(tag, className = '', content = '', attributes = {}) {
    try {
        if (!tag || typeof tag !== 'string') {
            throw new Error('Tag name is required and must be a string');
        }
        
        const element = document.createElement(tag);
        
        if (className) {
            element.className = className;
        }
        
        if (content) {
            // Sanitize content before setting
            element.innerHTML = sanitizeHtml(content);
        }
        
        Object.entries(attributes).forEach(([key, value]) => {
            try {
                element.setAttribute(key, value);
            } catch (e) {
                console.warn(`Error setting attribute ${key}:`, e);
            }
        });
        
        return element;
    } catch (error) {
        console.error('Error creating element:', error);
        return document.createElement('div'); // Fallback
    }
}

function addEventListenerOnce(element, event, handler) {
    try {
        if (!element || typeof element.addEventListener !== 'function') {
            throw new Error('Invalid element provided');
        }
        
        if (typeof handler !== 'function') {
            throw new Error('Handler must be a function');
        }
        
        element.addEventListener(event, handler, { once: true });
        return true;
    } catch (error) {
        console.error('Error adding one-time event listener:', error);
        return false;
    }
}

function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        try {
            if (!selector || typeof selector !== 'string') {
                reject(new Error('Valid selector string is required'));
                return;
            }
            
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }
            
            const observer = new MutationObserver((mutations, obs) => {
                try {
                    const element = document.querySelector(selector);
                    if (element) {
                        obs.disconnect();
                        resolve(element);
                    }
                } catch (e) {
                    obs.disconnect();
                    reject(e);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            const timeoutId = setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
            
            // Store timeout ID for potential cleanup
            observer._timeoutId = timeoutId;
            
        } catch (error) {
            reject(error);
        }
    });
}

// Enhanced animation utilities
function fadeIn(element, duration = 300) {
    return new Promise((resolve, reject) => {
        try {
            if (!element) {
                reject(new Error('Element is required'));
                return;
            }
            
            element.style.opacity = '0';
            element.style.display = 'block';
            
            let start = null;
            function animate(timestamp) {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const opacity = Math.min(progress / duration, 1);
                
                element.style.opacity = opacity;
                
                if (progress < duration) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            }
            
            requestAnimationFrame(animate);
        } catch (error) {
            reject(error);
        }
    });
}

function fadeOut(element, duration = 300) {
    return new Promise((resolve, reject) => {
        try {
            if (!element) {
                reject(new Error('Element is required'));
                return;
            }
            
            element.style.opacity = '1';
            
            let start = null;
            function animate(timestamp) {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const opacity = Math.max(1 - (progress / duration), 0);
                
                element.style.opacity = opacity;
                
                if (progress < duration) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.display = 'none';
                    resolve();
                }
            }
            
            requestAnimationFrame(animate);
        } catch (error) {
            reject(error);
        }
    });
}

function slideDown(element, duration = 300) {
    return new Promise((resolve, reject) => {
        try {
            if (!element) {
                reject(new Error('Element is required'));
                return;
            }
            
            element.style.height = '0';
            element.style.overflow = 'hidden';
            element.style.display = 'block';
            
            const targetHeight = element.scrollHeight;
            
            let start = null;
            function animate(timestamp) {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const height = Math.min((progress / duration) * targetHeight, targetHeight);
                
                element.style.height = height + 'px';
                
                if (progress < duration) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.height = '';
                    element.style.overflow = '';
                    resolve();
                }
            }
            
            requestAnimationFrame(animate);
        } catch (error) {
            reject(error);
        }
    });
}

// Enhanced performance utilities
function debounce(func, wait, immediate = false) {
    try {
        if (typeof func !== 'function') {
            throw new Error('Function is required');
        }
        
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) {
                    try {
                        func(...args);
                    } catch (error) {
                        console.error('Error in debounced function:', error);
                    }
                }
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                try {
                    func(...args);
                } catch (error) {
                    console.error('Error in immediate debounced function:', error);
                }
            }
        };
    } catch (error) {
        console.error('Error creating debounced function:', error);
        return func || (() => {});
    }
}

function throttle(func, limit) {
    try {
        if (typeof func !== 'function') {
            throw new Error('Function is required');
        }
        
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                try {
                    func.apply(this, args);
                } catch (error) {
                    console.error('Error in throttled function:', error);
                }
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    } catch (error) {
        console.error('Error creating throttled function:', error);
        return func || (() => {});
    }
}

// Enhanced device detection
function isMobile() {
    try {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    } catch (error) {
        console.error('Error detecting mobile device:', error);
        return false;
    }
}

function isTouchDevice() {
    try {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    } catch (error) {
        console.error('Error detecting touch device:', error);
        return false;
    }
}

function getDeviceInfo() {
    try {
        return {
            isMobile: isMobile(),
            isTouchDevice: isTouchDevice(),
            screenWidth: window.screen?.width || 0,
            screenHeight: window.screen?.height || 0,
            viewportWidth: window.innerWidth || 0,
            viewportHeight: window.innerHeight || 0,
            pixelRatio: window.devicePixelRatio || 1,
            platform: navigator.platform || 'Unknown',
            userAgent: navigator.userAgent || 'Unknown'
        };
    } catch (error) {
        console.error('Error getting device info:', error);
        return {
            isMobile: false,
            isTouchDevice: false,
            screenWidth: 0,
            screenHeight: 0,
            viewportWidth: 0,
            viewportHeight: 0,
            pixelRatio: 1,
            platform: 'Unknown',
            userAgent: 'Unknown'
        };
    }
}

// Enhanced URL utilities
function getURLParameter(name) {
    try {
        if (!name || typeof name !== 'string') {
            throw new Error('Parameter name is required');
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    } catch (error) {
        console.error('Error getting URL parameter:', error);
        return null;
    }
}

function setURLParameter(name, value, replaceState = false) {
    try {
        if (!name || typeof name !== 'string') {
            throw new Error('Parameter name is required');
        }
        
        const url = new URL(window.location);
        url.searchParams.set(name, String(value));
        
        if (replaceState) {
            window.history.replaceState({}, '', url);
        } else {
            window.history.pushState({}, '', url);
        }
        
        return true;
    } catch (error) {
        console.error('Error setting URL parameter:', error);
        return false;
    }
}

function removeURLParameter(name, replaceState = false) {
    try {
        if (!name || typeof name !== 'string') {
            throw new Error('Parameter name is required');
        }
        
        const url = new URL(window.location);
        url.searchParams.delete(name);
        
        if (replaceState) {
            window.history.replaceState({}, '', url);
        } else {
            window.history.pushState({}, '', url);
        }
        
        return true;
    } catch (error) {
        console.error('Error removing URL parameter:', error);
        return false;
    }
}

// Enhanced color utilities
function hexToRgb(hex) {
    try {
        if (!hex || typeof hex !== 'string') {
            throw new Error('Valid hex color is required');
        }
        
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    } catch (error) {
        console.error('Error converting hex to RGB:', error);
        return null;
    }
}

function rgbToHex(r, g, b) {
    try {
        const red = Math.max(0, Math.min(255, Math.round(r)));
        const green = Math.max(0, Math.min(255, Math.round(g)));
        const blue = Math.max(0, Math.min(255, Math.round(b)));
        
        return "#" + ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1);
    } catch (error) {
        console.error('Error converting RGB to hex:', error);
        return '#000000';
    }
}

function lightenColor(hex, percent) {
    try {
        const rgb = hexToRgb(hex);
        if (!rgb) return hex;
        
        const { r, g, b } = rgb;
        const amount = Math.round(255 * (Math.max(0, Math.min(100, percent)) / 100));
        
        return rgbToHex(
            Math.min(255, r + amount),
            Math.min(255, g + amount),
            Math.min(255, b + amount)
        );
    } catch (error) {
        console.error('Error lightening color:', error);
        return hex;
    }
}

function darkenColor(hex, percent) {
    try {
        const rgb = hexToRgb(hex);
        if (!rgb) return hex;
        
        const { r, g, b } = rgb;
        const amount = Math.round(255 * (Math.max(0, Math.min(100, percent)) / 100));
        
        return rgbToHex(
            Math.max(0, r - amount),
            Math.max(0, g - amount),
            Math.max(0, b - amount)
        );
    } catch (error) {
        console.error('Error darkening color:', error);
        return hex;
    }
}

// Enhanced file utilities
function downloadBlob(blob, filename) {
    try {
        if (!blob || !(blob instanceof Blob)) {
            throw new Error('Valid Blob is required');
        }
        
        if (!filename || typeof filename !== 'string') {
            filename = 'download_' + Date.now();
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        
        // Make it invisible and add to DOM
        a.style.display = 'none';
        document.body.appendChild(a);
        
        // Trigger download
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        return true;
    } catch (error) {
        console.error('Error downloading blob:', error);
        return false;
    }
}

function downloadJSON(data, filename = 'data.json') {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        return downloadBlob(blob, filename);
    } catch (error) {
        console.error('Error downloading JSON:', error);
        return false;
    }
}

function downloadHTML(html, filename = 'document.html') {
    try {
        if (!html || typeof html !== 'string') {
            throw new Error('Valid HTML string is required');
        }
        
        const blob = new Blob([html], { type: 'text/html' });
        return downloadBlob(blob, filename);
    } catch (error) {
        console.error('Error downloading HTML:', error);
        return false;
    }
}

// Enhanced error handling utilities
function handleError(error, userMessage = 'Ha ocurrido un error', showToastNotification = true) {
    try {
        console.error('Error handled:', error);
        
        // Log additional error details
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        
        if (showToastNotification) {
            showToast('Error', userMessage, 'error', 6000);
        }
        
        return {
            handled: true,
            originalError: error,
            userMessage: userMessage,
            timestamp: new Date().toISOString()
        };
    } catch (handlingError) {
        console.error('Error handling error:', handlingError);
        return {
            handled: false,
            originalError: error,
            handlingError: handlingError
        };
    }
}

function handleAsyncError(asyncFn) {
    return async (...args) => {
        try {
            return await asyncFn(...args);
        } catch (error) {
            handleError(error);
            throw error;
        }
    };
}

// Enhanced loading state management
function setButtonLoading(button, loading = true, loadingText = 'Cargando...') {
    try {
        if (!button || typeof button.classList?.add !== 'function') {
            throw new Error('Valid button element is required');
        }
        
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
            
            // Store original text
            if (!button.dataset.originalText) {
                button.dataset.originalText = button.textContent;
            }
            
            button.textContent = loadingText;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            
            // Restore original text
            if (button.dataset.originalText) {
                button.textContent = button.dataset.originalText;
                delete button.dataset.originalText;
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error setting button loading state:', error);
        return false;
    }
}

// Enhanced accessibility utilities
function announceToScreenReader(message, priority = 'polite') {
    try {
        if (!message || typeof message !== 'string') {
            throw new Error('Valid message is required');
        }
        
        const validPriorities = ['polite', 'assertive', 'off'];
        const ariaPriority = validPriorities.includes(priority) ? priority : 'polite';
        
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', ariaPriority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.setAttribute('role', 'status');
        announcement.style.position = 'absolute';
        announcement.style.left = '-9999px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        
        document.body.appendChild(announcement);
        announcement.textContent = message;
        
        setTimeout(() => {
            if (announcement.parentElement) {
                document.body.removeChild(announcement);
            }
        }, 2000);
        
        return true;
    } catch (error) {
        console.error('Error announcing to screen reader:', error);
        return false;
    }
}

// Enhanced focus management
function trapFocus(element) {
    try {
        if (!element || typeof element.querySelectorAll !== 'function') {
            throw new Error('Valid element is required');
        }
        
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const focusableArray = Array.from(focusableElements);
        const firstElement = focusableArray[0];
        const lastElement = focusableArray[focusableArray.length - 1];
        
        if (!firstElement) {
            return null; // No focusable elements found
        }
        
        function handleTabKey(e) {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
        
        element.addEventListener('keydown', handleTabKey);
        
        // Focus the first element
        firstElement.focus();
        
        // Return cleanup function
        return () => {
            element.removeEventListener('keydown', handleTabKey);
        };
    } catch (error) {
        console.error('Error trapping focus:', error);
        return null;
    }
}

// Keyboard navigation helper
function addKeyboardNavigation(elements, options = {}) {
    try {
        if (!Array.isArray(elements) || elements.length === 0) {
            throw new Error('Valid elements array is required');
        }
        
        const {
            wrapAround = true,
            activateOnEnter = true,
            activateOnSpace = true
        } = options;
        
        let currentIndex = 0;
        
        function handleKeyDown(e) {
            const { key } = e;
            
            switch (key) {
                case 'ArrowDown':
                case 'ArrowRight':
                    e.preventDefault();
                    currentIndex = wrapAround 
                        ? (currentIndex + 1) % elements.length
                        : Math.min(currentIndex + 1, elements.length - 1);
                    elements[currentIndex].focus();
                    break;
                    
                case 'ArrowUp':
                case 'ArrowLeft':
                    e.preventDefault();
                    currentIndex = wrapAround 
                        ? (currentIndex - 1 + elements.length) % elements.length
                        : Math.max(currentIndex - 1, 0);
                    elements[currentIndex].focus();
                    break;
                    
                case 'Home':
                    e.preventDefault();
                    currentIndex = 0;
                    elements[currentIndex].focus();
                    break;
                    
                case 'End':
                    e.preventDefault();
                    currentIndex = elements.length - 1;
                    elements[currentIndex].focus();
                    break;
                    
                case 'Enter':
                    if (activateOnEnter) {
                        elements[currentIndex].click();
                    }
                    break;
                    
                case ' ':
                    if (activateOnSpace) {
                        e.preventDefault();
                        elements[currentIndex].click();
                    }
                    break;
            }
        }
        
        // Add event listeners to all elements
        elements.forEach((element, index) => {
            element.addEventListener('keydown', handleKeyDown);
            element.addEventListener('focus', () => {
                currentIndex = index;
            });
            
            // Make elements focusable if they aren't already
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', index === 0 ? '0' : '-1');
            }
        });
        
        // Return cleanup function
        return () => {
            elements.forEach(element => {
                element.removeEventListener('keydown', handleKeyDown);
            });
        };
    } catch (error) {
        console.error('Error adding keyboard navigation:', error);
        return null;
    }
}

// Initialize utility functions
document.addEventListener('DOMContentLoaded', () => {
    // Clear expired localStorage on page load
    clearExpiredLocalStorage();
    
    // Log utility initialization
    console.log('UCSG Schedule App utilities initialized');
});

