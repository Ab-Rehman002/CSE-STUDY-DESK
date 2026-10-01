import { Link } from "react-router-dom";
import { useMemo } from "react";
import { parseDate, shortMonth, dayOfMonth, getCountdown, urgencyColor } from "../lib/dateHelpers.js";
import "./TimelinePanel.css";

// A second view over the same course list HomePage already loaded — no
// extra requests. Upcoming exams by date, plus what's still waiting on a
// timetable.
export default function TimelinePanel({ courses }) {
  const upcoming = useMemo(() => {
    return [...courses]
      .filter((c) => c.date && getCountdown(c.date, c.time))
      .sort((a, b) => parseDate(a.date) - parseDate(b.date))
      .slice(0, 5);
  }, [courses]);

  const unscheduled = useMemo(() => courses.filter((c) => !c.date), [courses]);

  return (
    <aside className="panel timeline-panel" data-cursor-exclude>
      <div className="panel-header">
        <span className="eyebrow">Timeline</span>
        <span className="timeline-header-sub">Your schedule at a glance</span>
      </div>

      <div className="panel-body">
        {upcoming.length === 0 ? (
          <div className="timeline-empty">Nothing on the calendar yet.</div>
        ) : (
          upcoming.map((c) => {
            const cd = getCountdown(c.date, c.time);
            return (
              <Link to={`/course/${c.id}`} className="flat-row timeline-item" key={c.id}>
                <span className="timeline-date">
                  <span className="timeline-day">{dayOfMonth(c.date)}</span>
                  <span className="timeline-month">{shortMonth(c.date)}</span>
                </span>
                <span className="timeline-item-main">
                  <span className="timeline-item-subject">{c.subject}</span>
                  <span className="timeline-item-meta">{c.type === "lab" ? "Lab" : "Theory"} exam</span>
                </span>
                <span className="badge" style={{ background: `${urgencyColor(cd)}20`, color: urgencyColor(cd) }}>
                  {cd.days === 0 ? "Today" : `${cd.days}d`}
                </span>
              </Link>
            );
          })
        )}
      </div>

      {unscheduled.length > 0 && (
        <>
          <div className="panel-header timeline-subheader">
            <span className="eyebrow">Not scheduled yet</span>
          </div>
          <div className="panel-body">
            {unscheduled.map((c) => (
              <Link to={`/course/${c.id}`} className="flat-row timeline-item" key={c.id}>
                <span className="timeline-dot" />
                <span className="timeline-item-main">
                  <span className="timeline-item-subject">{c.subject}</span>
                  <span className="timeline-item-meta">{c.type === "lab" ? "Lab" : "Theory"}</span>
                </span>
                <span className="timeline-tba">TBA</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
