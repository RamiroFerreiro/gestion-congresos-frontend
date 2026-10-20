import { Route, Routes, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import LoginPage from "../features/auth/pages/LoginPage";
import AuthLayout from "../layouts/AuthLayout";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";

function AppRouter() {
  return (
    <Routes>
      {/* Redirección automática de la raíz (/) hacia el login */}
      <Route path="/" element={<Navigate to="/auth/login" replace />} />

      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<MainLayout />} >
        <Route path="/dashboard" element={<div>Panel Principal (Próximamente)</div>} />
      </Route>
    </Routes>
  );
}

export default AppRouter;