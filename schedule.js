// Enhanced Schedule Management System with comprehensive error handling and debugging
class ScheduleManager {
    constructor() {
        try {
            this.savedSchedules = JSON.parse(localStorage.getItem('savedSchedules') || '{}');
            this.currentScheduleData = null;
            this.timeSlots = [
                '07:00-09:00',
                '08:00-10:00',
                '09:00-11:00', 
                '10:00-12:00',
                '11:00-13:00',
                '13:00-15:00',
                '14:00-16:00',
                '15:00-17:00',
                '16:00-18:00'
            ];
            this.weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
            this.subjects = [];
            this.debugMode = true;
            this.validationErrors = [];
            
            // All supported careers - no restrictions
            this.supportedCareers = [
                'Ingeniería en Sistemas',
                'Ingeniería Industrial', 
                'Administración de Empresas',
                'Contabilidad y Auditoría',
                'Derecho',
                'Medicina',
                'Psicología',
                'Arquitectura',
                'Comunicación Social',
                'Marketing'
            ];
            
            this.debugLog('ScheduleManager initialized successfully');
        } catch (error) {
            console.error('Error initializing ScheduleManager:', error);
            this.savedSchedules = {};
            this.subjects = [];
        }
    }

    debugLog(message, data = null) {
        if (this.debugMode) {
            console.log(`[ScheduleManager] ${message}`, data || '');
        }
    }

    debugError(message, error) {
        console.error(`[ScheduleManager Error] ${message}`, error);
    }

    // Enhanced validation with detailed error reporting
    validateConfiguration() {
        this.validationErrors = [];
        
        try {
            const course = document.getElementById('curso')?.value?.trim();
            const career = document.getElementById('carrera')?.value?.trim();
            const numSubjects = document.getElementById('numMaterias')?.value;

            // Course validation
            if (!course) {
                this.validationErrors.push({
                    field: 'curso',
                    message: 'Debe seleccionar un curso',
                    details: 'El campo curso es obligatorio para continuar'
                });
            }

            // Career validation - ensure all careers are supported
            if (!career) {
                this.validationErrors.push({
                    field: 'carrera',
                    message: 'Debe seleccionar una carrera',
                    details: 'El campo carrera es obligatorio para continuar'
                });
            } else if (!this.supportedCareers.includes(career)) {
                this.validationErrors.push({
                    field: 'carrera',
                    message: 'Carrera no soportada',
                    details: `La carrera "${career}" no está en la lista de carreras soportadas`
                });
                this.debugError('Unsupported career detected', { career, supported: this.supportedCareers });
            }

            // Number of subjects validation
            if (!numSubjects || isNaN(parseInt(numSubjects))) {
                this.validationErrors.push({
                    field: 'numMaterias',
                    message: 'Debe seleccionar el número de materias',
                    details: 'El número de materias debe ser un valor válido'
                });
            } else {
                const num = parseInt(numSubjects);
                if (num < 3 || num > 8) {
                    this.validationErrors.push({
                        field: 'numMaterias',
                        message: 'Número de materias inválido',
                        details: 'El número de materias debe estar entre 3 y 8'
                    });
                }
            }

            this.debugLog('Configuration validation completed', {
                errors: this.validationErrors.length,
                course,
                career,
                numSubjects
            });

            return this.validationErrors.length === 0;
        } catch (error) {
            this.debugError('Error during configuration validation', error);
            this.validationErrors.push({
                field: 'general',
                message: 'Error de validación',
                details: 'Ocurrió un error durante la validación de la configuración'
            });
            return false;
        }
    }

    displayValidationErrors() {
        try {
            // Clear previous errors
            this.clearAllFieldErrors();

            if (this.validationErrors.length === 0) return;

            // Display individual field errors
            this.validationErrors.forEach(error => {
                const errorElementId = error.field + 'Error';
                this.showDetailedFieldError(errorElementId, error.message, [error.details]);
            });

            // Show summary toast if multiple errors
            if (this.validationErrors.length > 1) {
                const errorSummary = this.validationErrors.map(e => e.message).join(', ');
                showToast('Múltiples errores encontrados', 
                    `Se encontraron ${this.validationErrors.length} errores: ${errorSummary}`, 
                    'error', 8000);
            } else {
                showToast('Error de validación', this.validationErrors[0].message, 'error', 6000);
            }

            this.debugLog('Validation errors displayed', this.validationErrors);
        } catch (error) {
            this.debugError('Error displaying validation errors', error);
        }
    }

