import { Routes, Route } from "react-router-dom";
import { AdminProvider } from "./components/AdminContext.jsx";
import AmbientBackground from "./components/AmbientBackground.jsx";
import CursorFollower from "./components/CursorFollower.jsx";
import Header from "./components/Header.jsx";
import HomePage from "./pages/HomePage.jsx";
import CourseDetailPage from "./pages/CourseDetailPage.jsx";
import ArchivePage from "./pages/ArchivePage.jsx";
import ArchiveSemesterPage from "./pages/ArchiveSemesterPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

export default function App() {
  return (
    <AdminProvider>
      <AmbientBackground />
      <CursorFollower />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/course/:id" element={<CourseDetailPage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/archive/:semesterId" element={<ArchiveSemesterPage />} />
        <Route path="/archive/:semesterId/course/:id" element={<CourseDetailPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </AdminProvider>
  );
}