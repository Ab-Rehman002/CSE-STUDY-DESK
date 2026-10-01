import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { IconArchive, IconArrowLeft } from "@tabler/icons-react";
import CourseCard from "../components/CourseCard.jsx";
import { getSemesterCourses } from "../lib/semesterUtils.js";
import { getDocData } from "../lib/storage.js";
import "./ArchiveSemesterPage.css";

const TABS = [
  { key: "all", label: "All" },
  { key: "theory", label: "Theory" },
  { key: "lab", label: "Labs" },
];

export default function ArchiveSemesterPage() {
  const { semesterId } = useParams();
  const [semester, setSemester] = useState(null);
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const [sem, courseList] = await Promise.all([getDocData("semesters", semesterId), getSemesterCourses(semesterId)]);
      if (cancelled) return;
      setSemester(sem ? { id: semesterId, ...sem } : { id: semesterId, title: semesterId });
      setCourses(courseList);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [semesterId]);

  const filtered = useMemo(() => (filter === "all" ? courses : courses.filter((c) => c.type === filter)), [courses, filter]);
  const sorted = useMemo(() => [...filtered].sort((a, b) => a.subject.localeCompare(b.subject)), [filtered]);

  return (
    <main className="archive-sem-page">
      <Link to="/archive" className="archive-sem-back"><IconArrowLeft size={14} stroke={2} /> Back to Archive</Link>

      {loading ? (
        <div className="archive-empty">Loading…</div>
      ) : (
        <>
          <div className="eyebrow archive-sem-eyebrow"><IconArchive size={13} stroke={2} /> Archived</div>
          <h1 className="archive-sem-title">{semester?.title}</h1>

          <div className="tab-row archive-sem-tabs">
            {TABS.map((f) => (
              <button key={f.key} className={`tab-row-btn ${filter === f.key ? "active" : ""}`} onClick={() => setFilter(f.key)}>
                {f.label}
              </button>
            ))}
          </div>

          <div className="course-grid">
            {sorted.map((course) => <CourseCard key={course.id} course={course} basePath={`/archive/${semesterId}/course`} />)}
          </div>

          {sorted.length === 0 && <div className="archive-empty">No courses recorded for this semester.</div>}
        </>
      )}
    </main>
  );
}
