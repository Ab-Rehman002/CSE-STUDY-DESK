import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { IconClipboardList, IconFolder, IconSparkles, IconFolderOpen, IconMessageCircle, IconArchive, IconArrowLeft } from "@tabler/icons-react";
import CountdownHero from "../components/CountdownHero.jsx";
import MaterialLink from "../components/MaterialLink.jsx";
import CommunityPanel from "../components/CommunityPanel.jsx";
import { getDocData } from "../lib/storage.js";
import { getCurrentSemesterId } from "../lib/semesterUtils.js";
import "./CourseDetailPage.css";

export default function CourseDetailPage() {
  const { id, semesterId: semesterIdParam } = useParams();
  const location = useLocation();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(location.state?.tab || "syllabus");
  const [isArchived, setIsArchived] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setTab(location.state?.tab || "syllabus");
    setLoading(true);
    (async () => {
      const semId = semesterIdParam || (await getCurrentSemesterId());
      const data = await getDocData(`courses-${semId}`, id);
      if (cancelled) return;
      setCourse(data ? { id, ...data } : null);
      setIsArchived(Boolean(semesterIdParam));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id, semesterIdParam, location.state]);

  const tabs = useMemo(() => {
    if (!course) return [];
    const list = [
      { key: "syllabus", label: "Syllabus", icon: IconClipboardList },
      { key: "materials", label: `Materials (${(course.materials || []).length})`, icon: IconFolder },
    ];
    if (course.bonusMaterials && course.bonusMaterials.length > 0) list.push({ key: "bonus", label: "Bonus", icon: IconSparkles });
    if (course.labAnswers && course.labAnswers.length > 0) list.push({ key: "labfiles", label: `Lab Files (${course.labAnswers.length})`, icon: IconFolderOpen });
    if (!isArchived) list.push({ key: "community", label: "Community", icon: IconMessageCircle });
    return list;
  }, [course, isArchived]);

  if (loading) return <main className="course-detail-page"><div className="course-detail-loading">Loading…</div></main>;

  if (!course) {
    return (
      <main className="course-detail-page">
        <Link to={isArchived ? `/archive/${semesterIdParam}` : "/"} className="course-detail-back"><IconArrowLeft size={14} stroke={2} /> Back</Link>
        <div className="course-detail-notfound">Course not found.</div>
      </main>
    );
  }

  return (
    <main className="course-detail-page">
      <Link to={isArchived ? `/archive/${semesterIdParam}` : "/"} className="course-detail-back">
        <IconArrowLeft size={14} stroke={2} /> Back to {isArchived ? "Semester" : "Home"}
      </Link>

      {isArchived && <div className="archived-banner"><IconArchive size={15} stroke={1.75} /> Archived semester — content is read-only for reference.</div>}

      <div className="course-detail-header">
        <div className="course-detail-titlerow">
          <div>
            <div className="course-detail-code">{course.code ? `${course.code} · ` : ""}{course.credits} Credits</div>
            <h1 className="course-detail-title" style={{ color: course.color }}>{course.subject}</h1>
          </div>
          <span className="badge course-detail-typebadge" style={{ background: `${course.color}20`, color: course.color }}>
            {course.type === "lab" ? "Lab" : "Theory"}
          </span>
        </div>
      </div>

      {!isArchived && <CountdownHero course={course} />}

      <div className="tab-row course-detail-tabs">
        {tabs.map((t) => {
          const TabIcon = t.icon;
          return (
            <button key={t.key} className={`tab-row-btn ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
              <TabIcon size={15} stroke={1.75} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="course-detail-panel">
        {tab === "syllabus" && (
          <>
            {(course.syllabus || []).length === 0 ? (
              <div className="course-detail-empty">Syllabus not announced yet — check back soon.</div>
            ) : (
              <ul className="course-detail-syllabus">
                {course.syllabus.map((item, i) => <li key={i}><span className="syllabus-dot" style={{ background: course.color }} />{item}</li>)}
              </ul>
            )}
            {course.note && <div className="course-detail-note" style={{ borderLeftColor: course.color }}>{course.note}</div>}
          </>
        )}

        {tab === "materials" && (
          <div className="course-detail-materials">
            {(course.materials || []).length === 0 ? <div className="course-detail-empty">No materials uploaded yet.</div> : course.materials.map((m, i) => <MaterialLink key={i} material={m} />)}
          </div>
        )}

        {tab === "bonus" && (
          <div className="course-detail-materials">
            <div className="course-detail-bonus-callout">
              <IconSparkles size={16} stroke={1.75} />
              <div><div className="bonus-callout-title">Additional Notes</div><div className="bonus-callout-sub">Prepared separately — not part of official class materials</div></div>
            </div>
            {course.bonusMaterials.map((m, i) => <MaterialLink key={i} material={m} variant="bonus" />)}
          </div>
        )}

        {tab === "labfiles" && (
          <div className="course-detail-materials">
            <div className="course-detail-bonus-callout">
              <IconFolderOpen size={16} stroke={1.75} />
              <div><div className="bonus-callout-title">Lab File Answers</div><div className="bonus-callout-sub">Completed answer files for all lab sessions</div></div>
            </div>
            {course.labAnswers.map((m, i) => <MaterialLink key={i} material={m} variant="lab" />)}
          </div>
        )}

        {tab === "community" && !isArchived && <CommunityPanel courseId={course.id} />}
      </div>
    </main>
  );
}
