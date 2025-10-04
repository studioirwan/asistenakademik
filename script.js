// =======================
// Data Agenda
// =======================
let agendaItems = JSON.parse(localStorage.getItem("agendaItems")) || [];
agendaItems = agendaItems.map(i => ({ ...i, datetime: new Date(i.datetime), completed: i.completed || false }));

function saveAgenda() {
  localStorage.setItem("agendaItems", JSON.stringify(agendaItems));
}

// =======================
// Helper tanggal
// =======================
function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

function daysDiff(d1, d2) {
  return Math.ceil((d1 - d2) / (1000 * 60 * 60 * 24));
}

// =======================
// Tambah Item Agenda
// =======================
function addAgendaItem(type, title, desc, datetime) {
  const newItem = { 
    id: Date.now(), 
    type, 
    title, 
    desc, 
    datetime: new Date(datetime),
    completed: false
  };
  agendaItems.push(newItem);
  saveAgenda();
  renderAgenda();
  updateNotifications();
  updateSummary();
  renderCalendar(currentMonth, currentYear);
}

// =======================
// Render Agenda List
// =======================
function renderAgenda() {
  const agendaList = document.getElementById("agenda-list");
  agendaList.innerHTML = "";
  agendaItems
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
    .forEach(item => {
      const li = document.createElement("li");
      li.classList.add("agenda-item", item.type);

      let statusButton = "";
      if(item.type === "task"){
        statusButton = `<button class="status-btn" data-id="${item.id}">
                          ${item.completed ? "✅ Selesai" : "❌ Belum"}
                        </button>`;
      }

      li.innerHTML = `<div class="agenda-details">
        <h4>${item.title}</h4>
        <p>${item.desc || ""}</p>
        <div class="agenda-time">${item.datetime.toLocaleString("id-ID")}</div>
      </div>
      ${statusButton}`;

      agendaList.appendChild(li);
    });

  // Event listener tombol status
  document.querySelectorAll(".status-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      const task = agendaItems.find(i => i.id === id);
      task.completed = !task.completed;
      saveAgenda();
      renderAgenda();
      updateSummary();
    });
  });
}

// =======================
// Update Notifications
// =======================
function updateNotifications() {
  const area = document.getElementById("notification-area");
  area.innerHTML = "";
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayItems = agendaItems.filter(i => isSameDay(i.datetime, today));
  const tomorrowItems = agendaItems.filter(i => isSameDay(i.datetime, tomorrow));

  if (todayItems.length === 0 && tomorrowItems.length === 0) {
    area.innerHTML = "<p>Tidak ada pengingat untuk saat ini.</p>";
    return;
  }

  function formatItem(item) {
    const date = new Date(item.datetime);
    const timeStr = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    if (item.type === "task") return `Tugas - ${item.title} - ${timeStr}`;
    if (item.type === "exam") {
      const parts = item.title.split(" - ");
      return `${parts[1] || ""} - ${parts[0] || ""} - ${timeStr}`;
    }
    if (item.type === "agenda") return `Agenda - ${item.title} - ${timeStr}`;
    return item.title;
  }

  todayItems.forEach(i => {
    const div = document.createElement("div");
    div.className = "notification today";
    div.innerText = `Hari ini: ${formatItem(i)}`;
    area.appendChild(div);
  });

  tomorrowItems.forEach(i => {
    const div = document.createElement("div");
    div.className = "notification tomorrow";
    div.innerText = `Besok: ${formatItem(i)}`;
    area.appendChild(div);
  });
}

// =======================
// Update Summary
// =======================
function updateSummary() {
  const today = new Date();
  const taskItems = agendaItems.filter(i => i.type === "task");
  const totalTasks = taskItems.length;
  const unfinishedTasks = taskItems.filter(i => !i.completed).length;
  const upcomingTasks = taskItems.filter(i => {
    const diff = daysDiff(i.datetime, today);
    return diff >= 0 && diff <= 3 && !i.completed;
  });

  document.getElementById("task-count").innerText = `${totalTasks} Tugas`;
  document.getElementById("unfinished-task-count").innerText = `${unfinishedTasks} Belum selesai`;
  document.getElementById("upcoming-task-count").innerText = `${upcomingTasks.length} Deadline dekat`;
  document.getElementById("exam-count").innerText = `${agendaItems.filter(i => i.type === "exam").length} Ujian`;
  document.getElementById("agenda-count").innerText = `${agendaItems.filter(i => i.type === "agenda").length} Agenda`;
}

