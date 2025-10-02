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
        agendaForm.reset();
        showCalendarModal(newAgenda);
    });
    
    askAssistantBtn.addEventListener('click', handleAssistantQuery);
    assistantQueryInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleAssistantQuery();
    });
    
    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if(e.target == modal) modal.style.display = 'none';
    });

    // --- Rendering Functions ---
    const renderAgenda = () => {
        agendaList.innerHTML = '';
        const allItems = [...tasks, ...exams, ...agendas];

        allItems.sort((a, b) => new Date(a.date) - new Date(b.date));

        if (allItems.length === 0) {
            agendaList.innerHTML = '<li>Tidak ada agenda yang tersimpan.</li>';
            return;
        }
        
        allItems.forEach(item => {
            const li = document.createElement('li');
            li.className = `agenda-item ${item.type}`;
            
            const itemDate = new Date(item.date);
            const formattedDate = itemDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
            const formattedTime = itemDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

            let content = '';
            if (item.type === 'task') {
                content = `<div class="agenda-icon">📝</div><div class="agenda-details"><h4>Tugas: ${item.course}</h4><p>${item.description}</p></div><div class="agenda-time"><strong>Deadline</strong><p>${formattedDate}</p><p>${formattedTime}</p></div>`;
            } else if (item.type === 'exam') {
                content = `<div class="agenda-icon">📘</div><div class="agenda-details"><h4>${item.examType} ${item.course}</h4></div><div class="agenda-time"><strong>Jadwal</strong><p>${formattedDate}</p><p>${formattedTime}</p></div>`;
            } else { // agenda
                content = `<div class="agenda-icon">📅</div><div class="agenda-details"><h4>${item.title}</h4><p>${item.description}</p></div><div class="agenda-time"><strong>Jadwal</strong><p>${formattedDate}</p><p>${formattedTime}</p></div>`;
            }
            li.innerHTML = content;
            agendaList.appendChild(li);
        });
    };
    
    const renderNotifications = () => {
        notificationArea.innerHTML = '';
        const allItems = [...tasks, ...exams, ...agendas];
        
        const now = new Date();
        const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
        const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        const tomorrowStart = new Date(new Date(tomorrow).setHours(0, 0, 0, 0));
        const tomorrowEnd =
