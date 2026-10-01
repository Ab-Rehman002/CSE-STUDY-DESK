import { useEffect, useRef } from "react";

// A small ring that trails the pointer with a slight lag. It hides
// completely — not just dims — over anything marked [data-cursor-exclude]
// (the navbar, the Course Overview panel, the Timeline panel), and never
// intercepts clicks. Disabled outright on touch devices, where there's no
// real cursor to follow.
export default function CursorFollower() {
  const ref = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const raf = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current;

    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.2;
      pos.current.y += (target.current.y - pos.current.y) * 0.2;
      if (el) el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      raf.current = requestAnimationFrame(animate);
    };

    const handleMove = (e) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (!started.current) {
        started.current = true;
        pos.current = { x: e.clientX, y: e.clientY };
        el?.classList.add("visible");
      }
      const excluded = e.target.closest("[data-cursor-exclude]");
      const overLink = !excluded && e.target.closest("a, button");
      el?.classList.toggle("visible", !excluded);
      el?.classList.toggle("hovering-link", Boolean(overLink));
    };

    const handleLeave = () => el?.classList.remove("visible");

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseleave", handleLeave);
    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return <div className="cursor-follower" ref={ref} aria-hidden="true" />;
}
