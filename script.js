// Daily Monitoring Tasks Web Application
// Global variables and configuration
const employees = [
    "Meghana Krishna",
    "Yogashree YV", 
    "Bhuvana V",
    "Meenakshi Degulmath",
    "Rachana Raghu",
    "Samitha R Amin",
    "Midhun Karunanidhi",
    "Harsha Priyadarshini",
    "Prajwal MD",
    "Manaswitha Paladugu"
];

const startDate = new Date('2026-05-18');
const endDate = new Date('2026-12-31');

let tasks = [];
let currentEditingId = null;

// DOM elements
let employeeFilter, startDateFilter, endDateFilter, tasksTableBody, taskModal, taskForm;
let modalEmployee, modalDate, modalTask1, modalTask2, modalTask3;
let modalHours1, modalHours2, modalHours3, modalNotes, modalTotalHours;
let modalFile1, modalFile2, modalFile3;

// File storage for attachments
let taskFiles = {
    task1: [],
    task2: [],
    task3: []
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeDOM();
    loadTasksFromStorage();
    setupEventListeners();
    renderTable();
    updateStats();
});

// Initialize DOM elements
function initializeDOM() {
    employeeFilter = document.getElementById('employeeFilter');
    startDateFilter = document.getElementById('startDateFilter');
    endDateFilter = document.getElementById('endDateFilter');
    tasksTableBody = document.getElementById('tasksTableBody');
    taskModal = document.getElementById('taskModal');
    taskForm = document.getElementById('taskForm');
    
    modalEmployee = document.getElementById('modalEmployee');
    modalDate = document.getElementById('modalDate');
    modalTask1 = document.getElementById('modalTask1');
    modalTask2 = document.getElementById('modalTask2');
    modalTask3 = document.getElementById('modalTask3');
    modalHours1 = document.getElementById('modalHours1');
    modalHours2 = document.getElementById('modalHours2');
    modalHours3 = document.getElementById('modalHours3');
    modalNotes = document.getElementById('modalNotes');
    modalTotalHours = document.getElementById('modalTotalHours');
    
    // File input elements
    modalFile1 = document.getElementById('modalFile1');
    modalFile2 = document.getElementById('modalFile2');
    modalFile3 = document.getElementById('modalFile3');
}

// Setup event listeners
function setupEventListeners() {
    // Filter events
    employeeFilter.addEventListener('change', renderTable);
    startDateFilter.addEventListener('change', renderTable);
    endDateFilter.addEventListener('change', renderTable);
    
    // Quick date filter dropdown
    document.getElementById('quickDateFilter').addEventListener('change', function() {
        if (this.value) {
            setDateRange(this.value);
        }
    });
    
    // Button events
    document.getElementById('addTaskBtn').addEventListener('click', openAddModal);
    document.getElementById('exportBtn').addEventListener('click', exportToExcel);
    document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
    
    // Modal events
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    taskForm.addEventListener('submit', saveTask);
    
    // Hours calculation
    [modalHours1, modalHours2, modalHours3].forEach(input => {
        input.addEventListener('input', calculateTotalHours);
    });
    
    // File input events
    modalFile1.addEventListener('change', (e) => handleFileSelection(e, 'task1', 'fileList1'));
    modalFile2.addEventListener('change', (e) => handleFileSelection(e, 'task2', 'fileList2'));
    modalFile3.addEventListener('change', (e) => handleFileSelection(e, 'task3', 'fileList3'));
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === taskModal) {
            closeModal();
        }
    });
}

// Load tasks from localStorage
function loadTasksFromStorage() {
    const storedTasks = localStorage.getItem('dailyMonitoringTasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}

// Save tasks to localStorage
function saveTasksToStorage() {
    localStorage.setItem('dailyMonitoringTasks', JSON.stringify(tasks));
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    });
}

