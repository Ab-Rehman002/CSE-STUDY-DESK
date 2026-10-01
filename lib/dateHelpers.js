export function parseDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function shortMonth(dateStr) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return months[parseDate(dateStr).getMonth()];
}

export function dayOfMonth(dateStr) {
  return parseDate(dateStr).getDate();
}

export function shortDay(dateStr) {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return days[parseDate(dateStr).getDay()];
}

export function getCountdown(dateStr, timeStr = "10:00 AM") {
  if (!dateStr) return null; // TBA course — no date to count down to
  const target = parseDate(dateStr);
  const timeMatch = timeStr && timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const isPM = timeMatch[3].toUpperCase() === "PM";
    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    target.setHours(hours, minutes, 0, 0);
  }
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
  };
}

export function urgencyColor(cd) {
  if (!cd) return "#61666d";
  if (cd.days === 0) return "#f87171";
  if (cd.days <= 2) return "#e8a33d";
  if (cd.days <= 5) return "#4ade80";
  return "#61666d";
}

export function timeAgo(ts) {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}