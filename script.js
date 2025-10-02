document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const examForm = document.getElementById('exam-form');
    const agendaForm = document.getElementById('agenda-form');
    const agendaList = document.getElementById('agenda-list');
    const notificationArea = document.getElementById('notification-area');
    const assistantBtn = document.getElementById('ask-assistant-btn');
    const assistantQuery = document.getElementById('assistant-query');
    const assistantResponse = document.getElementById('assistant-response');
    const modal = document.getElementById('calendar-modal');
    const closeButton = document.querySelector('.close-button');
    const calendarLink = document.getElementById('calendar-link');

    let agendaItems = [];

    function addAgendaItem(type, title, description, datetime) {
        const agendaItem = {
            id: Date.now(),
            type,
            title,
            description,
            datetime: new Date(datetime)
        };
        agendaItems.push(agendaItem);
        agendaItems.sort((a, b) => a.datetime - b.datetime);
        renderAgenda();
        updateNotifications();
        showModal(agendaItem);
    }

    function renderAgenda() {
        agendaList.innerHTML = '';
        agendaItems.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('agenda-item', item.type);

            const icon = document.createElement('div');
            icon.classList.add('agenda-icon');
            icon.textContent = item.type === 'task' ? '📘' : item.type === 'exam' ? '📝' : '📅';

            const details = document.createElement('div');
            details.classList.add('agenda-details');
            const title = document.createElement('h4');
            title.textContent = item.title;
            const desc = document.createElement('p');
            desc.textContent = item.description;
            details.appendChild(title);
            details.appendChild(desc);

            const time = document.createElement('div');
            time.classList.add('agenda-time');
            time.textContent = item.datetime.toLocaleString();

            li.appendChild(icon);
            li.appendChild(details);
            li.appendChild(time);
            agendaList.appendChild(li);
        });
    }

    function updateNotifications() {
        notificationArea.innerHTML = '';
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const todaysEvents = agendaItems.filter(item =>
            isSameDay(item.datetime, today)
        );
        const tomorrowsEvents = agendaItems.filter(item =>
            isSameDay(item.datetime, tomorrow)
        );

        if (todaysEvents.length === 0 && tomorrowsEvents.length === 0) {
            notificationArea.innerHTML = '<p>Tidak ada pengingat untuk saat ini.</p>';
        } else {
            todaysEvents.forEach(event => {
                const div = document.createElement('div');
                div.classList.add('notification', 'today');
                div.textContent = `Hari ini: ${event.title} (${event.type}) - ${event.datetime.toLocaleTimeString()}`;
                notificationArea.appendChild(div);
            });
            tomorrowsEvents.forEach(event => {
                const div = document.createElement('div');
                div.classList.add('notification', 'tomorrow');
                div.textContent = `Besok: ${event.title} (${event.type}) - ${event.datetime.toLocaleTimeString()}`;
                notificationArea.appendChild(div);
            });
        }
    }

    function isSameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    }

    // Form handlers
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const course = document.getElementById('task-course').value;
        const desc = document.getElementById('task-desc').value;
        const deadline = document.getElementById('task-deadline').value;
        addAgendaItem('task', `Tugas ${course}`, desc, deadline);
        taskForm.reset();
    });

    examForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const course = document.getElementById('exam-course').value;
        const type = document.getElementById('exam-type').value;
        const date = document.getElementById('exam-date').value;
        addAgendaItem('exam', `${type} ${course}`, `Ujian ${course}`, date);
        examForm.reset();
    });

    agendaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('agenda-title').value;
        const desc = document.getElementById('agenda-desc').value;
        const date = document.getElementById('agenda-date').value;
        addAgendaItem('agenda', title, desc, date);
        agendaForm.reset();
    });

    // Asisten sederhana (dummy AI)
    assistantBtn.addEventListener('click', () => {
        const query = assistantQuery.value.toLowerCase();
        let response = "Maaf, saya tidak mengerti pertanyaan Anda.";

        if (query.includes("deadline")) {
            if (agendaItems.length > 0) {
                const nearest = agendaItems[0];
                response = `Deadline terdekat: ${nearest.title} pada ${nearest.datetime.toLocaleString()}`;
            } else {
                response = "Belum ada agenda yang tercatat.";
            }
        } else if (query.includes("ujian")) {
            const exams = agendaItems.filter(item => item.type === 'exam');
            if (exams.length > 0) {
                response = `Jadwal ujian terdekat: ${exams[0].title} pada ${exams[0].datetime.toLocaleString()}`;
            } else {
                response = "Belum ada jadwal ujian.";
            }
        } else if (query.includes("tugas")) {
            const tasks = agendaItems.filter(item => item.type === 'task');
            if (tasks.length > 0) {
                response = `Tugas terdekat: ${tasks[0].title} deadline ${tasks[0].datetime.toLocaleString()}`;
            } else {
                response = "Belum ada tugas.";
            }
        }

        assistantResponse.textContent = response;
        assistantResponse.style.backgroundColor = "#e6f7ff";
    });

    // Modal functionality
function showModal(agendaItem) {
    // langsung generate file ICS
    const link = document.createElement("a");
    link.href = generateICS(agendaItem);
    link.download = `${agendaItem.title}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
    function generateICS(item) {
        const start = item.datetime.toISOString().replace(/-|:|\.\d+/g, "");
        const end = new Date(item.datetime.getTime() + 60 * 60 * 1000)
            .toISOString().replace(/-|:|\.\d+/g, "");

        const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${item.title}
DESCRIPTION:${item.description}
DTSTART:${start}
DTEND:${end}
END:VEVENT
END:VCALENDAR`.trim();

        return "data:text/calendar;charset=utf-8," + encodeURIComponent(icsContent);
    }
});

