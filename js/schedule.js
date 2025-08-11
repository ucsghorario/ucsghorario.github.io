// Schedule Management System
class ScheduleManager {
    constructor() {
        this.savedSchedules = JSON.parse(localStorage.getItem('savedSchedules')) || {};
        this.currentScheduleData = null;
        this.timeSlots = [
            '07:00-09:00',
            '09:00-11:00', 
            '11:00-13:00',
            '13:00-15:00',
            '15:00-17:00'
        ];
        this.weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
        this.subjects = [];
    }

    generateSubjectFields() {
        const course = document.getElementById('curso').value;
        const career = document.getElementById('carrera').value;
        const numSubjects = parseInt(document.getElementById('numMaterias').value);

        if (!course || !career || !numSubjects) {
            showToast('Campos requeridos', 'Debe completar todos los campos de configuración', 'warning');
            return;
        }

        this.createSubjectInputs(numSubjects);
        this.showSection('subjectsSection');
        this.hideSection('courseConfigSection');

        // Animate the transition
        setTimeout(() => {
            document.getElementById('subjectsContainer').scrollIntoView({ 
                behavior: 'smooth' 
            });
        }, 300);
    }

    createSubjectInputs(numSubjects) {
        const container = document.getElementById('subjectsContainer');
        container.innerHTML = '';

        for (let i = 1; i <= numSubjects; i++) {
            const subjectCard = this.createSubjectCard(i);
            container.appendChild(subjectCard);
        }
    }

    createSubjectCard(index) {
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.innerHTML = `
            <h4>
                <i class="fas fa-book"></i>
                Materia ${index}
            </h4>
            <div class="form-group">
                <label for="subject${index}">Nombre de la Materia</label>
                <input 
                    type="text" 
                    id="subject${index}" 
                    class="form-select" 
                    placeholder="Ej: Cálculo I, Programación, etc."
                    required
                >
            </div>
            <div class="form-group">
                <label for="professor${index}">Profesor</label>
                <input 
                    type="text" 
                    id="professor${index}" 
                    class="form-select" 
                    placeholder="Ej: Dr. Juan Pérez"
                    required
                >
            </div>
            <div class="form-group">
                <label for="credits${index}">Créditos</label>
                <select id="credits${index}" class="form-select">
                    <option value="2">2 créditos</option>
                    <option value="3" selected>3 créditos</option>
                    <option value="4">4 créditos</option>
                </select>
            </div>
        `;

        // Add animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);

        return card;
    }

    proceedToSchedule() {
        const numSubjects = parseInt(document.getElementById('numMaterias').value);
        const subjects = [];

        // Validate and collect subject data
        for (let i = 1; i <= numSubjects; i++) {
            const subjectName = document.getElementById(`subject${i}`).value.trim();
            const professor = document.getElementById(`professor${i}`).value.trim();
            const credits = parseInt(document.getElementById(`credits${i}`).value);

            if (!subjectName || !professor) {
                showToast('Campos incompletos', `Complete la información de la Materia ${i}`, 'warning');
                return;
            }

            subjects.push({
                name: subjectName,
                professor: professor,
                credits: credits,
                id: i
            });
        }

        this.subjects = subjects;
        this.showSection('scheduleSection');
        this.hideSection('subjectsSection');

        // Scroll to schedule section
        setTimeout(() => {
            document.getElementById('scheduleSection').scrollIntoView({ 
                behavior: 'smooth' 
            });
        }, 300);
    }

    generateSchedule() {
        if (this.subjects.length === 0) {
            showToast('Error', 'No hay materias configuradas', 'error');
            return;
        }

        const startTime = document.getElementById('horaInicio').value;
        const startIndex = this.timeSlots.findIndex(slot => slot.startsWith(startTime));

        if (startIndex === -1) {
            showToast('Hora inválida', 'Seleccione una hora de inicio válida', 'error');
            return;
        }

        // Show loading state
        const generateBtn = document.querySelector('button[onclick="generateSchedule()"]');
        generateBtn.classList.add('loading');

        setTimeout(() => {
            try {
                const schedule = this.createScheduleMatrix(startIndex);
                this.displaySchedule(schedule);
                document.getElementById('saveScheduleBtn').classList.remove('hidden');
                
                showToast('Horario generado', 'El horario se ha creado exitosamente', 'success');
            } catch (error) {
                showToast('Error', 'No se pudo generar el horario: ' + error.message, 'error');
            } finally {
                generateBtn.classList.remove('loading');
            }
        }, 1500);
    }

