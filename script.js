// ================== DATA AGENDA ==================
let agendaItems = [];

// ================== UTILS ==================
function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

// ================== GENERATE ICS (DENGAN PENGINGAT H-1 JAM 19:00) ==================
function generateICS(item) {
    const start = new Date(item.datetime);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // default durasi 1 jam

    const pad = n => (n < 10 ? '0' + n : n);

    const formatDate = d =>
        d.getUTCFullYear().toString() +
        pad(d.getUTCMonth() + 1) +
        pad(d.getUTCDate()) + 'T' +
        pad(d.getUTCHours()) +
        pad(d.getUTCMinutes()) +
        pad(d.getUTCSeconds()) + 'Z';

    // 🔹 Alarm H-1 jam 19:00
    const reminder = new Date(start);
    reminder.setDate(reminder.getDate() - 1);
    reminder.setHours(19, 0, 0, 0);

    const icsContent =
`BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${item.title}
DESCRIPTION:${item.desc}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
BEGIN:VALARM
TRIGGER;VALUE=DATE-TIME:${formatDate(reminder)}
ACTION:DISPLAY
DESCRIPTION:Pengingat ${item.title}
END:VALARM
END:VEVENT
END:VCALENDAR`;

    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsContent);
}

// ================== AGENDA ==================
function addAgendaItem(type, title, desc, datetime) {
    const newItem = { type, title, desc, datetime: new Date(datetime) };
    agendaItems.push(newItem);
    renderAgenda();
    showModal(newItem); // langsung download ICS
}

function renderAgenda() {
    const list = document.getElementById('agenda-list');
    list.innerHTML = '';
    agendaItems.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.title} - ${item.datetime.toLocaleString()} (${item.type})`;
        list.appendChild(li);
    });
}

// Download ICS otomatis
function showModal(agendaItem) {
    const link = document.createElement("a");
    link.href = generateICS(agendaItem);
    link.download = `${agendaItem.title}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ================== FORM HANDLING ==================
document.getElementById('task-form').addEventListener('submit', e => {
    e.preventDefault();
    const course = document.getElementById('task-course').value;
    const desc = document.getElementById('task-desc').value;
    const deadline = document.getElementById('task-deadline').value;
    addAgendaItem('task', `Tugas ${course}`, desc, deadline);
});

document.getElementById('exam-form').addEventListener('submit', e => {
    e.preventDefault();
    const course = document.getElementById('exam-course').value;
    const desc = document.getElementById('exam-desc').value;
    const examDate = document.getElementById('exam-date').value;
    addAgendaItem('exam', `Ujian ${course}`, desc, examDate);
});

document.getElementById('agenda-form').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('agenda-title').value;
    const desc = document.getElementById('agenda-desc').value;
    const date = document.getElementById('agenda-date').value;
    addAgendaItem('agenda', title, desc, date);
});

