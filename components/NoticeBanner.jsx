import { IconPinned } from "@tabler/icons-react";
import "./NoticeBanner.css";

export default function NoticeBanner({ notices }) {
  if (!notices || notices.length === 0) return null;
  return (
    <div className="notice-stack">
      {notices.map((n) => (
        <div className="notice-banner" key={n.id}>
          <IconPinned size={15} stroke={2} className="notice-icon" />
          <span className="notice-text">{n.text}</span>
        </div>
      ))}
    </div>
  );
}
