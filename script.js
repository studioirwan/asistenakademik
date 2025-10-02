// =======================
// Data Agenda
// =======================
let agendaItems = [];

// Tambah Item Agenda
function addAgendaItem(type, title, desc, datetime) {
    const newItem = {
        id: Date.now(),
        type,
        title,
        desc,
        datetime: new Date(datetime)
    };
    agendaItems.push(newItem);
    renderAgenda();
    updateNotifications();
    showCalendarModal(newItem);
}

// Render Agenda ke UI
function renderAgenda() {
    const list = document.getElementById('agenda-list');
    list.innerHTML = '';

    agendaItems
        .sort((a, b) => a.datetime - b.datetime)
        .forEach(item => {
            const li = document.createElement('li');
            li.className = `agenda-item ${item.type}`;
            li.innerHTML = `
                <div class="agenda-icon">${
                    item.type === "task" ? "📝" : item.type === "exam" ? "📚" : "📅"
                }</div>
                <div class="agenda-details">
                    <h4>${item.title}</h4>
                    <p>${item.desc || ""}</p>
                </div>
                <div class="agenda-time">
                    ${item.datetime.toLocaleString("id-ID")}
                </div>
            `;
            list.appendChild(li);
        });
}

// =======================
// Notifikasi
// =======================
function updateNotifications() {
    const area = document.getElementById('notification-area');
    area.innerHTML = "";

    const now = new Date();
    const today = agendaItems.filter(item => 
        item.datetime.toDateString() === now.toDateString()
    );
    const tomorrow = agendaItems.filter(item => {
        const tmr = new Date(now);
        tmr.setDate(tmr.getDate() + 1);
        return item.datetime.toDateString() === tmr.toDateString();
    });

    if (today.length === 0 && tomorrow.length === 0) {
        area.innerHTML = "<p>Tidak ada pengingat untuk saat ini.</p>";
        return;
    }

    if (today.length) {
        today.forEach(item => {
            const div = document.createElement("div");
            div.className = "notification today";
            div.textContent = `Hari ini: ${item.title} - ${item.datetime.toLocaleTimeString("id-ID")}`;
            area.appendChild(div);
        });
    }

    if (tomorrow.length) {
        tomorrow.forEach(item => {
            const div = document.createElement("div");
            div.className = "notification tomorrow";
            div.textContent = `Besok: ${item.title} - ${item.datetime.toLocaleTimeString("id-ID")}`;
            area.appendChild(div);
        });
    }
}

// =======================
// Form Submit
// =======================
document.getElementById('task-form').addEventListener('submit', e => {
    e.preventDefault();
    const course = document.getElementById('task-course').value;
    const desc = document.getElementById('task-desc').value;
    const deadline = document.getElementById('task-deadline').value;
    addAgendaItem("task", `Tugas ${course}`, desc, deadline);
    e.target.reset();
});

document.getElementById('exam-form').addEventListener('submit', e => {
    e.preventDefault();
    const course = document.getElementById('exam-course').value;
    const type = document.getElementById('exam-type').value;
    const date = document.getElementById('exam-date').value;
    addAgendaItem("exam", `${type} ${course}`, `Jadwal ${type}`, date);
    e.target.reset();
});

document.getElementById('agenda-form').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('agenda-title').value;
    const desc = document.getElementById('agenda-desc').value;
    const date = document.getElementById('agenda-date').value;
    addAgendaItem("agenda", title, desc, date);
    e.target.reset();
});

// =======================
// Asisten Tanya Jawab
// =======================
const qaBank = [
    { q: ["halo", "hai"], a: "Halo! Ada yang bisa saya bantu?" },
    { q: ["deadline", "tugas"], a: () => agendaItems.length 
        ? "Daftar agenda: " + agendaItems.map(t => `${t.title} (${t.datetime.toLocaleDateString("id-ID")})`).join(", ")
        : "Belum ada agenda atau tugas." 
    },
    { q: ["ujian"], a: () => {
        const exams = agendaItems.filter(t => t.type === "exam");
        return exams.length ? "Jadwal ujian: " + exams.map(e => `${e.title} (${e.datetime.toLocaleDateString("id-ID")})`).join(", ") : "Belum ada jadwal ujian.";
    }}
];

document.getElementById('ask-assistant-btn').addEventListener('click', () => {
    const query = document.getElementById('assistant-query').value.toLowerCase();
    let response = "Maaf, saya tidak paham pertanyaan Anda.";
    for (let item of qaBank) {
        if (item.q.some(k => query.includes(k))) {
            response = typeof item.a === "function" ? item.a() : item.a;
            break;
        }
    }
    document.getElementById('assistant-response').textContent = response;
});

// =======================
// Modal Kalender (ICS)
// =======================
function showCalendarModal(item) {
    const modal = document.getElementById("calendar-modal");
    const closeBtn = document.querySelector(".close-button");
    const link = document.getElementById("calendar-link");

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${item.title}
DESCRIPTION:${item.desc}
DTSTART:${item.datetime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"}
DTEND:${item.datetime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar" });
    link.href = URL.createObjectURL(blob);

    modal.style.display = "block";

    closeBtn.onclick = () => { modal.style.display = "none"; };
    window.onclick = event => {
        if (event.target === modal) modal.style.display = "none";
    };
}
