export function mergeCourses(seed, overrides) {
  const overrideMap = overrides || {};
  const merged = seed.map((c) => (overrideMap[c.id] ? { ...c, ...overrideMap[c.id], id: c.id } : c));
  Object.keys(overrideMap).forEach((id) => {
    if (!seed.find((c) => c.id === id)) merged.push({ id, ...overrideMap[id] });
  });
  return merged;
}

export function slugify(text) {
  return (
    text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ||
    `course-${Date.now()}`
  );
}