function getDayName(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function isWeekend(dateString) {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Percentage calculation functions
function calculatePercentage(hours) {
    const percentage = (hours / 8) * 100;
    return Math.round(percentage * 10) / 10; // Round to 1 decimal place
}

function getPercentageClass(percentage) {
    if (percentage >= 100) return 'percentage-full';
    if (percentage >= 75) return 'percentage-high';
    if (percentage >= 50) return 'percentage-medium';
    if (percentage >= 25) return 'percentage-low';
    return 'percentage-minimal';
}

// Modal functions
function openAddModal() {
    currentEditingId = null;
    document.getElementById('modalTitle').textContent = 'Add New Task Entry';
    clearModalForm();
    taskModal.style.display = 'block';
}

function openEditModal(taskId) {
    currentEditingId = taskId;
    document.getElementById('modalTitle').textContent = 'Edit Task Entry';
    
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        modalEmployee.value = task.employee;
        modalDate.value = task.date;
        modalTask1.value = task.task1 || '';
        modalTask2.value = task.task2 || '';
        modalTask3.value = task.task3 || '';
        modalHours1.value = task.hours1 || '';
        modalHours2.value = task.hours2 || '';
        modalHours3.value = task.hours3 || '';
        modalNotes.value = task.notes || '';
        calculateTotalHours();
    }
    
    taskModal.style.display = 'block';
}

function closeModal() {
    taskModal.style.display = 'none';
    clearModalForm();
    currentEditingId = null;
}

function clearModalForm() {
    taskForm.reset();
    modalTotalHours.textContent = '0';
    document.getElementById('totalHoursWarning').style.display = 'none';
    clearAllFiles();
}

function calculateTotalHours() {
    const hours1 = parseFloat(modalHours1.value) || 0;
    const hours2 = parseFloat(modalHours2.value) || 0;
    const hours3 = parseFloat(modalHours3.value) || 0;
    const totalHours = hours1 + hours2 + hours3;
    
    modalTotalHours.textContent = totalHours.toFixed(1);
    
    const warning = document.getElementById('totalHoursWarning');
    if (totalHours > 8) {
        warning.style.display = 'block';
        document.getElementById('saveBtn').disabled = true;
    } else {
        warning.style.display = 'none';
        document.getElementById('saveBtn').disabled = false;
    }
}

// Task management functions
function saveTask(event) {
    event.preventDefault();
    
    const hours1 = parseFloat(modalHours1.value) || 0;
    const hours2 = parseFloat(modalHours2.value) || 0;
    const hours3 = parseFloat(modalHours3.value) || 0;
    const totalHours = hours1 + hours2 + hours3;
    
    const taskData = {
        employee: modalEmployee.value,
        date: modalDate.value,
        task1: modalTask1.value,
        task2: modalTask2.value,
        task3: modalTask3.value,
        hours1: hours1,
        hours2: hours2,
        hours3: hours3,
        totalHours: totalHours,
        notes: modalNotes.value,
        files1: taskFiles.task1.map(f => ({ id: f.id, name: f.name, size: f.size, type: f.type })),
        files2: taskFiles.task2.map(f => ({ id: f.id, name: f.name, size: f.size, type: f.type })),
        files3: taskFiles.task3.map(f => ({ id: f.id, name: f.name, size: f.size, type: f.type }))
    };
    
    if (currentEditingId) {
        // Update existing task
        const index = tasks.findIndex(t => t.id === currentEditingId);
        if (index !== -1) {
            tasks[index] = { ...taskData, id: currentEditingId };
        }
    } else {
        // Add new task
        taskData.id = generateId();
        tasks.push(taskData);
    }
    
    saveTasksToStorage();
    renderTable();
    updateStats();
    closeModal();
    showMessage('Task saved successfully!', 'success');
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasksToStorage();
        renderTable();
        updateStats();
        showMessage('Task deleted successfully!', 'success');
    }
}

