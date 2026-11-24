import { Avatar, Box, Button, Typography } from "@mui/material";
import {
  Link as RouterLink,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            component={RouterLink}
            to="/profile"
            color="inherit"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textTransform: "none",
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              border: "1px solid rgba(255, 255, 255, 0.25)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
                borderColor: "rgba(255, 255, 255, 0.5)",
              },
            }}
          >
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: "primary.main",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              {user.firstName?.slice(0, 1) || "U"}
              {user.lastName?.slice(0, 1) || ""}
            </Avatar>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "common.white",
                display: { xs: "none", sm: "inline" },
              }}
            >
              {user.firstName}
            </Typography>
          </Button>

          <Button
            color="inherit"
            variant="outlined"
            onClick={() => {
              // Otra cuenta no debe recibir datos de la sesión anterior desde la caché.
              queryClient.clear();
              logout();
            }}
            sx={{
              borderColor: "rgba(255, 255, 255, 0.3)",
              "&:hover": {
                borderColor: "common.white",
                bgcolor: "rgba(255, 255, 255, 0.08)",
              },
            }}
          >
            Cerrar sesión
          </Button>
        </Box>
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
        <Typography
          component={RouterLink}
          to="/my-congresses"
          variant="body2"
          sx={{
            fontFamily: "var(--font-mono)",
            color: "text.primary",
            textDecoration: "none",
            display: "inline-block",
            cursor: "pointer",
            "&:hover": {
              textDecoration: "underline",
              color: "primary.main",
            },
          }}
        >
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
