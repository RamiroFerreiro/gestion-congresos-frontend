import { Route, Routes, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import LoginPage from "../features/auth/pages/LoginPage";
import AuthLayout from "../layouts/AuthLayout";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import CongressesPage from "../features/congresses/pages/CongressesPage";
import PaperSubmissionPage from "../features/papers/pages/PaperSubmissionPage";
import PaymentsPage from "../features/payments/pages/PaymentsPage";
import AdminPapersPage from "../features/papers/pages/AdminPapersPage";
import UserProfilePage from "../features/profile/pages/UserProfilePage";
import CongressParticipantProfilePage from "../features/profile/pages/CongressParticipantProfilePage";
import ReviewerInboxPage from "../features/evaluator/pages/ReviewerInboxPage";

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

      <Route element={<MainLayout />}>
        <Route
          path="/congresses/:congressCode/reviewer-inbox"
          element={<ReviewerInboxPage />}
        />
        <Route
          path="/congresses/:congressCode/payments"
          element={<PaymentsPage />}
        />
        <Route
          path="/congresses/:congressCode/payments/:paperCode"
          element={<PaymentsPage />}
        />
        <Route path="/congresses" element={<CongressesPage />} />
        <Route
          path="/congresses/:congressCode/papers/new"
          element={<PaperSubmissionPage />}
        />
        <Route
          path="/congresses/:congressCode/papers/:paperCode/edit"
          element={<PaperSubmissionPage />}
        />
        <Route
          path="/dashboard"
          element={<div>Panel Principal (Próximamente)</div>}
        />
        <Route
          path="/congresses/:congressCode/papers"
          element={<AdminPapersPage />}
        />
        <Route
          path="/congresses/:congressCode/profile"
          element={<CongressParticipantProfilePage />}
        />
        <Route path="/profile" element={<UserProfilePage />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;
