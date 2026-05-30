// ==============================
// STATE
// ==============================
const state = {
  skills: [],
  languages: [],
  educationCount: 0,
  experienceCount: 0,
};

// ==============================
// INIT
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  addEducation();
  addExperience();
  document.getElementById("cvForm").addEventListener("submit", handleSubmit);
});

// ==============================
// DYNAMIC ENTRIES — EDUCATION
// ==============================
function addEducation() {
  const id = state.educationCount++;
  const list = document.getElementById("educationList");
  const div = document.createElement("div");
  div.className = "entry-card";
  div.id = `edu-${id}`;
  div.innerHTML = `
    <button type="button" class="btn-remove" onclick="removeEntry('edu-${id}')" title="Supprimer">
      <i class="fa-solid fa-xmark"></i>
    </button>
    <div class="entry-grid">
      <div class="field">
        <label>Diplôme / Titre</label>
        <input type="text" name="edu_degree_${id}" placeholder="Ex: Licence en Informatique, Master GLSI" />
      </div>
      <div class="field">
        <label>École / Université</label>
        <input type="text" name="edu_school_${id}" placeholder="Ex: ESPRIT, FST, INSAT, ENSI" />
      </div>
      <div class="field">
        <label>Année / Période</label>
        <input type="text" name="edu_year_${id}" placeholder="Ex: 2022 – 2024" />
      </div>
      <div class="field">
        <label>Mention / Note</label>
        <input type="text" name="edu_grade_${id}" placeholder="Ex: Mention Bien" />
      </div>
    </div>
  `;
  list.appendChild(div);
}

// ==============================
// DYNAMIC ENTRIES — EXPERIENCE
// ==============================
function addExperience() {
  const id = state.experienceCount++;
  const list = document.getElementById("experienceList");
  const div = document.createElement("div");
  div.className = "entry-card";
  div.id = `exp-${id}`;
  div.innerHTML = `
    <button type="button" class="btn-remove" onclick="removeEntry('exp-${id}')" title="Supprimer">
      <i class="fa-solid fa-xmark"></i>
    </button>
    <div class="entry-grid">
      <div class="field">
        <label>Intitulé du poste</label>
        <input type="text" name="exp_title_${id}" placeholder="Ex: Développeuse Web Junior, Ingénieure Logiciel" />
      </div>
      <div class="field">
        <label>Entreprise</label>
        <input type="text" name="exp_company_${id}" placeholder="Ex: Vermeg, Telnet, Softline" />
      </div>
      <div class="field">
        <label>Période</label>
        <input type="text" name="exp_period_${id}" placeholder="Ex: Jan 2023 – Juin 2024" />
      </div>
      <div class="field">
        <label>Type</label>
        <select name="exp_type_${id}">
          <option value="CDI">CDI</option>
          <option value="CDD">CDD</option>
          <option value="Stage">Stage</option>
          <option value="Alternance">Alternance</option>
          <option value="Freelance">Freelance</option>
          <option value="Bénévolat">Bénévolat</option>
        </select>
      </div>
      <div class="field full-width">
        <label>Description des missions</label>
        <textarea name="exp_desc_${id}" rows="2" placeholder="Décris tes missions et réalisations principales..."></textarea>
      </div>
    </div>
  `;
  list.appendChild(div);
}