// =======================
// Kalender
// =======================
const calendarGrid = document.getElementById("calendar-grid");
const calendarTitle = document.getElementById("calendar-title");
const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const tooltip = document.createElement("div");
tooltip.id = "day-tooltip";
tooltip.style.position = "absolute";
tooltip.style.background = "#fff";
tooltip.style.border = "1px solid #ccc";
tooltip.style.padding = "10px";
tooltip.style.borderRadius = "6px";
tooltip.style.boxShadow = "0 3px 10px rgba(0,0,0,0.2)";
tooltip.style.display = "none";
tooltip.style.zIndex = "1000";
tooltip.style.maxWidth = "220px";
tooltip.style.fontSize = "14px";
document.body.appendChild(tooltip);

function renderCalendar(month, year) {
  calendarGrid.innerHTML = "";
  calendarTitle.textContent = `${monthNames[month]} ${year}`;
  const today = new Date();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const totalCells = 42;

  for (let i = 0; i < totalCells; i++) {
    const div = document.createElement("div");
    div.classList.add("calendar-day");
    let dayNumber, cellMonth = month, cellYear = year, isCurrentMonth = true;

    if (i < firstDay) {
      dayNumber = prevMonthDays - firstDay + 1 + i;
      cellMonth = month - 1 < 0 ? 11 : month - 1;
      cellYear = month - 1 < 0 ? year - 1 : year;
      isCurrentMonth = false;
    } else if (i >= firstDay + daysInMonth) {
      dayNumber = i - firstDay - daysInMonth + 1;
      cellMonth = month + 1 > 11 ? 0 : month + 1;
      cellYear = month + 1 > 11 ? year + 1 : year;
      isCurrentMonth = false;
    } else {
      dayNumber = i - firstDay + 1;
    }

    div.innerText = dayNumber;
    const thisDate = new Date(cellYear, cellMonth, dayNumber);

    if (isSameDay(thisDate, today)) div.classList.add("today");

    const dayEvents = agendaItems.filter(item => isSameDay(item.datetime, thisDate));
    if(dayEvents.length){
      div.classList.add("has-event");
      const colors = { task: "rgba(80,227,194,0.3)", exam: "rgba(226,124,74,0.3)", agenda: "rgba(144,74,226,0.3)" };
      div.style.backgroundColor = colors[dayEvents[0].type] || "rgba(200,200,200,0.3)";
    }

    if(!isCurrentMonth){
      div.style.opacity = "0.4";
      div.style.color = "#999";
    }

    div.addEventListener("click", (e) => {
      if(dayEvents.length === 0) return;
      let html = "<strong>Agenda Hari Ini:</strong><ul>";
      dayEvents.forEach(ev => {
        html += `<li>${ev.type.toUpperCase()}: ${ev.title} ${ev.completed ? "(✅)" : "(❌)"}</li>`;
      });
      html += "</ul>";
      tooltip.innerHTML = html;

      const rect = div.getBoundingClientRect();
      tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
      tooltip.style.left = `${rect.left + window.scrollX}px`;
      tooltip.style.display = "block";

      document.addEventListener("click", function hideTooltip(ev){
        if(!tooltip.contains(ev.target) && ev.target !== div){
          tooltip.style.display = "none";
          document.removeEventListener("click", hideTooltip);
        }
      });
    });

    calendarGrid.appendChild(div);
  }
}

document.getElementById("prev-month").addEventListener("click", () => {
  currentMonth--;
  if(currentMonth < 0){ currentMonth = 11; currentYear--; }
  renderCalendar(currentMonth, currentYear);
});
document.getElementById("next-month").addEventListener("click", () => {
  currentMonth++;
  if(currentMonth > 11){ currentMonth = 0; currentYear++; }
  renderCalendar(currentMonth, currentYear);
});

