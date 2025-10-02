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
    // langsung buat file kalender + reminder
downloadICS(newItem);
scheduleReminder(newItem);
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
  // ======== SALAM UMUM ========
  { q: ["halo", "hai", "hello", "hei"], a: "Halo! Ada yang bisa saya bantu?" },
  { q: ["selamat pagi"], a: "Selamat pagi, semoga harimu menyenangkan!" },
  { q: ["selamat siang"], a: "Selamat siang, jangan lupa makan siang ya!" },
  { q: ["selamat sore"], a: "Selamat sore, semoga aktivitasmu lancar." },
  { q: ["selamat malam"], a: "Selamat malam, waktunya istirahat cukup ya." },
  { q: ["assalamualaikum"], a: "Waalaikumsalam, semoga damai untukmu." },
  { q: ["apa kabar", "gimana kabar"], a: "Aku baik, terima kasih. Semoga kamu juga baik ya!" },
  { q: ["terima kasih", "makasih"], a: "Sama-sama! Senang bisa membantu." },
  { q: ["siapa kamu"], a: "Aku asisten akademik yang siap bantu atur tugas, ujian, dan agenda kamu." },
  { q: ["lagi apa"], a: "Aku sedang siap menunggu pertanyaanmu 🙂." },

  // ======== TUGAS ========
  { q: ["deadline", "tugas"], a: () => agendaItems.length 
      ? "Daftar agenda: " + agendaItems.map(t => `${t.title} (${t.datetime.toLocaleDateString("id-ID")})`).join(", ")
      : "Belum ada agenda atau tugas."
  },
  { q: ["tugas terbaru", "deadline terbaru"], a: () => {
      if (!agendaItems.length) return "Belum ada tugas.";
      const next = agendaItems.sort((a,b)=>a.datetime-b.datetime)[0];
      return `Tugas terdekat: ${next.title} (${next.datetime.toLocaleString("id-ID")})`;
  }},
  { q: ["tugas saya apa", "ada tugas apa"], a: () => {
      const tasks = agendaItems.filter(t => t.type==="task");
      return tasks.length ? "Tugasmu: " + tasks.map(t => `${t.title} (${t.datetime.toLocaleDateString("id-ID")})`).join(", ") : "Belum ada tugas.";
  }},
  { q: ["tugas besok"], a: () => {
      const now = new Date();
      const tmr = new Date(); tmr.setDate(now.getDate()+1);
      const tasks = agendaItems.filter(t => t.type==="task" && t.datetime.toDateString()===tmr.toDateString());
      return tasks.length ? "Tugas besok: " + tasks.map(t => t.title).join(", ") : "Tidak ada tugas besok.";
  }},
  { q: ["tugas hari ini"], a: () => {
      const now = new Date();
      const tasks = agendaItems.filter(t => t.type==="task" && t.datetime.toDateString()===now.toDateString());
      return tasks.length ? "Tugas hari ini: " + tasks.map(t => t.title).join(", ") : "Tidak ada tugas hari ini.";
  }},

  // ======== UJIAN ========
  { q: ["ujian", "tes", "quiz"], a: () => {
      const exams = agendaItems.filter(t => t.type === "exam");
      return exams.length ? "Jadwal ujian: " + exams.map(e => `${e.title} (${e.datetime.toLocaleDateString("id-ID")})`).join(", ") : "Belum ada jadwal ujian.";
  }},
  { q: ["ujian besok"], a: () => {
      const now = new Date();
      const tmr = new Date(); tmr.setDate(now.getDate()+1);
      const exams = agendaItems.filter(t => t.type==="exam" && t.datetime.toDateString()===tmr.toDateString());
      return exams.length ? "Ujian besok: " + exams.map(e => e.title).join(", ") : "Tidak ada ujian besok.";
  }},
  { q: ["ujian hari ini"], a: () => {
      const now = new Date();
      const exams = agendaItems.filter(t => t.type==="exam" && t.datetime.toDateString()===now.toDateString());
      return exams.length ? "Ujian hari ini: " + exams.map(e => e.title).join(", ") : "Tidak ada ujian hari ini.";
  }},
  { q: ["ujian terdekat"], a: () => {
      const exams = agendaItems.filter(t => t.type==="exam");
      if (!exams.length) return "Belum ada ujian.";
      const next = exams.sort((a,b)=>a.datetime-b.datetime)[0];
      return `Ujian terdekat: ${next.title} (${next.datetime.toLocaleString("id-ID")})`;
  }},
  { q: ["kapan uas", "uas kapan"], a: () => {
      const uas = agendaItems.filter(t => t.type==="exam" && t.title.toLowerCase().includes("uas"));
      return uas.length ? "Jadwal UAS: " + uas.map(e => `${e.title} (${e.datetime.toLocaleDateString("id-ID")})`).join(", ") : "Belum ada jadwal UAS.";
  }},
  { q: ["kapan uts", "uts kapan"], a: () => {
      const uts = agendaItems.filter(t => t.type==="exam" && t.title.toLowerCase().includes("uts"));
      return uts.length ? "Jadwal UTS: " + uts.map(e => `${e.title} (${e.datetime.toLocaleDateString("id-ID")})`).join(", ") : "Belum ada jadwal UTS.";
  }},

  // ======== AGENDA ========
  { q: ["agenda"], a: () => agendaItems.length 
      ? "Agenda kamu: " + agendaItems.map(a => `${a.title} (${a.datetime.toLocaleDateString("id-ID")})`).join(", ")
      : "Belum ada agenda."
  },
  { q: ["agenda hari ini"], a: () => {
      const now = new Date();
      const ag = agendaItems.filter(a => a.datetime.toDateString()===now.toDateString());
      return ag.length ? "Agenda hari ini: " + ag.map(a => a.title).join(", ") : "Tidak ada agenda hari ini.";
  }},
  { q: ["agenda besok"], a: () => {
      const now = new Date();
      const tmr = new Date(); tmr.setDate(now.getDate()+1);
      const ag = agendaItems.filter(a => a.datetime.toDateString()===tmr.toDateString());
      return ag.length ? "Agenda besok: " + ag.map(a => a.title).join(", ") : "Tidak ada agenda besok.";
  }},
  { q: ["agenda terdekat"], a: () => {
      if (!agendaItems.length) return "Belum ada agenda.";
      const next = agendaItems.sort((a,b)=>a.datetime-b.datetime)[0];
      return `Agenda terdekat: ${next.title} (${next.datetime.toLocaleString("id-ID")})`;
  }},

  // ======== WAKTU / HARI ========
  { q: ["hari ini tanggal berapa", "sekarang tanggal berapa"], a: () => {
      const now = new Date();
      return "Hari ini " + now.toLocaleDateString("id-ID", { weekday:"long", year:"numeric", month:"long", day:"numeric"});
  }},
  { q: ["sekarang jam berapa"], a: () => "Sekarang jam " + new Date().toLocaleTimeString("id-ID") },
  { q: ["besok hari apa"], a: () => {
      const tmr = new Date(); tmr.setDate(tmr.getDate()+1);
      return "Besok hari " + tmr.toLocaleDateString("id-ID", { weekday:"long", day:"numeric", month:"long"});
  }},
  { q: ["lusa hari apa"], a: () => {
      const lusa = new Date(); lusa.setDate(lusa.getDate()+2);
      return "Lusa hari " + lusa.toLocaleDateString("id-ID", { weekday:"long", day:"numeric", month:"long"});
  }},

  // ======== MOTIVASI ========
  { q: ["semangat", "motivasi dong"], a: "Tetap semangat! Setiap usaha kecil akan membawa kamu lebih dekat ke tujuan." },
  { q: ["capek", "lelah"], a: "Kalau lelah jangan lupa istirahat sebentar. Kesehatan lebih penting." },
  { q: ["bosan"], a: "Kalau bosan, coba lakukan hal kecil yang kamu suka. Setelah itu lanjut lagi produktif." },
  { q: ["pusing"], a: "Kalau pusing, tarik napas dalam, minum air, dan coba rehat sejenak." },
  { q: ["ngantuk"], a: "Kalau ngantuk, sebaiknya tidur sebentar biar segar kembali." },
  { q: ["lapar"], a: "Kalau lapar, jangan lupa makan biar energimu kembali." },
  { q: ["haus"], a: "Minum air putih ya biar tetap segar." },

  // ======== RANDOM JAWABAN SEHARI-HARI ========
  { q: ["cuaca", "panas", "dingin"], a: "Aku tidak bisa lihat cuaca langsung, tapi semoga cuacanya mendukung aktivitasmu hari ini." },
  { q: ["lagi apa"], a: "Aku lagi siap untuk bantu jawab pertanyaanmu." },
  { q: ["siapa namamu"], a: "Aku Asisten Akademik, temenmu untuk mengatur jadwal." },
  { q: ["bisa apa"], a: "Aku bisa simpan agenda, tugas, ujian, dan mengingatkan jadwalmu." },
  { q: ["tolong"], a: "Tentu, coba ceritakan apa yang kamu butuhkan." },
  { q: ["apa itu agenda"], a: "Agenda adalah catatan kegiatan yang sudah kamu simpan di aplikasi ini." },
  { q: ["apa itu tugas"], a: "Tugas adalah pekerjaan yang harus kamu kumpulkan sesuai deadline." },
  { q: ["apa itu ujian"], a: "Ujian adalah tes seperti UTS atau UAS yang sudah kamu catat di sini." },
  { q: ["apa fungsi kamu"], a: "Fungsi utamaku adalah mengingatkanmu soal tugas, ujian, dan agenda." },
  { q: ["oke", "sip", "baik"], a: "Siap, terima kasih!" },
  { q: ["bye", "dadah"], a: "Sampai jumpa! Semoga harimu menyenangkan." },

  // ======== EXTRA VARIASI SALAM & RANDOM ========
  { q: ["pagi"], a: "Pagi! Semoga hari ini penuh energi positif." },
  { q: ["siang"], a: "Siang! Jangan lupa istirahat." },
  { q: ["sore"], a: "Sore! Waktunya santai sebentar." },
  { q: ["malam"], a: "Malam! Semoga tidurmu nyenyak nanti." },
  { q: ["selamat belajar"], a: "Belajar yang rajin ya, hasil tidak mengkhianati usaha." },
  { q: ["selamat ujian"], a: "Semoga ujianmu lancar, tenang, dan sukses." },
  { q: ["terima kasih banyak"], a: "Sama-sama, aku senang bisa bantu lebih banyak." },
  { q: ["mantap"], a: "Mantap! Semoga selalu produktif." },
  { q: ["keren"], a: "Makasih! Kamu juga keren bisa memanfaatkan aplikasi ini." },
  { q: ["gabut"], a: "Kalau gabut, coba rapikan catatan atau buat agenda baru." },
  { q: ["ngopi"], a: "Ngopi dulu boleh, asal jangan kebanyakan ya." },
  { q: ["ngoding"], a: "Semangat ngodingnya! Debugging memang butuh kesabaran." },
  { q: ["musik"], a: "Musik bisa jadi teman belajar yang baik, asal tidak ganggu fokus." },
  { q: ["gaming"], a: "Jangan lupa atur waktu gaming supaya tugas tetap jalan." },
  { q: ["jalan-jalan"], a: "Refresh itu penting, tapi jangan lupa kembali ke tugasmu." },
  { q: ["nonton"], a: "Nonton boleh, asal tugas tetap dikerjakan." },
  { q: ["scroll"], a: "Hati-hati kebablasan scroll medsos ya 😅." },
  { q: ["tidur"], a: "Tidur cukup akan bikin pikiran lebih segar besok." },
  { q: ["bangun"], a: "Bangun pagi bikin aktivitas lebih produktif." },
  { q: ["selamat ulang tahun"], a: "Selamat ulang tahun! Semoga panjang umur dan sukses selalu." },
  { q: ["doakan saya"], a: "Semoga semua usaha dan perjuanganmu dilancarkan." },
  { q: ["lulus"], a: "Semoga kamu lulus dengan nilai terbaik!" },
  { q: ["skripsi"], a: "Skripsi memang berat, tapi langkah kecil tiap hari akan bikin selesai." },
  { q: ["magang"], a: "Magang itu kesempatan bagus untuk belajar langsung di dunia kerja." },
  { q: ["wisuda"], a: "Wisuda akan jadi momen indah. Semoga kamu segera mencapainya." }
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



