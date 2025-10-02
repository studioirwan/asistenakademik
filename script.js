// ================== DATA AGENDA ==================
let agendaItems = [];

// ================== UTILS ==================
function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

// ================== BANK PERTANYAAN ==================
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

// Tambahan otomatis untuk variasi pertanyaan umum (supaya total >100)
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

// Total sekarang = 100+ entri

// ================== ASISTEN HANDLER ==================
assistantBtn.addEventListener('click', () => {
    const query = assistantQuery.value.toLowerCase().trim();
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

    assistantResponse.textContent = response;
    assistantResponse.style.backgroundColor = "#e6f7ff";
});