// =======================
// UX Form Handlers
// =======================
function showMessage(formEl, message, type="success"){
  let msgEl = formEl.querySelector(".form-message");
  if(!msgEl){
    msgEl = document.createElement("div");
    msgEl.className = "form-message";
    msgEl.style.marginTop = "10px";
    msgEl.style.fontWeight = "500";
    formEl.appendChild(msgEl);
  }
  msgEl.innerText = message;
  msgEl.style.color = type==="success" ? "green" : "red";
  setTimeout(()=>{ msgEl.innerText = ""; }, 2000);
}

function handleFormSubmit(formId, type, fields){
  const formEl = document.getElementById(formId);
  formEl.addEventListener("submit", e=>{
    e.preventDefault();
    for(const fieldId of fields){
      const inputEl = document.getElementById(fieldId);
      if(!inputEl.value.trim()){
        inputEl.focus();
        inputEl.style.borderColor = "red";
        showMessage(formEl, "Mohon lengkapi field yang wajib!", "error");
        return;
      }else{
        inputEl.style.borderColor = "var(--border-color)";
      }
    }
    showMessage(formEl, "Menyimpan...", "success");
    setTimeout(()=>{
      let title, desc, datetime;
      if(type === "exam") {
        title = document.getElementById(fields[0]).value + " - " + document.getElementById(fields[1]).value;
        desc = ""; // atau tambahkan field deskripsi ujian jika diinginkan
        datetime = document.getElementById(fields[2]).value;
      } else {
        title = document.getElementById(fields[0]).value;
        desc = fields[1] ? document.getElementById(fields[1]).value : "";
        datetime = document.getElementById(fields[2]).value;
      }
      addAgendaItem(type, title, desc, datetime);
      formEl.reset();
      showMessage(formEl, "Data berhasil disimpan!", "success");
    },500);
  });
}

handleFormSubmit("task-form", "task", ["task-course","task-desc","task-deadline"]);
handleFormSubmit("exam-form", "exam", ["exam-course","exam-type","exam-date"]);
handleFormSubmit("agenda-form", "agenda", ["agenda-title","agenda-desc","agenda-date"]);

// =======================
// AI Assistant (langsung cek data, tanpa fuzzy, banyak variasi pertanyaan)
// =======================

