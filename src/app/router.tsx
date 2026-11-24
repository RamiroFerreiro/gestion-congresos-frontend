import { Route, Routes, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import LoginPage from "../features/auth/pages/LoginPage";
import AuthLayout from "../layouts/AuthLayout";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import ConfirmEmailChangePage from "../features/auth/pages/ConfirmEmailChangePage";
import ConfirmNewEmailPage from "../features/auth/pages/ConfirmNewEmailPage";
import FirstLoginPage from "../features/auth/pages/FirstLoginPage";
import { useAuth } from "../features/auth/context/AuthContext";
import CongressesPage from "../features/congresses/pages/CongressesPage";
import MyCongressesPage from "../features/congresses/pages/MyCongressesPage";
import PaperDetailPage from "../features/papers/pages/PaperDetailPage";
import PaperInboxPage from "../features/papers/pages/PaperInboxPage";
import PaperSubmissionPage from "../features/papers/pages/PaperSubmissionPage";
import PaymentsPage from "../features/payments/pages/PaymentsPage";
import AdminPapersPage from "../features/papers/pages/AdminPapersPage";
import UserProfilePage from "../features/profile/pages/UserProfilePage";
import CongressParticipantProfilePage from "../features/profile/pages/CongressParticipantProfilePage";
import PresenterHomePage from "../features/presenter-home/pages/PresenterHomePage";

/**
 * Guard para la ruta /first-login.
 * Solo accesible para usuarios autenticados con mustChangePassword === true.
 */
function FirstLoginRoute() {
  const { user } = useAuth();

  if (!user || !localStorage.getItem("token")) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!user.mustChangePassword) {
    return <Navigate to="/congresses" replace />;
  }

  return <FirstLoginPage />;
}

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

      {/* Ruta pública: confirmación de cambio de email (accesible sin sesión activa).
          Se registra fuera de MainLayout para evitar la redirección al login. */}
      <Route path="/confirm-email-change" element={<AuthLayout />}>
        <Route index element={<ConfirmEmailChangePage />} />
      </Route>

      {/* Ruta pública: confirmación desde el NUEVO correo (paso 2 del doble flujo).
          Ejecuta el cambio definitivo de email. Ruta separada para evitar conflictos
          de caché con el paso 1 (staleTime: Infinity sobre el mismo queryKey). */}
      <Route path="/confirm-new-email" element={<AuthLayout />}>
        <Route index element={<ConfirmNewEmailPage />} />
      </Route>

      {/* Ruta de onboarding / primer inicio de sesión */}
      <Route path="/first-login" element={<AuthLayout />}>
        <Route index element={<FirstLoginRoute />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route
          path="/congresses/:congressCode/payments"
          element={<PaymentsPage />}
        />
        <Route
          path="/congresses/:congressCode/payments/:paperCode"
          element={<PaymentsPage />}
        />
        <Route path="/congresses" element={<CongressesPage />} />
        <Route path="/my-congresses" element={<MyCongressesPage />} />
        <Route
          path="/congresses/:congressCode/home"
          element={<PresenterHomePage />}
        />
        <Route
          path="/congresses/:congressCode/my-papers"
          element={<PaperInboxPage />}
        />
        <Route
          path="/congresses/:congressCode/papers/new"
          element={<PaperSubmissionPage />}
        />
        <Route
          path="/congresses/:congressCode/papers/:paperCode/edit"
          element={<PaperSubmissionPage />}
        />
        <Route
          path="/congresses/:congressCode/papers/:paperCode/correction"
          element={<PaperSubmissionPage />}
        />
        <Route
          path="/congresses/:congressCode/papers/:paperCode"
          element={<PaperDetailPage />}
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
