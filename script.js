document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const taskForm = document.getElementById('task-form');
    const examForm = document.getElementById('exam-form');
    const agendaForm = document.getElementById('agenda-form');
    const agendaList = document.getElementById('agenda-list');
    const notificationArea = document.getElementById('notification-area');
    const assistantQueryInput = document.getElementById('assistant-query');
    const askAssistantBtn = document.getElementById('ask-assistant-btn');
    const assistantResponse = document.getElementById('assistant-response');
    const modal = document.getElementById('calendar-modal');
    const closeModalBtn = document.querySelector('.close-button');
    const calendarLink = document.getElementById('calendar-link');

    // --- Data Management ---
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let exams = JSON.parse(localStorage.getItem('exams')) || [];
    let agendas = JSON.parse(localStorage.getItem('agendas')) || [];

    const saveData = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('exams', JSON.stringify(exams));
        localStorage.setItem('agendas', JSON.stringify(agendas));
    };

    // --- Event Listeners ---
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTask = {
            id: Date.now(),
            course: e.target['task-course'].value,
            description: e.target['task-desc'].value,
            date: e.target['task-deadline'].value,
            type: 'task'
        };
        tasks.push(newTask);
        saveData();
        renderAll();
        taskForm.reset();
        showCalendarModal(newTask);
    });

    examForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newExam = {
            id: Date.now(),
            course: e.target['exam-course'].value,
            examType: e.target['exam-type'].value,
            date: e.target['exam-date'].value,
            description: `Ujian ${e.target['exam-type'].value} untuk mata kuliah ${e.target['exam-course'].value}`,
            type: 'exam'
        };
        exams.push(newExam);
        saveData();
        renderAll();
        examForm.reset();
        showCalendarModal(newExam);
    });
    
    agendaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newAgenda = {
            id: Date.now(),
            title: e.target['agenda-title'].value,
            description: e.target['agenda-desc'].value,
            date: e.target['agenda-date'].value,
            type: 'agenda'
        };
        agendas.push(newAgenda);
        saveData();
        renderAll();
        agendaForm.r