// Table rendering and filtering
function renderTable() {
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        tasksTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <h3>No tasks found</h3>
                    <p>Add a new task entry to get started!</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tasksTableBody.innerHTML = filteredTasks.map(task => {
        const dayName = getDayName(task.date);
        const isWeekendRow = isWeekend(task.date);
        const rowClass = isWeekendRow ? 'weekend-row' : '';
        const totalHours = task.totalHours || 0;
        const percentage = calculatePercentage(totalHours);
        const percentageClass = getPercentageClass(percentage);
        
        // Format task display with hours and attachments
        const formatTaskWithHours = (taskText, hours, files) => {
            if (!taskText && !hours) return '';
            let result = '';
            if (!taskText) {
                result = `(${hours}h)`;
            } else if (!hours) {
                result = taskText;
            } else {
                result = `${taskText} (${hours}h)`;
            }
            
            // Add attachment indicator
            if (files && files.length > 0) {
                result += ` <span class="attachment-icon">📎</span><span class="attachment-count">${files.length}</span>`;
            }
            
            return result;
        };
        
        return `
            <tr class="${rowClass}">
                <td>${task.employee}</td>
                <td>${formatDate(task.date)}</td>
                <td>${dayName}</td>
                <td>${formatTaskWithHours(task.task1, task.hours1, task.files1)}</td>
                <td>${formatTaskWithHours(task.task2, task.hours2, task.files2)}</td>
                <td>${formatTaskWithHours(task.task3, task.hours3, task.files3)}</td>
                <td><strong>${totalHours.toFixed(1)}</strong></td>
                <td><span class="percentage ${percentageClass}">${percentage}%</span></td>
                <td>${task.notes || ''}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="openEditModal('${task.id}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function getFilteredTasks() {
    let filtered = [...tasks];
    
    // Filter by employee
    if (employeeFilter.value) {
        filtered = filtered.filter(task => task.employee === employeeFilter.value);
    }
    
    // Filter by date range
    if (startDateFilter.value || endDateFilter.value) {
        filtered = filtered.filter(task => {
            const taskDate = new Date(task.date);
            const startDate = startDateFilter.value ? new Date(startDateFilter.value) : null;
            const endDate = endDateFilter.value ? new Date(endDateFilter.value) : null;
            
            if (startDate && taskDate < startDate) return false;
            if (endDate && taskDate > endDate) return false;
            return true;
        });
    }
    
    // Sort by date (newest first) and then by employee
    filtered.sort((a, b) => {
        const dateCompare = new Date(b.date) - new Date(a.date);
        if (dateCompare !== 0) return dateCompare;
        return a.employee.localeCompare(b.employee);
    });
    
    return filtered;
}

function clearFilters() {
    employeeFilter.value = '';
    startDateFilter.value = '';
    endDateFilter.value = '';
    document.getElementById('quickDateFilter').value = '';
    renderTable();
}

// Date range utility functions
function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
}

function getWeekEnd(date) {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
}

function getMonthStart(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

// Quick date range functions
function setDateRange(range) {
    const today = new Date();
    let startDate, endDate;
    
    switch (range) {
        case 'thisWeek':
            startDate = getWeekStart(today);
            endDate = getWeekEnd(today);
            break;
            
        case 'lastWeek':
            const lastWeek = new Date(today);
            lastWeek.setDate(today.getDate() - 7);
            startDate = getWeekStart(lastWeek);
            endDate = getWeekEnd(lastWeek);
            break;
            
        case 'thisMonth':
            startDate = getMonthStart(today);
            endDate = getMonthEnd(today);
            break;
            
        case 'lastMonth':
            const lastMonth = new Date(today);
            lastMonth.setMonth(today.getMonth() - 1);
            startDate = getMonthStart(lastMonth);
            endDate = getMonthEnd(lastMonth);
            break;
    }
    
    // Ensure dates are within project bounds
    const projectStart = new Date('2026-05-18');
    const projectEnd = new Date('2026-12-31');
    
    if (startDate < projectStart) startDate = projectStart;
    if (endDate > projectEnd) endDate = projectEnd;
    
    startDateFilter.value = formatDateForInput(startDate);
    endDateFilter.value = formatDateForInput(endDate);
    
    renderTable();
}

// Statistics
function updateStats() {
    const totalEntries = tasks.length;
    const totalHours = tasks.reduce((sum, task) => sum + (task.totalHours || 0), 0);
    const avgHours = totalEntries > 0 ? totalHours / totalEntries : 0;
    
    document.getElementById('totalEntries').textContent = totalEntries;
    document.getElementById('totalHours').textContent = totalHours.toFixed(1);
    document.getElementById('avgHours').textContent = avgHours.toFixed(1);
    
    // Update employee statistics
    updateEmployeeStats();
}

// Employee Statistics
function updateEmployeeStats() {
    const employeeStatsTableBody = document.getElementById('employeeStatsTableBody');
    
    // Calculate statistics for each employee
    const employeeStats = employees.map(employee => {
        const employeeTasks = tasks.filter(task => task.employee === employee);
        const totalEntries = employeeTasks.length;
        const totalHours = employeeTasks.reduce((sum, task) => sum + (task.totalHours || 0), 0);
        const avgHours = totalEntries > 0 ? totalHours / totalEntries : 0;
        
        return {
            employee,
            totalEntries,
            totalHours,
            avgHours
        };
    });
    
    // Sort by total hours (descending)
    employeeStats.sort((a, b) => b.totalHours - a.totalHours);
    
    if (employeeStats.every(stat => stat.totalEntries === 0)) {
        employeeStatsTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <h3>No employee data available</h3>
                    <p>Add task entries to see employee statistics!</p>
                </td>
            </tr>
        `;
        return;
    }
    
    employeeStatsTableBody.innerHTML = employeeStats.map(stat => `
        <tr>
            <td>${stat.employee}</td>
            <td><span class="stats-number">${stat.totalEntries}</span></td>
            <td><span class="stats-hours">${stat.totalHours.toFixed(1)}</span></td>
            <td><span class="stats-average">${stat.avgHours.toFixed(1)}</span></td>
        </tr>
    `).join('');
}

// Export to Excel functionality
function exportToExcel() {
    if (tasks.length === 0) {
        showMessage('No data to export!', 'error');
        return;
    }
    
    // Create CSV content
    const headers = [
        'Employee', 'Date', 'Day', 'Task-1', 'Hours-1', 'Task-2', 'Hours-2', 'Task-3', 'Hours-3', 'Total Hours', 'Percentage', 'Notes'
    ];
    
    const csvContent = [
        headers.join(','),
        ...tasks.map(task => [
            `"${task.employee}"`,
            task.date,
            `"${getDayName(task.date)}"`,
            `"${task.task1 || ''}"`,
            task.hours1 || 0,
            `"${task.task2 || ''}"`,
            task.hours2 || 0,
            `"${task.task3 || ''}"`,
            task.hours3 || 0,
            task.totalHours || 0,
            `${calculatePercentage(task.totalHours || 0)}%`,
            `"${task.notes || ''}"`
        ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `lean_erp_daily_monitoring_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage('Data exported successfully!', 'success');
}

// Message display
function showMessage(text, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    // Insert after header
    const header = document.querySelector('header');
    header.insertAdjacentElement('afterend', message);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 3000);
}

// Sample data for demonstration (optional)
function loadSampleData() {
    if (tasks.length === 0) {
        const sampleTasks = [
            {
                id: generateId(),
                employee: 'Meghana Krishna',
                date: '2026-05-18',
                task1: 'Code Review',
                hours1: 3,
                task2: 'Bug Fixes',
                hours2: 4,
                task3: '',
                hours3: 0,
                task4: '',
                hours4: 0,
                totalHours: 7,
                notes: 'Completed sprint tasks'
            },
            {
                id: generateId(),
                employee: 'Yogashree YV',
                date: '2026-05-18',
                task1: 'Testing',
                hours1: 4,
                task2: 'Documentation',
                hours2: 3,
                task3: '',
                hours3: 0,
                task4: '',
                hours4: 0,
                totalHours: 7,
                notes: 'Weekend testing completed'
            }
        ];
        
        tasks = sampleTasks;
        saveTasksToStorage();
        renderTable();
        updateStats();
    }
}

// File handling functions
function handleFileSelection(event, taskKey, fileListId) {
    const files = Array.from(event.target.files);
    const fileListContainer = document.getElementById(fileListId);
    
    // Add new files to the task's file array
    files.forEach(file => {
        const fileData = {
            id: generateId(),
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            file: file // Store the actual file object
        };
        taskFiles[taskKey].push(fileData);
    });
    
    // Update the file list display
    updateFileListDisplay(taskKey, fileListId);
    
    // Clear the input so the same file can be selected again if needed
    event.target.value = '';
}

function updateFileListDisplay(taskKey, fileListId) {
    const fileListContainer = document.getElementById(fileListId);
    const files = taskFiles[taskKey];
    
    if (files.length === 0) {
        fileListContainer.innerHTML = '';
        return;
    }
    
    fileListContainer.innerHTML = files.map(file => `
        <div class="file-item" data-file-id="${file.id}">
            <span class="file-name" title="${file.name}">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
            <button type="button" class="file-remove" onclick="removeFile('${taskKey}', '${file.id}', '${fileListId}')">×</button>
        </div>
    `).join('');
}

function removeFile(taskKey, fileId, fileListId) {
    taskFiles[taskKey] = taskFiles[taskKey].filter(file => file.id !== fileId);
    updateFileListDisplay(taskKey, fileListId);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function clearAllFiles() {
    taskFiles = {
        task1: [],
        task2: [],
        task3: []
    };
    
    // Clear file input values
    if (modalFile1) modalFile1.value = '';
    if (modalFile2) modalFile2.value = '';
    if (modalFile3) modalFile3.value = '';
    
    // Clear file list displays
    ['fileList1', 'fileList2', 'fileList3'].forEach(id => {
        const container = document.getElementById(id);
        if (container) container.innerHTML = '';
    });
}

function getFileAttachmentSummary(task) {
    const attachments = [];
    
    if (task.files1 && task.files1.length > 0) {
        attachments.push(`Task-1: ${task.files1.length} file(s)`);
    }
    if (task.files2 && task.files2.length > 0) {
        attachments.push(`Task-2: ${task.files2.length} file(s)`);
    }
    if (task.files3 && task.files3.length > 0) {
        attachments.push(`Task-3: ${task.files3.length} file(s)`);
    }
    
    return attachments.length > 0 ? attachments.join(', ') : '';
}

function displayAttachmentsInTable(task) {
    const totalFiles = (task.files1?.length || 0) + (task.files2?.length || 0) + (task.files3?.length || 0);
    
    if (totalFiles === 0) return '';
    
    return `<span class="attachment-icon">📎</span><span class="attachment-count">${totalFiles}</span>`;
}

// Uncomment the line below to load sample data on first visit
// loadSampleData();
