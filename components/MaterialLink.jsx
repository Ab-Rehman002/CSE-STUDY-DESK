import { FILE_META, getFileUrl } from "../lib/fileTypes.js";
import "./MaterialLink.css";

export default function MaterialLink({ material, variant = "default" }) {
  const meta = FILE_META[material.type] || FILE_META.pdf;
  const url = getFileUrl(material.type, material.id);
  const Icon = meta.icon;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`material-link material-link-${variant}`}
      style={{ background: meta.bg, borderColor: meta.border }}
    >
      <Icon size={17} stroke={1.75} className="material-link-icon" style={{ color: meta.color }} />
      <span className="material-link-name">{material.name}</span>
      <span className="material-link-badge" style={{ color: meta.color, borderColor: meta.border }}>
        {meta.label}
      </span>
    </a>
  );
}
