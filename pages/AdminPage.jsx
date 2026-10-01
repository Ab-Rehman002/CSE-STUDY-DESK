import { useState, useEffect, useCallback } from "react";
import {
  IconShieldLock, IconPinned, IconBooks, IconCalendarEvent, IconAlertTriangle, IconLogout2,
} from "@tabler/icons-react";
import { useAdmin } from "../components/AdminContext.jsx";
import MaterialListEditor from "../components/MaterialListEditor.jsx";
import { getAllDocs, setDocData, deleteDocData } from "../lib/storage.js";
import { slugify } from "../lib/courseUtils.js";
import { shortDay } from "../lib/dateHelpers.js";
import { getCurrentSemesterId, getCurrentSemester, getSemesterCourses, archiveAndStartNewSemester } from "../lib/semesterUtils.js";
import "./AdminPage.css";

const PALETTE = [
  { name: "Window Blue", value: "#64798c" },
  { name: "Blue Light", value: "#8fa5b8" },
  { name: "Lamp Gold", value: "#d9a35c" },
  { name: "Gold Glow", value: "#f0c98a" },
  { name: "Sage", value: "#8a9a7e" },
  { name: "Terracotta", value: "#b5674a" },
];

const MAX = { notice: 300, subject: 100, code: 20, credits: 10, time: 20, note: 500, syllabus: 6000, courseName: 100, semesterTitle: 60 };

function AdminLogin() {
  const { login } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const ok = await login(email, password);
    if (!ok) setError("Incorrect email or password");
    setLoading(false);
  };

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <IconShieldLock size={28} stroke={1.5} className="admin-login-icon" />
        <div className="admin-login-title">Management Console</div>
        <div className="admin-login-sub">Log in to manage notices, courses, and semesters.</div>
        <input type="email" className="admin-login-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        <input type="password" className="admin-login-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div className="admin-login-error">{error}</div>}
        <button type="submit" className="admin-login-btn" disabled={loading}>{loading ? "Logging in…" : "Log In"}</button>
      </form>
    </div>
  );
}