    clearAllFieldErrors() {
        try {
            ['curso', 'carrera', 'numMaterias'].forEach(fieldId => {
                const errorElement = document.getElementById(fieldId + 'Error');
                if (errorElement) {
                    errorElement.classList.remove('active');
                    errorElement.innerHTML = '';
                }
                
                const field = document.getElementById(fieldId);
                if (field) {
                    field.classList.remove('error', 'success');
                }
            });
        } catch (error) {
            this.debugError('Error clearing field errors', error);
        }
    }

    showDetailedFieldError(fieldId, title, errors) {
        try {
            const errorElement = document.getElementById(fieldId);
            if (!errorElement) {
                this.debugError(`Error element not found: ${fieldId}`);
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
            
            // Also mark the field as having an error
            const fieldElement = document.getElementById(fieldId.replace('Error', ''));
            if (fieldElement) {
                fieldElement.classList.add('error');
                fieldElement.classList.remove('success');
            }
            
        } catch (error) {
            this.debugError('Error showing detailed field error', error);
        }
    }

    generateSubjectFields() {
        this.debugLog('Starting subject fields generation');
        
        try {
            // Validate configuration first
            if (!this.validateConfiguration()) {
                this.displayValidationErrors();
                return;
            }

            const course = document.getElementById('curso').value;
            const career = document.getElementById('carrera').value;
            const numSubjects = parseInt(document.getElementById('numMaterias').value);

            this.debugLog('Configuration validated successfully', { course, career, numSubjects });

            this.createSubjectInputs(numSubjects);
            this.showSection('subjectsSection');
            this.hideSection('courseConfigSection');

            // Show success message
            showToast('Configuración válida', 
                `Se crearon ${numSubjects} campos para materias del curso ${course} de ${career}`, 
                'success', 4000);

            // Animate the transition
            setTimeout(() => {
                const subjectsContainer = document.getElementById('subjectsContainer');
                if (subjectsContainer) {
                    subjectsContainer.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 300);

        } catch (error) {
            this.debugError('Error generating subject fields', error);
            showToast('Error', 'No se pudieron generar los campos de materias', 'error');
        }
    }

    createSubjectInputs(numSubjects) {
        try {
            const container = document.getElementById('subjectsContainer');
            if (!container) {
                throw new Error('Subjects container not found');
            }
            
            container.innerHTML = '';

            for (let i = 1; i <= numSubjects; i++) {
                const subjectCard = this.createSubjectCard(i);
                container.appendChild(subjectCard);
            }

            this.debugLog(`Created ${numSubjects} subject input cards`);
        } catch (error) {
            this.debugError('Error creating subject inputs', error);
            throw error;
        }
    }

    createSubjectCard(index) {
        try {
            const card = document.createElement('div');
            card.className = 'subject-card';
            card.setAttribute('data-subject-index', index);
            
            card.innerHTML = `
                <h4>
                    <i class="fas fa-book"></i>
                    Materia ${index}
                </h4>
                <div class="form-group">
                    <label for="subject${index}" class="required">Nombre de la Materia</label>
                    <input 
                        type="text" 
                        id="subject${index}" 
                        class="form-input" 
                        placeholder="Ej: Cálculo I, Programación, etc."
                        required
                        maxlength="50"
                        data-field="subject-name"
                        data-index="${index}"
                    >
                    <div id="subject${index}Error" class="field-error"></div>
                </div>
                <div class="form-group">
                    <label for="professor${index}" class="required">Profesor</label>
                    <input 
                        type="text" 
                        id="professor${index}" 
                        class="form-input" 
                        placeholder="Ej: Dr. Juan Pérez"
                        required
                        maxlength="50"
                        data-field="professor-name"
                        data-index="${index}"
                    >
                    <div id="professor${index}Error" class="field-error"></div>
                </div>
                <div class="form-group">
                    <label for="credits${index}">Créditos</label>
                    <select id="credits${index}" class="form-select" data-field="credits" data-index="${index}">
                        <option value="1">1 crédito</option>
                        <option value="2">2 créditos</option>
                        <option value="3" selected>3 créditos</option>
                        <option value="4">4 créditos</option>
                        <option value="5">5 créditos</option>
                    </select>
                    <div id="credits${index}Error" class="field-error"></div>
                </div>
            `;

            // Add real-time validation
            this.setupSubjectCardValidation(card, index);

            // Add animation
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);

            return card;
        } catch (error) {
            this.debugError(`Error creating subject card ${index}`, error);
            throw error;
        }
    }

    setupSubjectCardValidation(card, index) {
        try {
            const subjectInput = card.querySelector(`#subject${index}`);
            const professorInput = card.querySelector(`#professor${index}`);

            if (subjectInput) {
                let subjectTimeout;
                subjectInput.addEventListener('input', () => {
                    clearTimeout(subjectTimeout);
                    subjectTimeout = setTimeout(() => {
                        this.validateSubjectField(index, 'subject', subjectInput.value);
                    }, 500);
                });

                subjectInput.addEventListener('blur', () => {
                    this.validateSubjectField(index, 'subject', subjectInput.value);
                });
            }

            if (professorInput) {
                let professorTimeout;
                professorInput.addEventListener('input', () => {
                    clearTimeout(professorTimeout);
                    professorTimeout = setTimeout(() => {
                        this.validateSubjectField(index, 'professor', professorInput.value);
                    }, 500);
                });

                professorInput.addEventListener('blur', () => {
                    this.validateSubjectField(index, 'professor', professorInput.value);
                });
            }

            this.debugLog(`Validation setup completed for subject card ${index}`);
        } catch (error) {
            this.debugError(`Error setting up validation for subject card ${index}`, error);
        }
    }

    validateSubjectField(index, fieldType, value) {
        try {
            const fieldId = fieldType === 'subject' ? `subject${index}` : `professor${index}`;
            const errorId = fieldId + 'Error';
            const fieldElement = document.getElementById(fieldId);
            const errorElement = document.getElementById(errorId);

            if (!fieldElement || !errorElement) {
                this.debugError(`Field or error element not found for ${fieldId}`);
                return false;
            }

            // Clear previous state
            fieldElement.classList.remove('error', 'success');
            errorElement.classList.remove('active');
            errorElement.innerHTML = '';

            const trimmedValue = value.trim();

            // Empty value check
            if (!trimmedValue) {
                this.showFieldError(errorId, `El ${fieldType === 'subject' ? 'nombre de la materia' : 'nombre del profesor'} es requerido`);
                fieldElement.classList.add('error');
                return false;
            }

            // Length validation
            if (trimmedValue.length < 2) {
                this.showFieldError(errorId, `El ${fieldType === 'subject' ? 'nombre de la materia' : 'nombre del profesor'} debe tener al menos 2 caracteres`);
                fieldElement.classList.add('error');
                return false;
            }

            if (trimmedValue.length > 50) {
                this.showFieldError(errorId, `El ${fieldType === 'subject' ? 'nombre de la materia' : 'nombre del profesor'} no debe exceder 50 caracteres`);
                fieldElement.classList.add('error');
                return false;
            }

            // Pattern validation
            const validPattern = /^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ0-9\s\-\.,:()]+$/;
            if (!validPattern.test(trimmedValue)) {
                this.showFieldError(errorId, `El ${fieldType === 'subject' ? 'nombre de la materia' : 'nombre del profesor'} contiene caracteres no válidos`);
                fieldElement.classList.add('error');
                return false;
            }

            // Duplicate validation for subjects
            if (fieldType === 'subject') {
                const isDuplicate = this.checkForDuplicateSubject(index, trimmedValue);
                if (isDuplicate) {
                    this.showFieldError(errorId, 'Ya existe una materia con este nombre');
                    fieldElement.classList.add('error');
                    return false;
                }
            }

            // Success state
            fieldElement.classList.add('success');
            this.showFieldSuccess(errorId, '✓ Válido');
            return true;

        } catch (error) {
            this.debugError(`Error validating subject field ${index}-${fieldType}`, error);
            return false;
        }
    }

    checkForDuplicateSubject(currentIndex, subjectName) {
        try {
            const numSubjects = parseInt(document.getElementById('numMaterias')?.value || '0');
            
            for (let i = 1; i <= numSubjects; i++) {
                if (i === currentIndex) continue;
                
                const otherSubjectInput = document.getElementById(`subject${i}`);
                if (otherSubjectInput && otherSubjectInput.value.trim().toLowerCase() === subjectName.toLowerCase()) {
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            this.debugError('Error checking for duplicate subjects', error);
            return false;
        }
    }

    showFieldError(fieldId, message) {
        try {
            const errorElement = document.getElementById(fieldId);
            if (errorElement) {
                errorElement.innerHTML = `<div class="field-error active">${message}</div>`;
                errorElement.classList.add('active');
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
            }
        } catch (error) {
            this.debugError('Error showing field success', error);
        }
    }

    proceedToSchedule() {
        this.debugLog('Starting schedule generation validation');
        
        try {
            const numSubjects = parseInt(document.getElementById('numMaterias')?.value || '0');
            const subjects = [];
            let hasErrors = false;

            // Validate and collect subject data
            for (let i = 1; i <= numSubjects; i++) {
                const subjectNameElement = document.getElementById(`subject${i}`);
                const professorElement = document.getElementById(`professor${i}`);
                const creditsElement = document.getElementById(`credits${i}`);

                if (!subjectNameElement || !professorElement || !creditsElement) {
                    this.debugError(`Subject elements not found for index ${i}`);
                    hasErrors = true;
                    continue;
                }

                const subjectName = subjectNameElement.value.trim();
                const professor = professorElement.value.trim();
                const credits = parseInt(creditsElement.value);

                // Validate individual fields
                const isSubjectValid = this.validateSubjectField(i, 'subject', subjectName);
                const isProfessorValid = this.validateSubjectField(i, 'professor', professor);

                if (!isSubjectValid || !isProfessorValid) {
                    hasErrors = true;
                    continue;
                }

                // Additional validation for credits
                if (isNaN(credits) || credits < 1 || credits > 5) {
                    this.showFieldError(`credits${i}Error`, 'Los créditos deben estar entre 1 y 5');
                    hasErrors = true;
                    continue;
                }

                subjects.push({
                    name: subjectName,
                    professor: professor,
                    credits: credits,
                    id: i,
                    index: i
                });
            }

            if (hasErrors) {
                showToast('Campos incompletos', 
                    'Por favor, corrija los errores en los campos de materias antes de continuar', 
                    'warning', 6000);
                return;
            }

            if (subjects.length === 0) {
                showToast('Sin materias', 'No se han definido materias válidas', 'error');
                return;
            }

            this.subjects = subjects;
            this.debugLog(`Successfully validated ${subjects.length} subjects`, subjects);
            
            // Show schedule generation section
            this.showSection('scheduleSection');
            this.hideSection('subjectsSection');

            showToast('Materias validadas', 
                `Se han validado ${subjects.length} materias correctamente`, 
                'success', 4000);

            // Scroll to schedule section
            setTimeout(() => {
                const scheduleSection = document.getElementById('scheduleSection');
                if (scheduleSection) {
                    scheduleSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 300);

        } catch (error) {
            this.debugError('Error proceeding to schedule', error);
            showToast('Error', 'Error procesando las materias', 'error');
        }
    }

    generateSchedule() {
        this.debugLog('Starting schedule generation');
        
        try {
            if (this.subjects.length === 0) {
                showToast('Error', 'No hay materias configuradas', 'error');
                return;
            }

            const startTimeElement = document.getElementById('horaInicio');
            if (!startTimeElement) {
                throw new Error('Start time element not found');
            }

            const startTime = startTimeElement.value;
            const startIndex = this.timeSlots.findIndex(slot => slot.startsWith(startTime));

            if (startIndex === -1) {
                showToast('Hora inválida', 'Seleccione una hora de inicio válida', 'error');
                return;
            }

            // Show loading state
            const generateBtn = document.querySelector('button[onclick="generateSchedule()"]');
            if (generateBtn) {
                this.setButtonLoading(generateBtn, true);
            }

            this.debugLog('Schedule generation parameters', {
                subjects: this.subjects.length,
                startTime,
                startIndex
            });

            setTimeout(() => {
                try {
                    const schedule = this.createScheduleMatrix(startIndex);
                    this.displaySchedule(schedule);
                    
                    // Ensure the schedule section is visible
                    this.showSection('scheduleSection');
                    
                    const saveBtn = document.getElementById('saveScheduleBtn');
                    if (saveBtn) {
                        saveBtn.classList.remove('hidden');
                    }
                    
                    showToast('Horario generado', 
                        'El horario se ha creado exitosamente. El horario permanecerá visible hasta que lo guardes o canceles.', 
                        'success', 8000);
                    
                    // Scroll to the schedule preview to ensure it's visible
                    setTimeout(() => {
                        const schedulePreview = document.getElementById('schedulePreview');
                        if (schedulePreview) {
                            schedulePreview.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'start' 
                            });
                        }
                    }, 500);
                    
                } catch (error) {
                    this.debugError('Error during schedule generation', error);
                    showToast('Error de generación', 
                        'No se pudo generar el horario: ' + error.message, 
                        'error', 6000);
                } finally {
                    if (generateBtn) {
                        this.setButtonLoading(generateBtn, false);
                    }
                }
            }, 1500);

        } catch (error) {
            this.debugError('Error starting schedule generation', error);
            showToast('Error', 'Error iniciando la generación del horario', 'error');
        }
    }

    createScheduleMatrix(startIndex) {
        this.debugLog('Creating schedule matrix', { startIndex, subjects: this.subjects.length });
        
        try {
            // Initialize empty schedule matrix
            const schedule = [];
            for (let i = 0; i < this.timeSlots.length; i++) {
                schedule[i] = new Array(this.weekDays.length).fill(null);
            }

            // Calculate available slots
            const availableSlots = [];
            for (let day = 0; day < this.weekDays.length; day++) {
                for (let time = startIndex; time < this.timeSlots.length - 1; time++) {
                    availableSlots.push({ day, time });
                }
            }

            this.debugLog(`Available slots: ${availableSlots.length}`);

            if (availableSlots.length < this.subjects.length * 2) {
                throw new Error(`Insuficientes espacios disponibles. Se necesitan al menos ${this.subjects.length * 2} espacios, pero solo hay ${availableSlots.length} disponibles.`);
            }

            // Shuffle slots for random distribution
            this.shuffleArray(availableSlots);

            // Schedule each subject
            this.subjects.forEach((subject, index) => {
                if (availableSlots.length === 0) {
                    throw new Error(`No hay espacios suficientes para la materia ${subject.name}`);
                }

                // Determine slots needed based on credits
                const slotsNeeded = Math.max(1, Math.floor(subject.credits / 2));
                let slotsAssigned = 0;

                for (let i = 0; i < slotsNeeded && availableSlots.length > 0; i++) {
                    const position = availableSlots.shift();
                    
                    // Try to place consecutive slots if possible
                    if (position && position.time + 1 < this.timeSlots.length && 
                        schedule[position.time + 1][position.day] === null) {
                        
                        schedule[position.time][position.day] = subject;
                        schedule[position.time + 1][position.day] = subject;
                        slotsAssigned += 2;
                        
                        // Remove the consecutive slot from available positions
                        const nextSlotIndex = availableSlots.findIndex(
                            slot => slot.day === position.day && slot.time === position.time + 1
                        );
                        if (nextSlotIndex !== -1) {
                            availableSlots.splice(nextSlotIndex, 1);
                        }
                        
                    } else if (position) {
                        // Place single slot
                        schedule[position.time][position.day] = subject;
                        slotsAssigned += 1;
                    }
                }

                this.debugLog(`Subject "${subject.name}" assigned ${slotsAssigned} slots`);
            });

            this.currentScheduleData = schedule;
            this.debugLog('Schedule matrix created successfully');
            
            return schedule;
            
        } catch (error) {
            this.debugError('Error creating schedule matrix', error);
            throw error;
        }
    }

    displaySchedule(schedule) {
        try {
            const container = document.getElementById('schedulePreview');
            if (!container) {
                throw new Error('Schedule preview container not found');
            }
            
            // Ensure the container is visible and persistent
            container.style.display = 'block';
            container.style.visibility = 'visible';
            
            let html = `
                <div class="schedule-container">
                    <div class="schedule-header">
                        <h4><i class="fas fa-calendar-alt"></i> Horario Generado</h4>
                        <p class="schedule-subtitle">Horario creado exitosamente. Revisa y guarda si estás conforme.</p>
                    </div>
                    <table class="schedule-table">
                        <thead>
                            <tr>
                                <th>Hora</th>
                                ${this.weekDays.map(day => `<th>${day}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
            `;

            for (let timeIndex = 0; timeIndex < this.timeSlots.length; timeIndex++) {
                html += `<tr><td><strong>${this.timeSlots[timeIndex]}</strong></td>`;
                
                for (let dayIndex = 0; dayIndex < this.weekDays.length; dayIndex++) {
                    const subject = schedule[timeIndex][dayIndex];
                    
                    if (subject) {
                        const subjectClass = `subject-cell subject-${subject.id % 8 + 1}`;
                        html += `
                            <td class="${subjectClass}" title="Materia: ${subject.name} | Profesor: ${subject.professor} | Créditos: ${subject.credits}">
                                <div class="subject-name">${subject.name}</div>
                                <div class="professor-name">${subject.professor}</div>
                                <div class="credits-info">${subject.credits} créditos</div>
                            </td>
                        `;
                    } else {
                        html += '<td class="empty-slot"></td>';
                    }
                }
                
                html += '</tr>';
            }

            html += `
                        </tbody>
                    </table>
                </div>
            `;
            
            container.innerHTML = html;
            
            // Make sure the container stays visible
            container.classList.remove('hidden');
            container.style.opacity = '1';

            // Add animation to schedule with better timing
            setTimeout(() => {
                container.classList.add('schedule-generating');
                
                // Add staggered animation to subject cells
                const subjectCells = container.querySelectorAll('.subject-cell');
                subjectCells.forEach((cell, index) => {
                    cell.style.opacity = '0';
                    cell.style.transform = 'scale(0.8)';
                    
                    setTimeout(() => {
                        cell.style.transition = 'all 0.4s ease';
                        cell.style.opacity = '1';
                        cell.style.transform = 'scale(1)';
                        cell.classList.add('subject-cell-enter');
                    }, index * 100); // Reduced delay for faster animation
                });
            }, 200);

            this.debugLog('Schedule displayed successfully with persistence');
            
        } catch (error) {
            this.debugError('Error displaying schedule', error);
            throw error;
        }
    }

    saveSchedule() {
        this.debugLog('Starting schedule save process');
        
        try {
            if (!this.currentScheduleData) {
                showToast('Error', 'No hay horario para guardar', 'error');
                return;
            }

            const courseElement = document.getElementById('curso');
            const careerElement = document.getElementById('carrera');
            
            if (!courseElement || !careerElement) {
                throw new Error('Course or career elements not found');
            }
            
            const course = courseElement.value;
            const career = careerElement.value;
            
            // Create schedule HTML for storage
            const schedulePreview = document.getElementById('schedulePreview');
            if (!schedulePreview) {
                throw new Error('Schedule preview not found');
            }
            
            const scheduleHtml = schedulePreview.innerHTML;
            
            // Save to memory and localStorage
            this.savedSchedules[course] = {
                html: scheduleHtml,
                data: this.currentScheduleData,
                subjects: [...this.subjects], // Create a copy
                career: career,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                subjectCount: this.subjects.length,
                version: '2.0'
            };

            // Save to localStorage with error handling
            try {
                localStorage.setItem('savedSchedules', JSON.stringify(this.savedSchedules));
                this.debugLog(`Schedule saved successfully for course ${course}`);
            } catch (storageError) {
                this.debugError('Error saving to localStorage', storageError);
                showToast('Advertencia', 'El horario se guardó en memoria pero no pudo guardarse permanentemente', 'warning');
            }

            // Update UI
            this.refreshSavedSchedules();
            
            // Reset form and return to main admin screen
            this.resetAdminForm();
            
            showToast('Guardado exitoso', 
                `Horario guardado correctamente para el Curso ${course} de ${career}`, 
                'success', 6000);
            
        } catch (error) {
            this.debugError('Error saving schedule', error);
            showToast('Error de guardado', 
                'No se pudo guardar el horario: ' + error.message, 
                'error');
        }
    }

    refreshSavedSchedules() {
        try {
            const container = document.getElementById('savedSchedules');
            const countBadge = document.getElementById('schedulesCount');
            
            if (!container || !countBadge) {
                this.debugError('Saved schedules container or count badge not found');
                return;
            }
            
            const scheduleCount = Object.keys(this.savedSchedules).length;
            countBadge.textContent = scheduleCount;

            if (scheduleCount === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-folder-open"></i>
                        <h4>No hay horarios guardados</h4>
                        <p>Crea tu primer horario para comenzar a gestionar los cursos</p>
                    </div>
                `;
                this.debugLog('No saved schedules found');
                return;
            }

            container.innerHTML = '';
            
            Object.entries(this.savedSchedules).forEach(([course, scheduleData]) => {
                try {
                    const card = this.createScheduleCard(course, scheduleData);
                    container.appendChild(card);
                } catch (cardError) {
                    this.debugError(`Error creating card for course ${course}`, cardError);
                }
            });
            
            this.debugLog(`Refreshed ${scheduleCount} saved schedules`);
            
        } catch (error) {
            this.debugError('Error refreshing saved schedules', error);
        }
    }

    createScheduleCard(course, scheduleData) {
        try {
            const card = document.createElement('div');
            card.className = 'schedule-card';
            card.setAttribute('data-course', course);
            
            const createdDate = new Date(scheduleData.createdAt).toLocaleDateString('es-ES');
            const lastUpdated = new Date(scheduleData.lastUpdated).toLocaleDateString('es-ES');
            const subjectCount = scheduleData.subjects?.length || scheduleData.subjectCount || 0;
            
            card.innerHTML = `
                <div class="schedule-card-header">
                    <h4 class="schedule-card-title">
                        <i class="fas fa-calendar-alt"></i>
                        Curso ${course}
                    </h4>
                    <div class="schedule-card-actions">
                        <button class="btn-icon btn-outline" onclick="editSchedule('${course}')" title="Editar horario">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-outline" onclick="viewSchedule('${course}')" title="Ver horario">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-outline" onclick="deleteSchedule('${course}')" title="Eliminar horario">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="schedule-card-meta">
                    <div class="schedule-card-stat">
                        <span class="schedule-card-stat-value">${subjectCount}</span>
                        <span class="schedule-card-stat-label">Materias</span>
                    </div>
                    <div class="schedule-card-stat">
                        <span class="schedule-card-stat-value">${scheduleData.career?.split(' ').length || 1}</span>
                        <span class="schedule-card-stat-label">Carrera</span>
                    </div>
                </div>
                
                <div class="schedule-card-info">
                    <p><strong>Carrera:</strong> ${scheduleData.career || 'No especificada'}</p>
                    <p><strong>Creado:</strong> ${createdDate}</p>
                    ${lastUpdated !== createdDate ? `<p><strong>Actualizado:</strong> ${lastUpdated}</p>` : ''}
                    <p><strong>Versión:</strong> ${scheduleData.version || '1.0'}</p>
                </div>
            `;

            // Add hover animation
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });

            return card;
        } catch (error) {
            this.debugError(`Error creating schedule card for course ${course}`, error);
            // Return a minimal error card
            const errorCard = document.createElement('div');
            errorCard.className = 'schedule-card error';
            errorCard.innerHTML = `
                <div class="schedule-card-header">
                    <h4 class="schedule-card-title">Curso ${course}</h4>
                </div>
                <div class="schedule-card-info">
                    <p class="error-text">Error cargando información del horario</p>
                </div>
            `;
            return errorCard;
        }
    }