    createScheduleMatrix(startIndex) {
        // Initialize empty schedule matrix
        const schedule = [];
        for (let i = 0; i < this.timeSlots.length; i++) {
            schedule[i] = new Array(this.weekDays.length).fill(null);
        }

        // Available positions for scheduling
        const availablePositions = [];
        for (let day = 0; day < this.weekDays.length; day++) {
            for (let time = startIndex; time < this.timeSlots.length - 1; time++) {
                availablePositions.push({ day, time });
            }
        }

        // Shuffle positions for random distribution
        this.shuffleArray(availablePositions);

        // Schedule each subject
        this.subjects.forEach((subject, index) => {
            if (availablePositions.length < 2) {
                throw new Error('No hay suficientes espacios disponibles');
            }

            // Take two consecutive time slots for each subject
            const position = availablePositions.pop();
            
            // Check if we can place a 2-hour class
            if (position.time + 1 < this.timeSlots.length) {
                schedule[position.time][position.day] = subject;
                schedule[position.time + 1][position.day] = subject;
                
                // Remove the next time slot for this day from available positions
                const nextSlotIndex = availablePositions.findIndex(
                    pos => pos.day === position.day && pos.time === position.time + 1
                );
                if (nextSlotIndex !== -1) {
                    availablePositions.splice(nextSlotIndex, 1);
                }
            } else {
                // Place single slot if no consecutive slot available
                schedule[position.time][position.day] = subject;
            }
        });

        this.currentScheduleData = schedule;
        return schedule;
    }

    displaySchedule(schedule) {
        const container = document.getElementById('schedulePreview');
        
        let html = `
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
                    html += `
                        <td class="subject-cell">
                            <div class="subject-name">${subject.name}</div>
                            <div class="professor-name">${subject.professor}</div>
                        </td>
                    `;
                } else {
                    html += '<td></td>';
                }
            }
            
            html += '</tr>';
        }

        html += '</tbody></table>';
        container.innerHTML = html;

        // Add animation to schedule cells
        setTimeout(() => {
            const cells = container.querySelectorAll('.subject-cell');
            cells.forEach((cell, index) => {
                cell.style.opacity = '0';
                cell.style.transform = 'scale(0.8)';
                
                setTimeout(() => {
                    cell.style.transition = 'all 0.3s ease';
                    cell.style.opacity = '1';
                    cell.style.transform = 'scale(1)';
                }, index * 100);
            });
        }, 100);
    }

    saveSchedule() {
        if (!this.currentScheduleData) {
            showToast('Error', 'No hay horario para guardar', 'error');
            return;
        }

        const course = document.getElementById('curso').value;
        const career = document.getElementById('carrera').value;
        
        // Create schedule HTML for storage
        const scheduleHtml = document.getElementById('schedulePreview').innerHTML;
        
        // Save to memory and localStorage
        this.savedSchedules[course] = {
            html: scheduleHtml,
            data: this.currentScheduleData,
            subjects: this.subjects,
            career: career,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };

        localStorage.setItem('savedSchedules', JSON.stringify(this.savedSchedules));

        // Update UI
        this.refreshSavedSchedules();
        
        // Reset form and return to main admin screen
        this.resetAdminForm();
        
        showToast('Guardado exitoso', `Horario guardado para el Curso ${course}`, 'success');
    }

    refreshSavedSchedules() {
        const container = document.getElementById('savedSchedules');
        const countBadge = document.getElementById('schedulesCount');
        
        const scheduleCount = Object.keys(this.savedSchedules).length;
        countBadge.textContent = scheduleCount;

        if (scheduleCount === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h4>No hay horarios guardados</h4>
                    <p>Crea tu primer horario para comenzar</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        
        Object.entries(this.savedSchedules).forEach(([course, scheduleData]) => {
            const card = this.createScheduleCard(course, scheduleData);
            container.appendChild(card);
        });
    }

    createScheduleCard(course, scheduleData) {
        const card = document.createElement('div');
        card.className = 'schedule-card';
        
        const createdDate = new Date(scheduleData.createdAt).toLocaleDateString('es-ES');
        const subjectCount = scheduleData.subjects?.length || 0;
        
        card.innerHTML = `
            <div class="schedule-card-header">
                <h4 class="schedule-card-title">Curso ${course}</h4>
                <div class="schedule-card-actions">
                    <button class="btn-icon btn-outline" onclick="editSchedule('${course}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-outline" onclick="deleteSchedule('${course}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="schedule-info">
                <p><strong>Carrera:</strong> ${scheduleData.career}</p>
                <p><strong>Materias:</strong> ${subjectCount}</p>
                <p><strong>Creado:</strong> ${createdDate}</p>
            </div>
            <div class="schedule-card-preview">
                ${scheduleData.html}
            </div>
        `;

        return card;
    }

    editSchedule(course) {
        const scheduleData = this.savedSchedules[course];
        if (!scheduleData) return;

        // Pre-fill form with existing data
        document.getElementById('curso').value = course;
        document.getElementById('carrera').value = scheduleData.career;
        document.getElementById('numMaterias').value = scheduleData.subjects.length;

        // Show subjects section and populate data
        this.subjects = scheduleData.subjects;
        this.createSubjectInputs(scheduleData.subjects.length);
        
        // Fill subject data
        scheduleData.subjects.forEach((subject, index) => {
            document.getElementById(`subject${index + 1}`).value = subject.name;
            document.getElementById(`professor${index + 1}`).value = subject.professor;
            document.getElementById(`credits${index + 1}`).value = subject.credits;
        });

        this.showSection('subjectsSection');
        this.hideSection('courseConfigSection');

        showToast('Modo edición', `Editando horario del Curso ${course}`, 'info');
    }

    deleteSchedule(course) {
        if (!confirm(`¿Está seguro de eliminar el horario del Curso ${course}?`)) {
            return;
        }

        delete this.savedSchedules[course];
        localStorage.setItem('savedSchedules', JSON.stringify(this.savedSchedules));
        
        this.refreshSavedSchedules();
        showToast('Eliminado', `Horario del Curso ${course} eliminado`, 'success');
    }

    getSavedSchedule(course) {
        const scheduleData = this.savedSchedules[course];
        return scheduleData ? scheduleData.html : null;
    }

    loadStoredSchedules() {
        const stored = localStorage.getItem('savedSchedules');
        if (stored) {
            try {
                this.savedSchedules = JSON.parse(stored);
            } catch (error) {
                console.error('Error loading stored schedules:', error);
                this.savedSchedules = {};
            }
        }
    }

    // Navigation methods
    goBackToConfig() {
        this.showSection('courseConfigSection');
        this.hideSection('subjectsSection');
        this.hideSection('scheduleSection');
    }

    goBackToSubjects() {
        this.showSection('subjectsSection');
        this.hideSection('scheduleSection');
        document.getElementById('saveScheduleBtn').classList.add('hidden');
    }

    resetAdminForm() {
        // Reset all form fields
        document.getElementById('curso').value = '';
        document.getElementById('carrera').value = '';
        document.getElementById('numMaterias').value = '';
        document.getElementById('horaInicio').value = '07:00';

        // Clear subjects
        this.subjects = [];
        this.currentScheduleData = null;
        document.getElementById('subjectsContainer').innerHTML = '';
        document.getElementById('schedulePreview').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-plus"></i>
                <h4>Generar Horario</h4>
                <p>Haz clic en "Generar Horario" para crear la distribución de clases</p>
            </div>
        `;

        // Show main config section
        this.showSection('courseConfigSection');
        this.hideSection('subjectsSection');
        this.hideSection('scheduleSection');
        document.getElementById('saveScheduleBtn').classList.add('hidden');
    }

