document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const examForm = document.getElementById('exam-form');
    const agendaList = document.getElementById('agenda-list');
    const notificationArea = document.getElementById('notification-area');
    const assistantQueryInput = document.getElementById('assistant-query');
    const askAssistantBtn = document.getElementById('ask-assistant-btn');
    const assistantResponse = document.getElementById('assistant-response');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let exams = JSON.parse(localStorage.getItem('exams')) || [];

    const saveData = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('exams', JSON.stringify(exams));
    };

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTask = {
            id: Date.now(),
            course: e.target['task-course'].value,
            description: e.target['task-desc'].value,
            deadline: e.target['task-deadline'].value,
            type: 'task'
        };
        tasks.push(newTask);
        saveData();
        renderAll();
        taskForm.reset();
    });

    examForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newExam = {
            id: Date.now(),
            course: e.target['exam-course'].value,
            examType: e.target['exam-type'].value,
            date: e.target['exam-date'].value,
            type: 'exam'
        };
        exams.push(newExam);
        saveData();
        renderAll();
        examForm.reset();
    });

    askAssistantBtn.addEventListener('click', handleAssistantQuery);
    assistantQueryInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleAssistantQuery();
    });

    const renderAgenda = () => {
        agendaList.innerHTML = '';
        const allItems = [...tasks, ...exams].map(item => ({
            ...item,
            date: item.type === 'task' ? item.deadline : item.date
        }));
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
            if (item.type === 'task') {
                li.innerHTML = `
                    <div class="agenda-icon">📝</div>
                    <div class="agenda-details"><h4>${item.course}</h4><p>${item.description}</p></div>
                    <div class="agenda-time"><strong>Deadline</strong><p>${formattedDate}</p><p>${formattedTime}</p></div>
                `;
            } else {
                li.innerHTML = `
                    <div class="agenda-icon">📘</div>
                    <div class="agenda-details"><h4>${item.examType} ${item.course}</h4></div>
                    <div class="agenda-time"><strong>Jadwal</strong><p>${formattedDate}</p><p>${formattedTime}</p></div>
                `;
            }
            agendaList.appendChild(li);
        });
    };

    const renderNotifications = () => {
        notificationArea.innerHTML = '';
        const allItems = [...tasks, ...exams].map(item => ({
            ...item,
            date: item.type === 'task' ? item.deadline : item.date
        }));
        const now = new Date();
        const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
        const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStart = new Date(tomorrow.setHours(0, 0, 0, 0));
        const tomorrowEnd = new Date(tomorrow.setHours(23, 59, 59, 999));

        const todayItems = allItems.filter(i => new Date(i.date) >= todayStart && new Date(i.date) <= todayEnd);
        const tomorrowItems = allItems.filter(i => new Date(i.date) >= tomorrowStart && new Date(i.date) <= tomorrowEnd);

        let found = false;
        todayItems.forEach(i => {
            found = true;
            const time = new Date(i.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const div = document.createElement('div');
            div.className = 'notification today';
            div.innerHTML = i.type === 'task'
                ? `⚠️ Hari ini ada deadline <strong>Tugas ${i.course}</strong> jam ${time}`
                : `📘 Hari ini ada <strong>${i.examType} ${i.course}</strong> jam ${time}`;
            notificationArea.appendChild(div);
        });
        tomorrowItems.forEach(i => {
            found = true;
            const time = new Date(i.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const div = document.createElement('div');
            div.className = 'notification tomorrow';
            div.innerHTML = i.type === 'task'
                ? `📝 Besok ada deadline <strong>Tugas ${i.course}</strong> jam ${time}`
                : `📘 Besok ada <strong>${i.examType} ${i.course}</strong> jam ${time}`;
            notificationArea.appendChild(div);
        });
        if (!found) notificationArea.innerHTML = '<p>Tidak ada pengingat untuk saat ini.</p>';
    };

    function handleAssistantQuery() {
        const query = assistantQueryInput.value.toLowerCase().trim();
        if (!query) {
            assistantResponse.textContent = 'Silakan ketik pertanyaan Anda.';
            return;
        }
        const allItems = [...tasks, ...exams].map(i => ({ ...i, date: i.type === 'task' ? i.deadline : i.date }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        const now = new Date();
        if (query.includes("hari ini")) {
            const todayStart = new Date(new Date().setHours(0,0,0,0));
            const todayEnd = new Date(new Date().setHours(23,59,59,999));
            const todayItems = allItems.filter(i => new Date(i.date) >= todayStart && new Date(i.date) <= todayEnd);
            if (todayItems.length > 0) {
                assistantResponse.innerHTML = 'Jadwal hari ini: <ul>' + todayItems.map(i => {
                    const time = new Date(i.date).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
                    return `<li>${i.type==='task'?'Tugas':i.examType} ${i.course} jam ${time}</li>`;
                }).join('') + '</ul>';
            } else assistantResponse.textContent = 'Tidak ada jadwal untuk hari ini.';
        } else if (query.includes("besok")) {
            const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
            const tomorrowStart = new Date(tomorrow.setHours(0,0,0,0));
            const tomorrowEnd = new Date(tomorrow.setHours(23,59,59,999));
            const tomorrowItems = allItems.filter(i => new Date(i.date) >= tomorrowStart && new Date(i.date) <= tomorrowEnd);
            if (tomorrowItems.length > 0) {
                assistantResponse.innerHTML = 'Jadwal besok: <ul>' + tomorrowItems.map(i => {
                    const time = new Date(i.date).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
                    return `<li>${i.type==='task'?'Tugas':i.examType} ${i.course} jam ${time}</li>`;
                }).join('') + '</ul>';
            } else assistantResponse.textContent = 'Tidak ada jadwal untuk besok.';
        } else if (query.includes("deadline terdekat")) {
            const futureItems = allItems.filter(i => new Date(i.date) > now);
            if (futureItems.length > 0) {
                const nearest = futureItems[0];
                const date = new Date(nearest.date);
                const formatted = date.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
                assistantResponse.textContent = `Jadwal terdekat adalah ${nearest.type==='task'?'Tugas':nearest.examType} ${nearest.course} pada ${formatted}.`;
            } else assistantResponse.textContent = 'Tidak ada jadwal mendatang.';
        } else {
            assistantResponse.textContent = "Maaf, saya tidak mengerti. Coba tanya: 'Hari ini ada jadwal apa?', 'Besok ada apa saja?', atau 'Deadline terdekat apa?'.";
        }
    }

    const renderAll = () => { renderAgenda(); renderNotifications(); };
    renderAll();
});