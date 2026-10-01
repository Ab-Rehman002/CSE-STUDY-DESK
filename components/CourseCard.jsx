import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCountdown, urgencyColor, shortMonth, dayOfMonth } from "../lib/dateHelpers.js";
import "./CourseCard.css";

export default function CourseCard({ course, basePath = "/course" }) {
  const hasDate = Boolean(course.date);
  const [cd, setCd] = useState(() => (hasDate ? getCountdown(course.date, course.time) : null));

  useEffect(() => {
    if (!hasDate) return;
    const timer = setInterval(() => setCd(getCountdown(course.date, course.time)), 30000);
    return () => clearInterval(timer);
  }, [course.date, course.time, hasDate]);

  const color = course.color || "var(--accent)";
  const isDone = hasDate && !cd;

  return (
    <Link to={`${basePath}/${course.id}`} className="course-card">
      <div className="course-card-bar" style={{ background: color }} />
      <div className="course-card-body">
        <div className="course-card-top">
          <div className="course-card-subject">{course.subject}</div>
          <span className="badge" style={{ background: `${color}20`, color }}>
            {course.type === "lab" ? "Lab" : "Theory"}
          </span>
        </div>
        <div className="course-card-meta">
          {hasDate ? (
            <>{course.fullDay}, {dayOfMonth(course.date)} {shortMonth(course.date)}{course.time && <> · {course.time}</>}</>
          ) : (
            <>{course.code ? `${course.code} · ` : ""}Timetable not announced yet</>
          )}
        </div>
        <div className="course-card-bottom">
          {!hasDate ? (
            <span className="course-card-tba">Date TBA</span>
          ) : isDone ? (
            <span className="course-card-done">Completed</span>
          ) : (
            <span className="course-card-days" style={{ color: urgencyColor(cd) }}>{cd.days} {cd.days === 1 ? "day" : "days"} left</span>
          )}
          <span className="course-card-link">View details →</span>
        </div>
      </div>
    </Link>
  );
}
