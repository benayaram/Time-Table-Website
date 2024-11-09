// script.js

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper function to get day name
function getDayName(date) {
    const options = { weekday: 'long' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

// Function to generate schedule data from 09-11-2024 to 01-01-2025 in ascending order
function generateScheduleData() {
    const scheduleData = [];
    const startDate = new Date(2024, 10, 9);  // November 9th, 2024
    const endDate = new Date(2025, 0, 1);  // January 1st, 2025
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        scheduleData.push({
            date: formatDate(currentDate),
            day: getDayName(currentDate),
            examName: '',  // Editable in Edit Mode
            morningExam: Math.random() < 0.5,
            afternoonExam: Math.random() < 0.5,
            comments: ''
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return scheduleData;
}

// Function to create a row for each schedule entry
function createScheduleRow(schedule, isEditMode) {
    const row = document.createElement('tr');

    const morningInput = `<input type="checkbox" ${schedule.morningExam ? 'checked' : ''}>`;
    const afternoonInput = `<input type="checkbox" ${schedule.afternoonExam ? 'checked' : ''}>`;
    const commentsInput = `<textarea>${schedule.comments}</textarea>`;
    const examNameInput = `<input type="text" value="${schedule.examName}">`;

    const dateCell = `<td>${schedule.date}</td>`;
    const dayCell = `<td>${schedule.day}</td>`;
    const examNameCell = `<td class="${schedule.examName ? 'exam-cell' : ''}">${isEditMode ? examNameInput : schedule.examName}</td>`;
    const morningCell = `<td>${isEditMode ? morningInput : (schedule.morningExam ? '✔' : '')}</td>`;
    const afternoonCell = `<td>${isEditMode ? afternoonInput : (schedule.afternoonExam ? '✔' : '')}</td>`;
    const commentsCell = `<td>${isEditMode ? commentsInput : schedule.comments}</td>`;

    row.innerHTML = dateCell + dayCell + examNameCell + morningCell + afternoonCell + commentsCell;

    return row;
}

// Save the schedule data as a JSON file
function saveScheduleData(scheduleData) {
    const blob = new Blob([JSON.stringify(scheduleData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'schedule.json';
    link.click();
}

// Load the schedule data from a file
function loadScheduleDataFromFile(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const scheduleData = JSON.parse(event.target.result);
        renderSchedule(scheduleData);
    };
    reader.readAsText(file);
}

// Toggle between edit and normal mode
let isEditMode = false;
let scheduleData = [];

const toggleModeButton = document.getElementById('toggleModeButton');
const saveButton = document.getElementById('saveButton');
const loadFileInput = document.getElementById('loadFileInput');

// Switch modes when the button is clicked
toggleModeButton.addEventListener('click', () => {
    isEditMode = !isEditMode;
    toggleModeButton.textContent = isEditMode ? 'Switch to Normal Mode' : 'Switch to Edit Mode';
    saveButton.style.display = isEditMode ? 'inline-block' : 'none';
    renderSchedule(scheduleData);
});

// Render the schedule based on the mode
function renderSchedule(scheduleData) {
    const scheduleBody = document.getElementById('scheduleBody');
    scheduleBody.innerHTML = '';

    scheduleData.forEach(schedule => {
        const row = createScheduleRow(schedule, isEditMode);
        scheduleBody.appendChild(row);
    });
}

// Handle changes in input fields (edit mode)
document.getElementById('scheduleBody').addEventListener('input', (event) => {
    if (isEditMode && (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA')) {
        const rowIndex = event.target.closest('tr').rowIndex - 1;
        const schedule = scheduleData[rowIndex];

        if (event.target.type === 'checkbox') {
            const isMorning = event.target.closest('td').cellIndex === 3;
            if (isMorning) {
                schedule.morningExam = event.target.checked;
            } else {
                schedule.afternoonExam = event.target.checked;
            }
        } else if (event.target.tagName === 'TEXTAREA') {
            schedule.comments = event.target.value;
        } else if (event.target.type === 'text') {
            schedule.examName = event.target.value;
        }
    }
});

// Save the schedule when the Save button is clicked
saveButton.addEventListener('click', () => {
    saveScheduleData(scheduleData);
});

// Handle file input for loading data (Normal Mode)
loadFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        loadScheduleDataFromFile(file);
    }
});

// Initial render: Check if there's an existing JSON file
window.onload = () => {
    fetch('schedule.json')
        .then(response => response.json())
        .then(data => {
            scheduleData = data;
            renderSchedule(scheduleData);
        })
        .catch(error => {
            console.error('Error loading schedule:', error);
            scheduleData = generateScheduleData();
            renderSchedule(scheduleData);
        });
};
