import { useState, useEffect, useMemo } from "react";
import CountdownHero from "../components/CountdownHero.jsx";
import CourseRow from "../components/CourseRow.jsx";
import TimelinePanel from "../components/TimelinePanel.jsx";
import NoticeBanner from "../components/NoticeBanner.jsx";
import { getAllDocs } from "../lib/storage.js";
import { getCountdown, parseDate } from "../lib/dateHelpers.js";
import { getCurrentSemester, getSemesterCourses } from "../lib/semesterUtils.js";
import "./HomePage.css";

const TABS = [
  { key: "all", label: "All" },
  { key: "theory", label: "Theory" },
  { key: "lab", label: "Lab" },
];

export default function HomePage() {
  const [semester, setSemester] = useState(null);
  const [courses, setCourses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sem = await getCurrentSemester();
      const [courseList, noticeData] = await Promise.all([getSemesterCourses(sem.id), getAllDocs("notices")]);
      if (cancelled) return;

      setSemester(sem);
      setCourses(courseList);

      const noticeList = Object.entries(noticeData)
        .map(([id, value]) => ({ id, ...value }))
        .filter((n) => n.active !== false)
        .sort((a, b) => (b.ts || 0) - (a.ts || 0));
      setNotices(noticeList);

      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => (filter === "all" ? courses : courses.filter((c) => c.type === filter)), [courses, filter]);

  const nextCourse = useMemo(() => {
    return [...courses].filter((c) => c.date).sort((a, b) => parseDate(a.date) - parseDate(b.date)).find((c) => getCountdown(c.date, c.time)) || null;
  }, [courses]);

  const groups = useMemo(() => {
    const upcoming = [];
    const completed = [];
    const unscheduled = [];
    filtered.forEach((c) => {
      if (!c.date) unscheduled.push(c);
      else if (getCountdown(c.date, c.time)) upcoming.push(c);
      else completed.push(c);
    });
    upcoming.sort((a, b) => parseDate(a.date) - parseDate(b.date));
    completed.sort((a, b) => parseDate(b.date) - parseDate(a.date));
    unscheduled.sort((a, b) => a.subject.localeCompare(b.subject));
    return { upcoming, completed, unscheduled };
  }, [filtered]);

  const isEmpty = !loading && groups.upcoming.length === 0 && groups.completed.length === 0 && groups.unscheduled.length === 0;

  return (
    <main className="home-page">
      {semester && <div className="eyebrow home-semester">{semester.title}</div>}
      <CountdownHero course={nextCourse} />
      <NoticeBanner notices={notices} />

      <div className="home-grid">
        <section className="panel home-overview" data-cursor-exclude>
          <div className="panel-header">
            <span className="eyebrow">Course Overview</span>
            <div className="tab-row home-tabs">
              {TABS.map((t) => (
                <button key={t.key} className={`tab-row-btn ${filter === t.key ? "active" : ""}`} onClick={() => setFilter(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-body">
            {loading && <div className="home-loading">Loading courses…</div>}

            {groups.upcoming.length > 0 && (
              <div className="home-group">
                <div className="eyebrow home-group-heading">Upcoming</div>
                {groups.upcoming.map((c) => <CourseRow key={c.id} course={c} />)}
              </div>
            )}
            {groups.unscheduled.length > 0 && (
              <div className="home-group">
                <div className="eyebrow home-group-heading">Not scheduled</div>
                {groups.unscheduled.map((c) => <CourseRow key={c.id} course={c} />)}
              </div>
            )}
            {groups.completed.length > 0 && (
              <div className="home-group">
                <div className="eyebrow home-group-heading">Completed</div>
                {groups.completed.map((c) => <CourseRow key={c.id} course={c} />)}
              </div>
            )}

            {isEmpty && <div className="home-empty">No courses in this view yet.</div>}
          </div>
        </section>

        <TimelinePanel courses={courses} />
      </div>
    </main>
  );
}
