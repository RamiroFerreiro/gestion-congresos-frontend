import { Box, Button, CircularProgress, Paper, Typography, Alert } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { AuthService } from "../api/AuthService";

export default function ConfirmEmailChangePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  // Detectamos si hay una sesión activa para decidir el destino del botón de acción
  const hasSession = !!localStorage.getItem("token");

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["confirm-email-change", token],
    queryFn: ({ signal }) => AuthService.confirmEmailChange(token!, signal),
    // Solo ejecutamos la petición si existe el token en la URL
    enabled: !!token,
    // Token de un solo uso: evitamos reintentos y refetch automáticos
    // que podrían consumir el enlace en entornos con React StrictMode
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

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

  // --- Estado: cargando (verificando el token con el backend) ---
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
            Verificando enlace de confirmación...
          </Typography>
        </Paper>
      </Box>
    );
  }

  // --- Estado: éxito (200 OK del backend) ---
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
            Confirmación de correo
          </Typography>
          <Alert severity="success" sx={{ mb: 3 }}>
            {data.message}
          </Alert>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() =>
              navigate(hasSession ? "/congresses" : "/auth/login", {
                replace: true,
              })
            }
          >
            {hasSession ? "Ir a Mis congresos" : "Iniciar sesión"}
          </Button>
        </Paper>
      </Box>
    );
  }

  // --- Estado: error (400, 404, 409 u otro) ---
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
