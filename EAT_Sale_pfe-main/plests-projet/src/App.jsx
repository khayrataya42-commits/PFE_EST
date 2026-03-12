import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AccueilPage from "./pages/AccueilPage";
import ChatPage from "./pages/ChatPage";
import SearchPage from "./pages/SearchPage";
import CoNavigationPage from "./pages/CoNavigationPage";
import ThemeToggle from "./components/ThemeToggle";
import UploadPage from "./pages/UploadPage";
import "./App.css";
import CalendarPage from "./pages/CalendarPage";
import CoursesPage from "./pages/CoursesPage";
import EnrollmentPage from "./pages/EnrollmentPage";
import UsersPage from "./pages/UsersPage";
import TeleFilePage from "./pages/TeleFilePage";
import EventPage from "./pages/EventPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AdminDemandesPage from "./pages/AdminDemandesPage";

function EmploiTempsPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Emploi du temps</h1>
      <p>Page en cours de préparation...</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/accueil" element={<AccueilPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="/assistance/chat-messager" element={<ChatPage />} />
        <Route path="/assistance/chat-search" element={<SearchPage />} />
        <Route
          path="/assistance/chat-co-navigation"
          element={<CoNavigationPage />}
        />

        <Route path="/upload" element={<UploadPage />} />
        <Route path="/calendrier" element={<CalendarPage />} />
        <Route path="/emploi-du-temps" element={<EmploiTempsPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/enrollment" element={<EnrollmentPage />} />
        <Route path="/gestion" element={<UsersPage />} />

        <Route path="/admin/demandes" element={<AdminDemandesPage />} />

        <Route path="/fichiers-reçus" element={<TeleFilePage />} />
        <Route path="/event-reçus" element={<EventPage />} />

        <Route path="*" element={<HomePage />} />
      </Routes>

      <ThemeToggle />
    </Router>
  );
}

export default App;