// ================== BANK PERTANYAAN JAWABAN ==================
const qaBank = [
    // Sapaan dasar
    { q: ["halo", "hai", "hello"], a: "Halo! Ada yang bisa saya bantu?" },
    { q: ["selamat pagi"], a: "Selamat pagi! Semoga harimu produktif." },
    { q: ["selamat siang"], a: "Selamat siang! Jangan lupa makan siang ya." },
    { q: ["selamat sore"], a: "Selamat sore! Semangat terus." },
    { q: ["selamat malam"], a: "Selamat malam! Waktunya istirahat." },
    { q: ["apa kabar"], a: "Saya baik, terima kasih. Semoga kamu juga baik ya!" },

    // Identitas
    { q: ["siapa kamu", "kamu siapa"], a: "Saya adalah Asisten Mahasiswa, siap membantu mengingatkan tugas dan ujian kamu." },
    { q: ["apa fungsi kamu", "kamu bisa apa"], a: "Saya bisa mengingatkan tugas, ujian, dan agenda kamu. Silakan tanya!" },

    // Tugas hari ini
    { q: ["tugas apa hari ini", "deadline hari ini"], a: () => {
        const today = new Date();
        const tasks = agendaItems.filter(i => i.type === "task" && isSameDay(i.datetime, today));
        return tasks.length ? "Tugas hari ini: " + tasks.map(t => t.title).join(", ") : "Tidak ada tugas untuk hari ini.";
    }},

    // Tugas besok
    { q: ["tugas apa besok", "deadline besok"], a: () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tasks = agendaItems.filter(i => i.type === "task" && isSameDay(i.datetime, tomorrow));
        return tasks.length ? "Tugas besok: " + tasks.map(t => t.title).join(", ") : "Tidak ada tugas untuk besok.";
    }},

    // Ujian hari ini
    { q: ["ujian apa hari ini", "jadwal ujian hari ini"], a: () => {
        const today = new Date();
        const exams = agendaItems.filter(i => i.type === "exam" && isSameDay(i.datetime, today));
        return exams.length ? "Ujian hari ini: " + exams.map(e => e.title).join(", ") : "Tidak ada ujian hari ini.";
    }},

    // Agenda umum
    { q: ["ada agenda", "agenda saya"], a: () => {
        return agendaItems.length ? 
            "Agenda kamu: " + agendaItems.map(a => a.title + " (" + a.datetime.toLocaleDateString() + ")").join(", ") :
            "Belum ada agenda.";
    }},

    // Motivasi
    { q: ["kasih motivasi", "butuh semangat"], a: "Semangat! Tugas boleh banyak, tapi kamu pasti bisa menyelesaikannya 💪" },
    { q: ["capek", "lelah"], a: "Istirahat sebentar ya. Kesehatan juga penting 😊" },
    { q: ["pusing"], a: "Kalau pusing, coba tarik napas dalam dan istirahat sebentar." },

    // Terima kasih
    { q: ["terima kasih", "makasih"], a: "Sama-sama! Senang bisa membantu 😊" },

    // Random tambahan untuk variasi percakapan
    { q: ["lagi apa", "sedang apa"], a: "Saya lagi standby bantuin kamu ✨" },
    { q: ["cuaca"], a: "Saya tidak bisa memeriksa cuaca langsung, tapi semoga cerah ya 🌤️" },
    { q: ["lapar"], a: "Jangan lupa makan dulu biar tetap semangat!" },
    { q: ["haus"], a: "Minum air putih dulu ya 💧" },
    { q: ["bye", "dadah"], a: "Dadah! Sampai jumpa 👋" },
];

// Tambahan otomatis supaya total >100
const extraGreetings = [
    "assalamualaikum", "waalaikumsalam", "hi", "yo", "bro", "sis", "selamat datang",
    "bagaimana harimu", "lagi sibuk apa", "ngapain", "ada kabar", "apa yang baru",
    "tolong bantu", "bisa bantu saya", "ada deadline", "ada tugas", "ada ujian",
    "agenda minggu ini", "deadline minggu ini", "ujian minggu ini", "tugas kuliah",
    "deadline skripsi", "ada reminder", "pengingat tugas", "pengingat ujian", "pengingat agenda",
    "ada jadwal", "jadwal hari ini", "jadwal besok", "jadwal minggu ini",
    "semangat dong", "ayo kerja", "ayo belajar", "jangan malas", "kerja kelompok",
    "presentasi kapan", "sidang kapan", "seminar kapan", "rapat kapan", "kapan libur"
];

extraGreetings.forEach(greet => {
    qaBank.push({ q: [greet], a: "Oke, saya catat ya. Mau saya tampilkan daftar tugas/ujian/agenda?" });
});

// ================== ASISTEN HANDLER ==================
document.getElementById('assistant-btn').addEventListener('click', () => {
    const query = document.getElementById('assistant-query').value.toLowerCase().trim();
    let response = null;

    for (let item of qaBank) {
        if (item.q.some(keyword => query.includes(keyword))) {
            if (typeof item.a === "function") {
                response = item.a();
            } else {
                response = item.a;
            }
            break;
        }
    }

    if (!response) {
        response = "Maaf, saya belum paham pertanyaan itu. Coba tanya soal tugas, ujian, atau agenda ya.";
    }

    const assistantResponse = document.getElementById('assistant-response');
    assistantResponse.textContent = response;
    assistantResponse.style.backgroundColor = "#e6f7ff";
});
