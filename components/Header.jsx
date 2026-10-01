import { Link, useLocation } from "react-router-dom";
import { IconArchive, IconUserCircle } from "@tabler/icons-react";
import { useAdmin } from "./AdminContext.jsx";
import "./Header.css";

export default function Header() {
  const { isAdmin } = useAdmin();
  const { pathname } = useLocation();

  return (
    <header className="site-header" data-cursor-exclude>
      <Link to="/" className="site-header-brand">
        <div className="site-header-title">CSE Study Desk</div>
        <div className="site-header-subtitle">Exam prep, shared by your class reps</div>
      </Link>

      <nav className="site-header-nav">
        <Link to="/archive" className={`nav-link ${pathname.startsWith("/archive") ? "nav-link-active" : ""}`}>
          <IconArchive size={16} stroke={1.75} />
          Past Semesters
        </Link>
        <Link to="/admin" className={`nav-link ${pathname === "/admin" ? "nav-link-active" : ""} ${isAdmin ? "nav-link-admin" : ""}`}>
          <IconUserCircle size={16} stroke={1.75} />
          Admin
        </Link>
      </nav>
    </header>
  );
}
