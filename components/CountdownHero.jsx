import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IconCalendar, IconClock, IconArrowRight } from "@tabler/icons-react";
import { getCountdown, urgencyColor, shortMonth, dayOfMonth } from "../lib/dateHelpers.js";
import "./CountdownHero.css";

const TAGLINES = [
  "Stay consistent. You've got this.",
  "One session at a time.",
  "Future you is already thanking you.",
];

export default function CountdownHero({ course }) {
  const hasDate = Boolean(course && course.date);
  const [cd, setCd] = useState(() => (hasDate ? getCountdown(course.date, course.time) : null));

  useEffect(() => {
    if (!hasDate) return;
    const timer = setInterval(() => setCd(getCountdown(course.date, course.time)), 1000);
    return () => clearInterval(timer);
  }, [course, hasDate]);

  if (!course || !hasDate || !cd) {
    return (
      <div className="countdown-hero countdown-hero-empty">
        <div className="eyebrow">Next up</div>
        <div className="countdown-empty-text">Exam dates haven't been announced yet — check back soon.</div>
      </div>
    );
  }

  const pad = (n) => String(n).padStart(2, "0");
  const color = urgencyColor(cd);
  const tagline = TAGLINES[course.subject.length % TAGLINES.length];

  return (
    <div className="countdown-hero">
      <div className="countdown-hero-top">
        <div className="countdown-hero-main">
          <div className="eyebrow">{course.type === "lab" ? "Next lab exam" : "Next up"}</div>
          <div className="countdown-name" style={{ color: course.color || "var(--accent)" }}>{course.subject}</div>
          <div className="countdown-date-row">
            <span className="countdown-date-item"><IconCalendar size={14} stroke={1.75} /> {course.fullDay}, {dayOfMonth(course.date)} {shortMonth(course.date)}</span>
            {course.time && <span className="countdown-date-item"><IconClock size={14} stroke={1.75} /> {course.time}</span>}
          </div>
          <Link to={`/course/${course.id}`} state={{ tab: "materials" }} className="countdown-cta">
            Open {course.type === "lab" ? "Lab" : "Study"} Material <IconArrowRight size={14} stroke={2} />
          </Link>
        </div>
        <div className="countdown-row">
          <div className="eyebrow countdown-row-label">Exam in</div>
          <div className="countdown-boxes">
            {[["days", cd.days], ["hours", cd.hours], ["mins", cd.mins], ["secs", cd.secs]].map(([label, val]) => (
              <div className="countdown-box" key={label}>
                <div className="countdown-num" style={{ color }}>{pad(val)}</div>
                <div className="countdown-sub">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="countdown-hero-divider" />
      <div className="countdown-tagline">{tagline}</div>
    </div>
  );
}
