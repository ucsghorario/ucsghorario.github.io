// Utility functions and global helpers

// Toast notification system
function showToast(title, message, type = 'info', duration = 5000) {
    const container = document.getElementById('toastContainer');
    const toast = createToastElement(title, message, type);
    
    container.appendChild(toast);
    
    // Auto remove after duration
    setTimeout(() => {
        removeToast(toast);
    }, duration);
    
    return toast;
}

function createToastElement(title, message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="${iconMap[type] || iconMap.info}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="removeToast(this.parentElement)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    return toast;
}

function removeToast(toast) {
    if (toast && toast.parentElement) {
        toast.classList.add('removing');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 250);
    }
}

// Local Storage utilities
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showToast('Error de almacenamiento', 'No se pudo guardar la información', 'error');
        return false;
    }
}

function loadFromLocalStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return defaultValue;
    }
}

function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

// Form validation utilities
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

function validateUCSGEmail(email) {
    const ucsgRegex = /^[a-zA-Z0-9._%+-]+@cu\.ucsg\.edu\.ec$/;
    return ucsgRegex.test(email);
}

function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

function validateRequired(value) {
    return value && value.toString().trim().length > 0;
}

// Date and time utilities
function formatDate(date, locale = 'es-ES') {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    return date.toLocaleDateString(locale);
}

function formatTime(date, locale = 'es-ES') {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    return date.toLocaleTimeString(locale, { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function formatDateTime(date, locale = 'es-ES') {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    return date.toLocaleString(locale);
}

function isValidDate(date) {
    return date instanceof Date && !isNaN(date);
}

// Array utilities
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function removeDuplicates(array, keyFn = null) {
    if (keyFn) {
        const seen = new Set();
        return array.filter(item => {
            const key = keyFn(item);
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
    return [...new Set(array)];
}

function groupBy(array, keyFn) {
    return array.reduce((groups, item) => {
        const key = keyFn(item);
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {});
}

// DOM utilities
function createElement(tag, className = '', content = '', attributes = {}) {
    const element = document.createElement(tag);
    
    if (className) {
        element.className = className;
    }
    
    if (content) {
        element.innerHTML = content;
    }
    
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    
    return element;
}

function addEventListenerOnce(element, event, handler) {
    element.addEventListener(event, handler, { once: true });
}

function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }
        
        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                obs.disconnect();
                resolve(element);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

// Animation utilities
function fadeIn(element, duration = 300) {
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
        }
    }
    
    requestAnimationFrame(animate);
}

function fadeOut(element, duration = 300) {
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
        }
    }
    
    requestAnimationFrame(animate);
}

function slideDown(element, duration = 300) {
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
        }
    }
    
    requestAnimationFrame(animate);
}

// Performance utilities
function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Mobile detection
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// URL utilities
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function setURLParameter(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.pushState({}, '', url);
}

function removeURLParameter(name) {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.pushState({}, '', url);
}

// Color utilities for theme generation
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function lightenColor(hex, percent) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    const { r, g, b } = rgb;
    const amount = Math.round(255 * (percent / 100));
    
    return rgbToHex(
        Math.min(255, r + amount),
        Math.min(255, g + amount),
        Math.min(255, b + amount)
    );
}

function darkenColor(hex, percent) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    const { r, g, b } = rgb;
    const amount = Math.round(255 * (percent / 100));
    
    return rgbToHex(
        Math.max(0, r - amount),
        Math.max(0, g - amount),
        Math.max(0, b - amount)
    );
}

// File utilities
function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, filename);
}

function downloadHTML(html, filename) {
    const blob = new Blob([html], { type: 'text/html' });
    downloadBlob(blob, filename);
}

// Error handling utilities
function handleError(error, userMessage = 'Ha ocurrido un error') {
    console.error('Error:', error);
    showToast('Error', userMessage, 'error');
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

// Loading state management
function setButtonLoading(button, loading = true) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Accessibility utilities
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-9999px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Focus management
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    });
}

// Export utilities for module system (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showToast,
        saveToLocalStorage,
        loadFromLocalStorage,
        validateEmail,
        validateUCSGEmail,
        formatDate,
        formatTime,
        debounce,
        throttle,
        isMobile,
        isTouchDevice
    };
}
