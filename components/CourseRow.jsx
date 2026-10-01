import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { IconBook2, IconFlask, IconCircleCheck, IconChevronRight } from "@tabler/icons-react";
import { getCountdown, urgencyColor, shortMonth, dayOfMonth } from "../lib/dateHelpers.js";
import "./CourseRow.css";

export default function CourseRow({ course, basePath = "/course" }) {
  const hasDate = Boolean(course.date);
  const [cd, setCd] = useState(() => (hasDate ? getCountdown(course.date, course.time) : null));

  useEffect(() => {
    if (!hasDate) return;
    const timer = setInterval(() => setCd(getCountdown(course.date, course.time)), 30000);
    return () => clearInterval(timer);
  }, [course.date, course.time, hasDate]);

  const color = course.color || "var(--accent)";
  const isDone = hasDate && !cd;
  const Icon = course.type === "lab" ? IconFlask : IconBook2;

  return (
    <Link to={`${basePath}/${course.id}`} className="flat-row course-row">
      <span className="course-row-icon" style={{ background: `${color}1a`, color }}>
        {isDone ? <IconCircleCheck size={17} stroke={1.75} /> : <Icon size={17} stroke={1.75} />}
      </span>
      <span className="course-row-main">
        <span className="course-row-subject">{course.subject}</span>
        <span className="course-row-meta">
          {course.type === "lab" ? "Lab" : "Theory"} exam
          {hasDate ? <> · {course.fullDay}, {dayOfMonth(course.date)} {shortMonth(course.date)}{course.time && <> · {course.time}</>}</> : <> · Date TBA</>}
        </span>
      </span>
      {!hasDate ? (
        <span className="badge course-row-badge-tba">TBA</span>
      ) : isDone ? (
        <span className="course-row-done">Completed</span>
      ) : (
        <span className="badge" style={{ background: `${urgencyColor(cd)}20`, color: urgencyColor(cd) }}>
          {cd.days === 0 ? "Today" : `${cd.days} ${cd.days === 1 ? "day" : "days"} left`}
        </span>
      )}
      <IconChevronRight size={16} stroke={1.75} className="course-row-arrow" />
    </Link>
  );
}