    // UI Helper methods
    showSection(sectionId) {
        document.getElementById(sectionId).classList.remove('hidden');
    }

    hideSection(sectionId) {
        document.getElementById(sectionId).classList.add('hidden');
    }

    // Utility methods
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Conflict detection
    detectConflicts(schedule) {
        const conflicts = [];
        
        for (let timeIndex = 0; timeIndex < schedule.length; timeIndex++) {
            for (let dayIndex = 0; dayIndex < schedule[timeIndex].length; dayIndex++) {
                const subject = schedule[timeIndex][dayIndex];
                if (subject) {
                    // Check for professor conflicts (same professor in multiple places at same time)
                    for (let otherDay = 0; otherDay < schedule[timeIndex].length; otherDay++) {
                        if (otherDay !== dayIndex) {
                            const otherSubject = schedule[timeIndex][otherDay];
                            if (otherSubject && otherSubject.professor === subject.professor) {
                                conflicts.push({
                                    type: 'professor_conflict',
                                    time: this.timeSlots[timeIndex],
                                    professor: subject.professor,
                                    subjects: [subject.name, otherSubject.name]
                                });
                            }
                        }
                    }
                }
            }
        }
        
        return conflicts;
    }

    // Export schedule data
    exportScheduleData(course) {
        const scheduleData = this.savedSchedules[course];
        if (!scheduleData) return null;

        return {
            course,
            ...scheduleData,
            exportedAt: new Date().toISOString()
        };
    }

    // Import schedule data
    importScheduleData(data) {
        try {
            if (data.course && data.html && data.subjects) {
                this.savedSchedules[data.course] = {
                    html: data.html,
                    data: data.data,
                    subjects: data.subjects,
                    career: data.career,
                    createdAt: data.createdAt,
                    lastUpdated: new Date().toISOString(),
                    imported: true
                };
                
                localStorage.setItem('savedSchedules', JSON.stringify(this.savedSchedules));
                this.refreshSavedSchedules();
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing schedule:', error);
            return false;
        }
    }
}

// Global functions for onclick handlers
function editSchedule(course) {
    app.scheduleManager.editSchedule(course);
}

function deleteSchedule(course) {
    app.scheduleManager.deleteSchedule(course);
}
