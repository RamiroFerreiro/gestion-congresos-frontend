import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { AuthService } from "../api/AuthService";
import { useAuth } from "../context/AuthContext";

/**
 * Paso 2 del flujo de cambio de email con doble confirmación.
 * El usuario llega aquí desde el enlace enviado a su NUEVO correo electrónico.
 * Al montar, ejecuta el cambio definitivo de email en el backend.
 *
 * Ruta: /confirm-new-email?token={UUID}  (pública, bajo AuthLayout)
 * Endpoint backend: GET /api/auth/confirm-email-change?token={UUID}
 */
export default function ConfirmNewEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const token = searchParams.get("token");

  const hasSession = !!localStorage.getItem("token");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["confirm-new-email", token],
    queryFn: ({ signal }) => AuthService.confirmNewEmail(token!, signal),
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const handleGoToLogin = () => {
    // Limpiamos sesión y caché para que inicie sesión con el nuevo correo de forma limpia
    queryClient.clear();
    logout();
    navigate("/auth/login", { replace: true });
  };

  // --- Estado: token ausente en la URL ---
  if (!token) {
    return (
      <Box sx={{ width: "100%", maxWidth: 480 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderColor: "divider",
            bgcolor: "background.paper",
            borderRadius: 1,
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "text.primary",
              mb: 2,
            }}
          >
            Enlace inválido
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            El enlace de confirmación es inválido o incompleto. Por favor,
            iniciá el proceso de cambio de correo nuevamente desde tu perfil.
          </Alert>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() =>
              navigate(hasSession ? "/profile" : "/auth/login", {
                replace: true,
              })
            }
          >
            {hasSession ? "Ir a mi perfil" : "Iniciar sesión"}
          </Button>
        </Paper>
      </Box>
    );
  }

  // --- Estado: cargando (aplicando el cambio definitivo) ---
  if (isLoading) {
    return (
      <Box sx={{ width: "100%", maxWidth: 480 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderColor: "divider",
            bgcolor: "background.paper",
            borderRadius: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            py: 5,
          }}
        >
          <CircularProgress size={36} color="primary" />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Aplicando el cambio de correo electrónico...
          </Typography>
        </Paper>
      </Box>
    );
  }

  // --- Estado: éxito (cambio definitivo aplicado) ---
  if (!isError && data) {
    return (
      <Box sx={{ width: "100%", maxWidth: 480 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderColor: "divider",
            bgcolor: "background.paper",
            borderRadius: 1,
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "text.primary",
              mb: 2,
            }}
          >
            ¡Correo actualizado!
          </Typography>
          <Alert severity="success" sx={{ mb: 3 }}>
            {data.message}
          </Alert>
          {/* Si había sesión activa, limpiamos la sesión anterior y llevamos a login */}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleGoToLogin}
          >
            Iniciar sesión con el nuevo correo
          </Button>
        </Paper>
      </Box>
    );
  }

  // --- Estado: error (400 token inválido/expirado, 404 no encontrado, 409 email ocupado) ---
  const backendMessage =
    isAxiosError(error) && error.response?.data?.message
      ? error.response.data.message
      : "El enlace de confirmación es inválido, ya fue utilizado o ha expirado. Por favor, iniciá el proceso nuevamente.";

  return (
    <Box sx={{ width: "100%", maxWidth: 480 }}>
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderColor: "divider",
          bgcolor: "background.paper",
          borderRadius: 1,
        }}
      >
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "text.primary",
            mb: 2,
          }}
        >
          Error en la confirmación
        </Typography>
        <Alert severity="error" sx={{ mb: 3 }}>
          {backendMessage}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() =>
            navigate(hasSession ? "/profile" : "/auth/login", {
              replace: true,
            })
          }
        >
          {hasSession ? "Volver a mi perfil" : "Iniciar sesión"}
        </Button>
      </Paper>
    </Box>
  );
}
