import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IconChevronRight } from "@tabler/icons-react";
import { getArchivedSemesters } from "../lib/semesterUtils.js";
import "./ArchivePage.css";

export default function ArchivePage() {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await getArchivedSemesters();
      if (!cancelled) { setSemesters(list); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="archive-page">
      <div className="eyebrow archive-eyebrow">Past Semesters</div>
      <h1 className="archive-title">Semester Archive</h1>
      <p className="archive-sub">Read-only, browsable reference from previous semesters — nothing here ever gets overwritten.</p>

      {loading ? (
        <div className="archive-empty">Loading…</div>
      ) : semesters.length === 0 ? (
        <div className="archive-empty">No archived semesters yet — this fills in automatically once a new semester starts.</div>
      ) : (
        <div className="archive-list">
          {semesters.map((s) => (
            <Link to={`/archive/${s.id}`} className="archive-card" key={s.id}>
              <div className="badge archive-card-number">Sem {s.number}</div>
              <div className="archive-card-title">{s.title}</div>
              <IconChevronRight size={16} stroke={1.75} className="archive-card-arrow" />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