    // Additional methods for schedule management
    editSchedule(course) {
        try {
            this.debugLog(`Editing schedule for course: ${course}`);
            const scheduleData = this.savedSchedules[course];
            
            if (!scheduleData) {
                showToast('Error', `No se encontró el horario para el curso ${course}`, 'error');
                return;
            }

            // Load the schedule data back into the form
            const courseElement = document.getElementById('curso');
            const careerElement = document.getElementById('carrera');
            const numMateriasElement = document.getElementById('numMaterias');

            if (courseElement) courseElement.value = course;
            if (careerElement) careerElement.value = scheduleData.career || '';
            if (numMateriasElement) numMateriasElement.value = scheduleData.subjects?.length || 0;

            // Load subjects data
            this.subjects = scheduleData.subjects || [];
            
            showToast('Modo edición', `Cargando horario del curso ${course} para edición`, 'info');
            
            // Navigate to subjects section
            this.generateSubjectFields();
            
        } catch (error) {
            this.debugError('Error editing schedule', error);
            showToast('Error', 'No se pudo cargar el horario para edición', 'error');
        }
    }

    viewSchedule(course) {
        try {
            this.debugLog(`Viewing schedule for course: ${course}`);
            const scheduleData = this.savedSchedules[course];
            
            if (!scheduleData) {
                showToast('Error', `No se encontró el horario para el curso ${course}`, 'error');
                return;
            }

            // Create modal or new window to show the schedule
            this.showScheduleModal(course, scheduleData);
            
        } catch (error) {
            this.debugError('Error viewing schedule', error);
            showToast('Error', 'No se pudo mostrar el horario', 'error');
        }
    }