function askAssistant(query) {
  const lowerQuery = query.trim().toLowerCase();

  // Sapaan
  if (["halo", "hai", "hello", "hi"].includes(lowerQuery)) {
    return "Halo! Ada yang bisa saya bantu hari ini?";
  }
  if (lowerQuery.includes("selamat pagi")) { return "Selamat pagi! Semoga harimu menyenangkan dan produktif."; }
  if (lowerQuery.includes("selamat siang")) { return "Selamat siang! Jangan lupa makan siang agar tetap semangat."; }
  if (lowerQuery.includes("selamat sore")) { return "Selamat sore! Semoga tugas-tugasmu berjalan lancar."; }
  if (lowerQuery.includes("selamat malam")) { return "Selamat malam! Saatnya istirahat setelah seharian beraktivitas."; }
  if (lowerQuery.includes("assalamualaikum")) { return "Wa'alaikumsalam! Semoga selalu diberi kesehatan dan kelancaran."; }

  // Tugas hari ini / Deadline hari ini / Ada tugas hari ini / Hari ini ada tugas
  if (
    lowerQuery.includes("ada tugas apa hari ini?") ||
    lowerQuery.includes("ada deadline apa hari ini?") ||
    lowerQuery.includes("tugas hari ini") ||
    lowerQuery.includes("ada tugas hari ini") ||
    lowerQuery.includes("hari ini ada tugas") ||
    lowerQuery.includes("deadline hari ini")
  ) {
    const today = new Date();
    const tasks = agendaItems.filter(i => i.type === "task" && isSameDay(i.datetime, today));
    return tasks.length ? "Tugas hari ini:\n" + tasks.map(t => t.title).join("\n") : "Tidak ada tugas hari ini.";
  }

  // Ujian hari ini / Ada ujian hari ini / Hari ini ada ujian
  if (
    lowerQuery.includes("ada ujian apa hari ini?") ||
    lowerQuery.includes("ada jadwal ujian apa hari ini?") ||
    lowerQuery.includes("ujian hari ini") ||
    lowerQuery.includes("ada ujian hari ini") ||
    lowerQuery.includes("hari ini ada ujian")
  ) {
    const today = new Date();
    const exams = agendaItems.filter(i => i.type === "exam" && isSameDay(i.datetime, today));
    return exams.length ? "Ujian hari ini:\n" + exams.map(e => e.title).join("\n") : "Tidak ada ujian hari ini.";
  }

  // Agenda hari ini / Acara hari ini / Ada agenda hari ini / Hari ini ada agenda
  if (
    lowerQuery.includes("ada agenda apa hari ini?") ||
    lowerQuery.includes("ada acara apa hari ini?") ||
    lowerQuery.includes("agenda hari ini") ||
    lowerQuery.includes("acara hari ini") ||
    lowerQuery.includes("ada agenda hari ini") ||
    lowerQuery.includes("hari ini ada agenda")
  ) {
    const today = new Date();
    const agendas = agendaItems.filter(i => i.type === "agenda" && isSameDay(i.datetime, today));
    return agendas.length ? "Agenda hari ini:\n" + agendas.map(a => a.title).join("\n") : "Tidak ada agenda hari ini.";
  }

  // Tugas besok / Ada tugas besok / Besok ada tugas / Deadline besok
  if (
    lowerQuery.includes("ada tugas apa besok?") ||
    lowerQuery.includes("besok ada tugas apa?") ||
    lowerQuery.includes("tugas besok") ||
    lowerQuery.includes("ada tugas besok") ||
    lowerQuery.includes("besok ada tugas") ||
    lowerQuery.includes("deadline besok")
  ) {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const tasks = agendaItems.filter(i => i.type === "task" && isSameDay(i.datetime, tomorrow));
    return tasks.length ? "Tugas besok:\n" + tasks.map(t => t.title).join("\n") : "Tidak ada tugas besok.";
  }

  // Ujian besok / Ada ujian besok / Besok ada ujian
  if (
    lowerQuery.includes("ada ujian apa besok?") ||
    lowerQuery.includes("besok ada ujian apa?") ||
    lowerQuery.includes("ujian besok") ||
    lowerQuery.includes("ada ujian besok") ||
    lowerQuery.includes("besok ada ujian")
  ) {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const exams = agendaItems.filter(i => i.type === "exam" && isSameDay(i.datetime, tomorrow));
    return exams.length ? "Ujian besok:\n" + exams.map(e => e.title).join("\n") : "Tidak ada ujian besok.";
  }

  // Agenda besok / Acara besok / Ada agenda besok / Besok ada agenda
  if (
    lowerQuery.includes("ada agenda apa besok?") ||
    lowerQuery.includes("besok ada agenda apa?") ||
    lowerQuery.includes("besok ada acara apa?") ||
    lowerQuery.includes("agenda besok") ||
    lowerQuery.includes("acara besok") ||
    lowerQuery.includes("ada agenda besok") ||
    lowerQuery.includes("besok ada agenda")
  ) {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const agendas = agendaItems.filter(i => i.type === "agenda" && isSameDay(i.datetime, tomorrow));
    return agendas.length ? "Agenda besok:\n" + agendas.map(a => a.title).join("\n") : "Tidak ada agenda besok.";
  }

  // Tugas minggu ini / Ada tugas minggu ini / Minggu ini ada tugas / Deadline minggu ini
  if (
    lowerQuery.includes("minggu ini ada tugas apa?") ||
    lowerQuery.includes("tugas minggu ini apa?") ||
    lowerQuery.includes("tugas minggu ini") ||
    lowerQuery.includes("ada tugas minggu ini") ||
    lowerQuery.includes("minggu ini ada tugas") ||
    lowerQuery.includes("deadline minggu ini")
  ) {
    const today = new Date();
    const endOfWeek = new Date(); endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
    const tasks = agendaItems.filter(i => i.type === "task" && i.datetime >= today && i.datetime <= endOfWeek);
    return tasks.length ? "Tugas minggu ini:\n" + tasks.map(t => t.title).join("\n") : "Tidak ada tugas minggu ini.";
  }

  // Ujian minggu ini / Ada ujian minggu ini / Minggu ini ada ujian
  if (
    lowerQuery.includes("minggu ini ada ujian apa?") ||
    lowerQuery.includes("ujian minggu ini apa?") ||
    lowerQuery.includes("ujian minggu ini") ||
    lowerQuery.includes("ada ujian minggu ini") ||
    lowerQuery.includes("minggu ini ada ujian")
  ) {
    const today = new Date();
    const endOfWeek = new Date(); endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
    const exams = agendaItems.filter(i => i.type === "exam" && i.datetime >= today && i.datetime <= endOfWeek);
    return exams.length ? "Ujian minggu ini:\n" + exams.map(e => e.title).join("\n") : "Tidak ada ujian minggu ini.";
  }

  // Agenda minggu ini / Acara minggu ini / Ada agenda minggu ini / Minggu ini ada agenda
  if (
    lowerQuery.includes("minggu ini ada acara apa?") ||
    lowerQuery.includes("minggu ini ada agenda apa?") ||
    lowerQuery.includes("acara minggu ini apa?") ||
    lowerQuery.includes("agenda minggu ini apa?") ||
    lowerQuery.includes("agenda minggu ini") ||
    lowerQuery.includes("acara minggu ini") ||
    lowerQuery.includes("ada agenda minggu ini") ||
    lowerQuery.includes("minggu ini ada agenda")
  ) {
    const today = new Date();
    const endOfWeek = new Date(); endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
    const agendas = agendaItems.filter(i => i.type === "agenda" && i.datetime >= today && i.datetime <= endOfWeek);
    return agendas.length ? "Agenda minggu ini:\n" + agendas.map(a => a.title).join("\n") : "Tidak ada agenda minggu ini.";
  }

  // Tugas belum selesai
  if (lowerQuery.includes("tugas belum selesai") || lowerQuery.includes("daftar tugas")) {
    const tasks = agendaItems.filter(i => i.type === "task" && !i.completed);
    return tasks.length ? "Tugas belum selesai:\n" + tasks.map(t => t.title).join("\n") : "Tidak ada tugas belum selesai.";
  }
  // Agenda belum selesai
  if (lowerQuery.includes("agenda belum selesai")) {
    const agendas = agendaItems.filter(i => i.type === "agenda" && !i.completed);
    return agendas.length ? "Agenda belum selesai:\n" + agendas.map(a => a.title).join("\n") : "Tidak ada agenda belum selesai.";
  }
  // Ujian belum selesai
  if (lowerQuery.includes("ujian belum selesai")) {
    const exams = agendaItems.filter(i => i.type === "exam" && !i.completed);
    return exams.length ? "Ujian belum selesai:\n" + exams.map(e => e.title).join("\n") : "Tidak ada ujian belum selesai.";
  }

  // Jawaban statis
  if (lowerQuery.includes("fitur aplikasi")) { return "Fitur: Tambah tugas, ujian, agenda, notifikasi, kalender, dan asisten AI."; }
  if (lowerQuery.includes("cara tambah tugas")) { return "Klik 'Tambah Tugas Baru', isi form, lalu klik 'Tambah Tugas'."; }
  if (lowerQuery.includes("cara tambah agenda")) { return "Isi form 'Tambah Agenda Baru' lalu tekan tombolnya."; }
  if (lowerQuery.includes("cara tambah ujian")) { return "Isi form 'Tambah Jadwal Ujian', pilih jenis ujian, lalu simpan."; }
  if (lowerQuery.includes("siapa kamu")) { return "Saya asisten AI lokal, siap membantu agenda dan tugas kamu."; }
  if (lowerQuery.includes("terima kasih") || lowerQuery.includes("makasih")) { return "Sama-sama! Senang bisa membantu."; }

  // Default
  return "Maaf, saya belum mengerti pertanyaan kamu atau data yang kamu maksud belum ada. Silakan tanya tentang tugas, agenda, ujian, atau fitur aplikasi.";
}

// Event listener input
document.getElementById("ask-assistant-btn").addEventListener("click", ()=>{
  const query = document.getElementById("assistant-query").value;
  const responseBox = document.getElementById("assistant-response");
  const answer = askAssistant(query);
  responseBox.innerHTML = answer.replace(/\n/g,"<br>");
});

// =======================
// Init
// =======================
renderAgenda();
updateNotifications();
updateSummary();
renderCalendar(currentMonth, currentYear);