function NoticesManager() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getAllDocs("notices");
    setNotices(Object.entries(data).map(([id, value]) => ({ id, ...value })).sort((a, b) => (b.ts || 0) - (a.ts || 0)));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    const t = text.trim().slice(0, MAX.notice);
    if (!t) return;
    setSaving(true);
    await setDocData("notices", `n-${Date.now()}`, { text: t, active: true, ts: Date.now() });
    setText("");
    await load();
    setSaving(false);
  };

  const toggleActive = async (n) => { await setDocData("notices", n.id, { ...n, active: !n.active }); await load(); };
  const handleDelete = async (id) => { await deleteDocData("notices", id); await load(); };

  return (
    <div className="admin-panel">
      <div className="admin-panel-title"><IconPinned size={16} stroke={1.75} /> Notice Banner</div>
      <div className="admin-panel-sub">Shows at the top of Home for everyone.</div>
      <div className="admin-notice-form">
        <input className="admin-input" placeholder="Write a notice…" maxLength={MAX.notice} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }} />
        <button className="admin-btn" onClick={handleAdd} disabled={saving}>{saving ? "Posting…" : "+ Post"}</button>
      </div>
      {loading ? <div className="admin-empty">Loading…</div> : notices.length === 0 ? <div className="admin-empty">No notices yet.</div> : (
        <div className="admin-notice-list">
          {notices.map((n) => (
            <div className={`admin-notice-row ${n.active ? "" : "admin-notice-inactive"}`} key={n.id}>
              <span className="admin-notice-text">{n.text}</span>
              <div className="admin-notice-actions">
                <button className="admin-notice-toggle" onClick={() => toggleActive(n)}>{n.active ? "Hide" : "Show"}</button>
                <button className="admin-notice-delete" onClick={() => handleDelete(n.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CourseEditor({ course, semesterId, onSaved }) {
  const [form, setForm] = useState(() => ({
    ...course,
    syllabusText: (course.syllabus || []).join("\n"),
    materials: course.materials || [],
    bonusMaterials: course.bonusMaterials || null,
    labAnswers: course.labAnswers || null,
  }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const payload = {
      type: form.type, code: (form.code || "").slice(0, MAX.code), subject: form.subject.slice(0, MAX.subject), credits: (form.credits || "").slice(0, MAX.credits),
      date: form.date || null, fullDay: form.date ? shortDay(form.date) : null, time: (form.time || "").slice(0, MAX.time) || null,
      color: form.color, syllabus: form.syllabusText.slice(0, MAX.syllabus).split("\n").map((s) => s.trim()).filter(Boolean),
      note: (form.note || "").slice(0, MAX.note) || null, materials: form.materials, bonusMaterials: form.bonusMaterials, labAnswers: form.labAnswers,
    };
    try {
      await setDocData(`courses-${semesterId}`, course.id, payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved();
    } catch (err) {
      console.error(err);
      setError("Save failed — check the browser console for details.");
    }
    setSaving(false);
  };

  return (
    <div className="course-editor">
      <div className="course-editor-row">
        <div className="course-editor-field"><label>Subject Name</label><input className="admin-input" maxLength={MAX.subject} value={form.subject} onChange={(e) => set("subject", e.target.value)} /></div>
        <div className="course-editor-field course-editor-field-sm">
          <label>Type</label>
          <select className="admin-input" value={form.type} onChange={(e) => set("type", e.target.value)}>
            <option value="theory">Theory</option><option value="lab">Lab</option>
          </select>
        </div>
      </div>
      <div className="course-editor-row">
        <div className="course-editor-field course-editor-field-sm"><label>Course Code</label><input className="admin-input" maxLength={MAX.code} value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="CSE-2104" /></div>
        <div className="course-editor-field course-editor-field-sm"><label>Credits</label><input className="admin-input" maxLength={MAX.credits} value={form.credits} onChange={(e) => set("credits", e.target.value)} placeholder="3+1" /></div>
      </div>
      <div className="course-editor-row">
        <div className="course-editor-field course-editor-field-sm"><label>Exam Date</label><input type="date" className="admin-input" value={form.date || ""} onChange={(e) => set("date", e.target.value)} /></div>
        <div className="course-editor-field course-editor-field-sm"><label>Exam Time</label><input className="admin-input" maxLength={MAX.time} value={form.time || ""} onChange={(e) => set("time", e.target.value)} placeholder="10:00 AM" /></div>
      </div>
      <div className="course-editor-field">
        <label>Accent Color</label>
        <div className="color-swatches">
          {PALETTE.map((p) => (
            <button key={p.value} type="button" title={p.name} className={`color-swatch ${form.color === p.value ? "color-swatch-active" : ""}`} style={{ background: p.value }} onClick={() => set("color", p.value)} />
          ))}
        </div>
      </div>
      <div className="course-editor-field"><label>Syllabus (one item per line)</label><textarea className="admin-textarea" rows={5} maxLength={MAX.syllabus} value={form.syllabusText} onChange={(e) => set("syllabusText", e.target.value)} /></div>
      <div className="course-editor-field"><label>Note (optional callout)</label><textarea className="admin-textarea" rows={2} maxLength={MAX.note} value={form.note || ""} onChange={(e) => set("note", e.target.value)} /></div>
      <MaterialListEditor label="Materials" items={form.materials} onChange={(v) => set("materials", v)} />
      <div className="course-editor-toggle-row">
        <label className="course-editor-checkbox"><input type="checkbox" checked={!!form.bonusMaterials} onChange={(e) => set("bonusMaterials", e.target.checked ? [] : null)} />Enable Bonus Notes section</label>
      </div>
      {form.bonusMaterials && <MaterialListEditor label="Bonus Materials" items={form.bonusMaterials} onChange={(v) => set("bonusMaterials", v)} />}
      <div className="course-editor-toggle-row">
        <label className="course-editor-checkbox"><input type="checkbox" checked={!!form.labAnswers} onChange={(e) => set("labAnswers", e.target.checked ? [] : null)} />Enable Lab File Answers section</label>
      </div>
      {form.labAnswers && <MaterialListEditor label="Lab Answer Files" items={form.labAnswers} onChange={(v) => set("labAnswers", v)} />}
      <button className="admin-btn admin-btn-save" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : saved ? "Saved" : "Save Course"}</button>
      {error && <div className="admin-login-error">{error}</div>}
    </div>
  );
}

function AddCourseForm({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  return (
    <div className="admin-notice-form" style={{ marginTop: 10 }}>
      <input className="admin-input" placeholder="New course name…" maxLength={MAX.courseName} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      <button className="admin-btn" onClick={() => name.trim() && onAdd(name.trim())}>Add</button>
      <button className="admin-btn" onClick={onCancel}>Cancel</button>
    </div>
  );
}

function CoursesManager() {
  const [semesterId, setSemesterId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const semId = await getCurrentSemesterId();
    setSemesterId(semId);
    setCourses(await getSemesterCourses(semId));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const editingCourse = courses.find((c) => c.id === editingId);

  const handleAddNew = async (subject) => {
    const id = slugify(subject.slice(0, MAX.courseName));
    const blank = { type: "theory", code: "", subject: subject.slice(0, MAX.courseName), credits: "", date: null, fullDay: null, time: null, color: "#64798c", syllabus: [], note: null, materials: [], bonusMaterials: null, labAnswers: null };
    await setDocData(`courses-${semesterId}`, id, blank);
    setAdding(false);
    await load();
    setEditingId(id);
  };

  const handleDeleteCourse = async (id) => {
    await deleteDocData(`courses-${semesterId}`, id);
    if (editingId === id) setEditingId(null);
    await load();
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel-title"><IconBooks size={16} stroke={1.75} /> Courses</div>
      <div className="admin-panel-sub">Click any course to edit its syllabus, materials, and exam date.</div>
      {loading ? <div className="admin-empty">Loading…</div> : (
        <div className="admin-course-list">
          {courses.map((c) => (
            <button key={c.id} className={`admin-course-row ${editingId === c.id ? "admin-course-row-active" : ""}`} onClick={() => setEditingId(editingId === c.id ? null : c.id)}>
              <span className="admin-course-dot" style={{ background: c.color }} />
              <span className="admin-course-name">{c.subject}</span>
              <span className="badge admin-course-badge" style={{ background: `${c.color}20`, color: c.color }}>{c.type === "lab" ? "Lab" : "Theory"}</span>
              <span className="admin-course-date">{c.date || "Date TBA"}</span>
            </button>
          ))}
        </div>
      )}
      {!adding ? <button className="admin-btn" style={{ marginTop: 10 }} onClick={() => setAdding(true)}>+ Add New Course</button> : <AddCourseForm onAdd={handleAddNew} onCancel={() => setAdding(false)} />}
      {editingCourse && (
        <div className="course-editor-wrap">
          <div className="course-editor-header">
            <span>Editing: {editingCourse.subject}</span>
            <button className="admin-course-delete-btn" onClick={() => handleDeleteCourse(editingCourse.id)}>Delete Course</button>
          </div>
          <CourseEditor key={editingCourse.id} course={editingCourse} semesterId={semesterId} onSaved={load} />
        </div>
      )}
    </div>
  );
}

function SemesterManager() {
  const [semester, setSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => { setLoading(true); setSemester(await getCurrentSemester()); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const handleArchive = async () => {
    setWorking(true);
    await archiveAndStartNewSemester(newTitle.slice(0, MAX.semesterTitle));
    setWorking(false);
    setConfirming(false);
    setNewTitle("");
    await load();
  };

  if (loading || !semester) return <div className="admin-panel"><div className="admin-empty">Loading…</div></div>;

  return (
    <div className="admin-panel">
      <div className="admin-panel-title"><IconCalendarEvent size={16} stroke={1.75} /> Semester</div>
      <div className="admin-panel-sub">
        Currently showing courses for <strong>{semester.title}</strong>. When it ends, archive it and start the next — everything currently on the site moves to Archive automatically, nothing gets deleted.
      </div>
      {!confirming ? (
        <button className="admin-btn admin-btn-danger" onClick={() => setConfirming(true)}>Archive "{semester.title}" &amp; Start New Semester</button>
      ) : (
        <div className="semester-confirm-box">
          <div className="semester-confirm-title"><IconAlertTriangle size={15} stroke={1.75} /> This will archive {semester.title}</div>
          <div className="semester-confirm-text">All current courses become read-only under Archive. Home will show a fresh, empty list — you'll add the new semester's courses one by one after this.</div>
          <input className="admin-input" maxLength={MAX.semesterTitle} placeholder={`New semester title (e.g. "Semester ${(semester.number || 3) + 1}")`} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <div className="semester-confirm-actions">
            <button className="admin-btn admin-btn-danger" onClick={handleArchive} disabled={working}>{working ? "Archiving…" : "Yes, Archive & Start New"}</button>
            <button className="admin-btn" onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { isAdmin, logout } = useAdmin();
  const [tab, setTab] = useState("notices");

  if (!isAdmin) return <main className="admin-page"><AdminLogin /></main>;

  return (
    <main className="admin-page">
      <div className="admin-header-row">
        <div><div className="eyebrow admin-page-eyebrow">Class Rep Dashboard</div><h1 className="admin-page-title">Admin</h1></div>
        <button className="admin-logout" onClick={logout}><IconLogout2 size={14} stroke={1.75} /> Log Out</button>
      </div>
      <div className="tab-row admin-tabs">
        <button className={`tab-row-btn ${tab === "notices" ? "active" : ""}`} onClick={() => setTab("notices")}>Notices</button>
        <button className={`tab-row-btn ${tab === "courses" ? "active" : ""}`} onClick={() => setTab("courses")}>Courses</button>
        <button className={`tab-row-btn ${tab === "semester" ? "active" : ""}`} onClick={() => setTab("semester")}>Semester</button>
      </div>
      {tab === "notices" && <NoticesManager />}
      {tab === "courses" && <CoursesManager />}
      {tab === "semester" && <SemesterManager />}
    </main>
  );
}
