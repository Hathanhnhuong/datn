import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import About from "./pages/About";
import Home from "./pages/Home";
import Diagnose from "./pages/Diagnose";
import News from "./pages/News";
import AuthPage from "./pages/AuthPage";
import NewsDetail from "./pages/NewsDetail";

// Admin pages
import Dashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import DiagnosisHistory from "./pages/admin/DiagnosisHistory";
import ModelManagement from "./pages/admin/ModelManagement";
import ArticleManagement from "./pages/admin/ArticleManagement";
import Statistics from "./pages/admin/Statistics";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/diagnose" element={<Diagnose />} />
        <Route path="/news" element={<News />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<NewsDetail />} />
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="history" element={<DiagnosisHistory />} />
          <Route path="models" element={<ModelManagement />} />
          <Route path="articles" element={<ArticleManagement />} />
          <Route path="stats" element={<Statistics />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