    deleteSchedule(course) {
        try {
            if (!confirm(`¿Está seguro de que desea eliminar el horario del curso ${course}?`)) {
                return;
            }

            delete this.savedSchedules[course];
            
            try {
                localStorage.setItem('savedSchedules', JSON.stringify(this.savedSchedules));
            } catch (storageError) {
                this.debugError('Error updating localStorage after deletion', storageError);
            }

            this.refreshSavedSchedules();
            showToast('Horario eliminado', `El horario del curso ${course} ha sido eliminado`, 'success');
            this.debugLog(`Schedule deleted for course: ${course}`);
            
        } catch (error) {
            this.debugError('Error deleting schedule', error);
            showToast('Error', 'No se pudo eliminar el horario', 'error');
        }
    }

    showScheduleModal(course, scheduleData) {
        // This would create a modal to display the schedule
        // For now, we'll use a simple alert or print window
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Horario Curso ${course} - UCSG</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #8B1538; text-align: center; }
                        .info { background: #f0f0f0; padding: 10px; margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <h1>Horario - Curso ${course}</h1>
                    <div class="info">
                        <p><strong>Carrera:</strong> ${scheduleData.career}</p>
                        <p><strong>Materias:</strong> ${scheduleData.subjects?.length || 0}</p>
                        <p><strong>Creado:</strong> ${new Date(scheduleData.createdAt).toLocaleString('es-ES')}</p>
                    </div>
                    ${scheduleData.html}
                </body>
                </html>
            `);
            printWindow.document.close();
        } else {
            showToast('Bloqueado', 'Las ventanas emergentes están bloqueadas. Habilítelas para ver el horario.', 'warning');
        }
    }

    // Utility methods
    showSection(sectionId) {
        try {
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.remove('hidden');
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (error) {
            this.debugError(`Error showing section ${sectionId}`, error);
        }
    }

    hideSection(sectionId) {
        try {
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('hidden');
            }
        } catch (error) {
            this.debugError(`Error hiding section ${sectionId}`, error);
        }
    }

    setButtonLoading(button, loading) {
        try {
            if (loading) {
                button.classList.add('loading');
                button.disabled = true;
                const text = button.querySelector('.btn-text');
                const spinner = button.querySelector('.btn-spinner');
                if (text) text.style.opacity = '0';
                if (spinner) spinner.style.opacity = '1';
            } else {
                button.classList.remove('loading');
                button.disabled = false;
                const text = button.querySelector('.btn-text');
                const spinner = button.querySelector('.btn-spinner');
                if (text) text.style.opacity = '1';
                if (spinner) spinner.style.opacity = '0';
            }
        } catch (error) {
            this.debugError('Error setting button loading state', error);
        }
    }

    shuffleArray(array) {
        try {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        } catch (error) {
            this.debugError('Error shuffling array', error);
            return array;
        }
    }

    // Navigation methods
    goBackToConfig() {
        try {
            this.hideSection('subjectsSection');
            this.showSection('courseConfigSection');
            this.debugLog('Navigated back to config');
        } catch (error) {
            this.debugError('Error going back to config', error);
        }
    }

    goBackToSubjects() {
        try {
            this.hideSection('scheduleSection');
            this.showSection('subjectsSection');
            
            const saveBtn = document.getElementById('saveScheduleBtn');
            if (saveBtn) {
                saveBtn.classList.add('hidden');
            }
            
            this.debugLog('Navigated back to subjects');
        } catch (error) {
            this.debugError('Error going back to subjects', error);
        }
    }

    resetAdminForm() {
        try {
            // Reset all form fields
            ['curso', 'carrera', 'numMaterias', 'horaInicio'].forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) field.value = '';
            });

            // Clear subjects container
            const subjectsContainer = document.getElementById('subjectsContainer');
            if (subjectsContainer) {
                subjectsContainer.innerHTML = '';
            }

            // Clear schedule preview
            const schedulePreview = document.getElementById('schedulePreview');
            if (schedulePreview) {
                schedulePreview.innerHTML = '';
            }

            // Hide sections
            this.hideSection('subjectsSection');
            this.hideSection('scheduleSection');
            
            // Show main config section
            this.showSection('courseConfigSection');

            // Clear data
            this.subjects = [];
            this.currentScheduleData = null;
            this.validationErrors = [];

            // Hide save button
            const saveBtn = document.getElementById('saveScheduleBtn');
            if (saveBtn) {
                saveBtn.classList.add('hidden');
            }

            this.debugLog('Admin form reset completed');
            
        } catch (error) {
            this.debugError('Error resetting admin form', error);
        }
    }

    getSavedSchedule(course) {
        try {
            const scheduleData = this.savedSchedules[course];
            return scheduleData ? scheduleData.html : null;
        } catch (error) {
            this.debugError(`Error getting saved schedule for course ${course}`, error);
            return null;
        }
    }

    loadStoredSchedules() {
        try {
            const stored = localStorage.getItem('savedSchedules');
            if (stored) {
                this.savedSchedules = JSON.parse(stored);
                this.debugLog(`Loaded ${Object.keys(this.savedSchedules).length} stored schedules`);
            }
        } catch (error) {
            this.debugError('Error loading stored schedules', error);
            this.savedSchedules = {};
        }
    }
}