function removeEntry(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ==============================
// TAGS INPUT
// ==============================
function addTag(event, type) {
  if (event.key !== "Enter" && event.key !== ",") return;
  event.preventDefault();

  const inputId = type === "skills" ? "skillInput" : "languageInput";
  const input = document.getElementById(inputId);
  const value = input.value.trim().replace(/,$/, "");
  if (!value) return;

  state[type].push(value);
  renderTags(type);
  input.value = "";
  updateHiddenInputs(type);
}

function removeTag(type, index) {
  state[type].splice(index, 1);
  renderTags(type);
  updateHiddenInputs(type);
}

function renderTags(type) {
  const listId = type === "skills" ? "skillsList" : "languagesList";
  const list = document.getElementById(listId);
  list.innerHTML = state[type]
    .map(
      (tag, i) =>
        `<span class="tag">${escapeHtml(tag)}
          <button type="button" onclick="removeTag('${type}', ${i})" title="Supprimer">&times;</button>
        </span>`
    )
    .join("");
}

function updateHiddenInputs(type) {
  const hiddenId = type === "skills" ? "skillsHidden" : "languagesHidden";
  document.getElementById(hiddenId).value = JSON.stringify(state[type]);
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ==============================
// COLLECT FORM DATA
// ==============================
function collectFormData() {
  const get = (id) => (document.getElementById(id)?.value || "").trim();

  const education = [];
  document.querySelectorAll('[id^="edu-"]').forEach((el) => {
    const id = el.id.replace("edu-", "");
    const degree = el.querySelector(`[name="edu_degree_${id}"]`)?.value.trim();
    if (degree) {
      education.push({
        degree,
        school: el.querySelector(`[name="edu_school_${id}"]`)?.value.trim() || "",
        year: el.querySelector(`[name="edu_year_${id}"]`)?.value.trim() || "",
        grade: el.querySelector(`[name="edu_grade_${id}"]`)?.value.trim() || "",
      });
    }
  });

  const experience = [];
  document.querySelectorAll('[id^="exp-"]').forEach((el) => {
    const id = el.id.replace("exp-", "");
    const title = el.querySelector(`[name="exp_title_${id}"]`)?.value.trim();
    if (title) {
      experience.push({
        title,
        company: el.querySelector(`[name="exp_company_${id}"]`)?.value.trim() || "",
        period: el.querySelector(`[name="exp_period_${id}"]`)?.value.trim() || "",
        type: el.querySelector(`[name="exp_type_${id}"]`)?.value || "",
        description: el.querySelector(`[name="exp_desc_${id}"]`)?.value.trim() || "",
      });
    }
  });

  return {
    name: get("name"),
    email: get("email"),
    phone: get("phone"),
    city: get("city"),
    linkedin: get("linkedin"),
    portfolio: get("portfolio"),
    target_job: get("target_job"),
    company: get("company"),
    job_description: get("job_description"),
    education,
    experience,
    skills: state.skills,
    languages: state.languages,
    interests: get("interests"),
  };
}

// ==============================
// SUBMIT
// ==============================
async function handleSubmit(e) {
  e.preventDefault();

  const data = collectFormData();
  if (!data.name || !data.target_job) {
    alert("Veuillez renseigner au minimum votre nom et le poste visé.");
    return;
  }

  showLoader(true);
  document.getElementById("generateBtn").disabled = true;

  try {
    const res = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!json.success) {
      throw new Error(json.error || "Erreur inconnue");
    }

    renderResults(json.profile, json.cv, json.cover_letter);
    showResults();
  } catch (err) {
    alert("Erreur : " + err.message);
  } finally {
    showLoader(false);
    document.getElementById("generateBtn").disabled = false;
  }
}

// ==============================
// RENDER RESULTS
// ==============================
function renderResults(profile, cv, coverLetter) {
  renderCV(profile, cv);
  renderLetter(coverLetter);
}

function renderCV(p, cv) {
  const contacts = [
    p.email && `<span><i class="fa-solid fa-envelope"></i> ${escapeHtml(p.email)}</span>`,
    p.phone && `<span><i class="fa-solid fa-phone"></i> ${escapeHtml(p.phone)}</span>`,
    p.city && `<span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(p.city)}</span>`,
    p.linkedin && `<span><i class="fa-brands fa-linkedin"></i> ${escapeHtml(p.linkedin)}</span>`,
    p.portfolio && `<span><i class="fa-solid fa-globe"></i> ${escapeHtml(p.portfolio)}</span>`,
  ]
    .filter(Boolean)
    .join("");

  const experiences = cv.enhanced_experiences && cv.enhanced_experiences.length
    ? cv.enhanced_experiences
    : p.experience;

  const expHtml = (experiences || [])
    .map(
      (exp) => `
      <div class="cv-entry">
        <div class="cv-entry-title">${escapeHtml(exp.title || "")}</div>
        <div class="cv-entry-meta">${escapeHtml(exp.company || "")}${exp.period ? " · " + escapeHtml(exp.period) : ""}</div>
        <div class="cv-entry-desc">${escapeHtml(exp.description || "")}</div>
      </div>`
    )
    .join("") || "<p style='color:#9ca3af;font-size:.85rem'>Aucune expérience renseignée</p>";

  const eduHtml = (p.education || [])
    .map(
      (edu) => `
      <div class="cv-entry">
        <div class="cv-entry-title">${escapeHtml(edu.degree || "")}</div>
        <div class="cv-entry-meta">${escapeHtml(edu.school || "")}${edu.year ? " · " + escapeHtml(edu.year) : ""}</div>
        ${edu.grade ? `<div class="cv-entry-desc">${escapeHtml(edu.grade)}</div>` : ""}
      </div>`
    )
    .join("") || "<p style='color:#9ca3af;font-size:.85rem'>Aucune formation renseignée</p>";

  const skillsHtml = (p.skills || []).length
    ? p.skills.map((s) => `<span class="cv-tag">${escapeHtml(s)}</span>`).join("")
    : "<p style='color:#9ca3af;font-size:.85rem'>Aucune compétence renseignée</p>";

  const langsHtml = (p.languages || []).length
    ? p.languages.map((l) => `<div class="cv-lang-item"><span>${escapeHtml(l)}</span></div>`).join("")
    : "<p style='color:#9ca3af;font-size:.85rem'>Aucune langue renseignée</p>";

  const interestsHtml = p.interests
    ? `<div class="cv-section">
        <div class="cv-section-title">Centres d'intérêt</div>
        <p style="font-size:.875rem;color:#4b5563">${escapeHtml(p.interests)}</p>
      </div>`
    : "";

  document.getElementById("cvPreview").innerHTML = `
    <div class="cv-top">
      <div class="cv-name">${escapeHtml(p.name || "")}</div>
      <div class="cv-job-title">${escapeHtml(p.target_job || "")}</div>
      <div class="cv-contacts">${contacts}</div>
    </div>
    <div class="cv-body">
      <div class="cv-main">
        <div class="cv-section">
          <div class="cv-section-title">Profil</div>
          <p class="cv-summary">${escapeHtml(cv.summary || "")}</p>
        </div>
        <div class="cv-section">
          <div class="cv-section-title">Expériences professionnelles</div>
          ${expHtml}
        </div>
        <div class="cv-section">
          <div class="cv-section-title">Formation</div>
          ${eduHtml}
        </div>
      </div>
      <div class="cv-sidebar">
        <div class="cv-section">
          <div class="cv-section-title">Compétences</div>
          ${skillsHtml}
        </div>
        <div class="cv-section">
          <div class="cv-section-title">Langues</div>
          ${langsHtml}
        </div>
        ${interestsHtml}
      </div>
    </div>
  `;
}

function renderLetter(text) {
  document.getElementById("letterPreview").textContent = text;
}

// ==============================
// TABS
// ==============================
function switchTab(name, btn) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach((t) => t.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById(`tab-${name}`).classList.add("active");
}

// ==============================
// UI HELPERS
// ==============================
function showLoader(on) {
  const el = document.getElementById("loaderOverlay");
  el.classList.toggle("active", on);
}

function showResults() {
  document.getElementById("resultsSection").classList.add("active");
  document.getElementById("resultsSection").scrollIntoView({ behavior: "smooth" });
}

function resetForm() {
  document.getElementById("resultsSection").classList.remove("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function printCV() {
  const content = document.getElementById("cvPreview").innerHTML;
  const win = window.open("", "_blank");
  win.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8"/>
      <title>CV</title>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet"/>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Inter',sans-serif;font-size:14px;color:#1f2937}
        .cv-top{background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;padding:28px 36px}
        .cv-name{font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:700;margin-bottom:4px}
        .cv-job-title{font-size:1rem;opacity:.9;margin-bottom:12px}
        .cv-contacts{display:flex;flex-wrap:wrap;gap:12px;font-size:.8rem}
        .cv-contacts span{display:flex;align-items:center;gap:4px;opacity:.9}
        .cv-body{display:grid;grid-template-columns:2fr 1fr}
        .cv-main{padding:24px 28px;border-right:1px solid #e5e7eb}
        .cv-sidebar{padding:24px 20px;background:#f9fafb}
        .cv-section{margin-bottom:20px}
        .cv-section-title{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#2563eb;border-bottom:2px solid #2563eb;padding-bottom:5px;margin-bottom:10px}
        .cv-entry{margin-bottom:12px}
        .cv-entry-title{font-size:.9rem;font-weight:600}
        .cv-entry-meta{font-size:.78rem;color:#2563eb;font-weight:500;margin-bottom:3px}
        .cv-entry-desc{font-size:.82rem;color:#4b5563;line-height:1.5}
        .cv-summary{font-size:.85rem;line-height:1.65;color:#4b5563}
        .cv-tag{display:inline-block;padding:2px 8px;margin:2px 2px 0 0;background:#eff6ff;color:#1d4ed8;border-radius:20px;font-size:.72rem;font-weight:500}
        .cv-lang-item{display:flex;justify-content:space-between;font-size:.82rem;padding:4px 0;border-bottom:1px dotted #e5e7eb;color:#374151}
        @page{margin:10mm}
      </style>
    </head>
    <body>${content}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}
