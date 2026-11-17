import { Box, Button, Typography } from "@mui/material";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../features/auth/context/AuthContext";
import c4tIcon from "../assets/brand/c4t-login-icon.svg";

export default function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();

  if (!user || !localStorage.getItem("token")) {
    return (
      <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {/* Banner superior full-width */}
      <Box
        component="header"
        sx={{
          bgcolor: "primary.dark",
          color: "common.white",
          px: { xs: 2, sm: 4 },
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box component="img" src={c4tIcon} alt="" sx={{ width: 40 }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography
              sx={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.8rem",
                fontWeight: 700,
              }}
            >
              C4T
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
              }}
            >
              CALL FOR TALKS
            </Typography>
          </Box>
          <Typography
            sx={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.08em",
            }}
          >
            PLATAFORMA PARA CONGRESOS CIENTÍFICOS
          </Typography>
        </Box>
        <Button
          color="inherit"
          variant="outlined"
          onClick={() => {
            // Otra cuenta no debe recibir datos de la sesión anterior desde la caché.
            queryClient.clear();
            logout();
          }}
        >
          Cerrar sesión
        </Button>
      </Box>

      {/* Sub-barra de navegación */}
      <Box
        sx={{
          bgcolor: "action.hover",
          px: { xs: 2, sm: 4 },
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" sx={{ fontFamily: "var(--font-mono)" }}>
          Mis congresos
        </Typography>
      </Box>

      {/* Área principal a pantalla completa */}
      <Box
        component="main"
        sx={{
          flex: 1,
          width: "100%",
          px: { xs: 2, sm: 4 },
          py: 3,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}