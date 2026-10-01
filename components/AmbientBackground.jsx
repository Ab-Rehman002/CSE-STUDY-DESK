import "./AmbientBackground.css";

// The dot-grid texture lives in theme.css on <body> — it's static, so it
// needs no component at all. This just adds a quiet vignette so content
// stays the focal point at the edges of very wide screens. No JS, no
// cursor tracking, nothing to disable for prefers-reduced-motion because
// nothing here moves.
export default function AmbientBackground() {
  return <div className="ambient-vignette" aria-hidden="true" />;
}
