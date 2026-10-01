import {
  IconFileTypePdf, IconFileTypePpt, IconWorldWww, IconPhoto,
  IconCode, IconBrandYoutube, IconLink,
} from "@tabler/icons-react";

export const FILE_META = {
  pdf:     { label: "PDF",         color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.35)", icon: IconFileTypePdf },
  pptx:    { label: "PPT",         color: "#f97316", bg: "rgba(249,115,22,0.12)",  border: "rgba(249,115,22,0.35)", icon: IconFileTypePpt },
  html:    { label: "Interactive", color: "#06b6d4", bg: "rgba(6,182,212,0.12)",   border: "rgba(6,182,212,0.35)", icon: IconWorldWww },
  img:     { label: "Image",       color: "#22c55e", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.35)", icon: IconPhoto },
  cpp:     { label: ".CPP File",   color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.35)", icon: IconCode },
  youtube: { label: "YouTube",     color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.35)", icon: IconBrandYoutube },
  link:    { label: "Link",        color: "#8fa5b8", bg: "rgba(143,165,184,0.12)", border: "rgba(143,165,184,0.35)", icon: IconLink },
};

// Accepts EITHER a full URL (Drive, YouTube, a Claude artifact link, anything)
// OR a bare Google Drive file ID typed on its own — detects which one it got.
export function getFileUrl(type, value) {
  if (!value) return "#";
  const trimmed = value.trim();

  // Already a real link — use it exactly as given, no matter what it points to
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // Otherwise treat it as a bare Drive file ID (old behavior, still supported)
  if (type === "html") return `https://drive.google.com/uc?export=view&id=${trimmed}`;
  return `https://drive.google.com/file/d/${trimmed}/view?usp=sharing`;
}
