import { getDocData, setDocData, getAllDocs } from "./storage.js";
import { SEED_COURSES } from "../data/seedCourses.js";
import { mergeCourses } from "./courseUtils.js";

const FALLBACK_SEMESTER_NUMBER = 3;

// Runs once, ever. Migrates your existing Semester 3 data (seed + any admin
// edits already in the old flat "courses" collection) into the new
// semester-scoped system. Safe to call repeatedly — no-ops once done.
export async function ensureBootstrapped() {
  const pointer = await getDocData("meta", "currentSemester");
  if (pointer && pointer.semesterId) return pointer.semesterId;

  const semesterId = `sem${FALLBACK_SEMESTER_NUMBER}`;
  const legacyOverrides = await getAllDocs("courses");
  const mergedCourses = mergeCourses(SEED_COURSES, legacyOverrides);

  await Promise.all(mergedCourses.map((c) => setDocData(`courses-${semesterId}`, c.id, c)));

  await setDocData("semesters", semesterId, {
    id: semesterId,
    number: FALLBACK_SEMESTER_NUMBER,
    title: `Semester ${FALLBACK_SEMESTER_NUMBER}`,
    isCurrent: true,
    createdAt: Date.now(),
  });

  await setDocData("meta", "currentSemester", { semesterId });
  return semesterId;
}

export async function getCurrentSemesterId() {
  return ensureBootstrapped();
}

export async function getCurrentSemester() {
  const id = await getCurrentSemesterId();
  const data = await getDocData("semesters", id);
  return data ? { id, ...data } : { id, number: FALLBACK_SEMESTER_NUMBER, title: `Semester ${FALLBACK_SEMESTER_NUMBER}`, isCurrent: true };
}

export async function getAllSemesters() {
  const data = await getAllDocs("semesters");
  return Object.entries(data).map(([id, value]) => ({ id, ...value })).sort((a, b) => (b.number || 0) - (a.number || 0));
}

export async function getArchivedSemesters() {
  const all = await getAllSemesters();
  return all.filter((s) => !s.isCurrent);
}

export async function getSemesterCourses(semesterId) {
  const data = await getAllDocs(`courses-${semesterId}`);
  return Object.entries(data).map(([id, value]) => ({ id, ...value }));
}

// Archives whatever semester is live right now and opens a fresh, empty one.
export async function archiveAndStartNewSemester(newTitle) {
  const current = await getCurrentSemester();
  await setDocData("semesters", current.id, { ...current, isCurrent: false });

  const newNumber = (current.number || FALLBACK_SEMESTER_NUMBER) + 1;
  const newId = `sem${newNumber}`;
  const title = (newTitle && newTitle.trim()) || `Semester ${newNumber}`;

  await setDocData("semesters", newId, { id: newId, number: newNumber, title, isCurrent: true, createdAt: Date.now() });
  await setDocData("meta", "currentSemester", { semesterId: newId });
  return newId;
}