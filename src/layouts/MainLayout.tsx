import { useState } from "react";
import {
  Avatar,
  Box,
  ButtonBase,
  Menu,
  MenuItem,
  Typography,
  Divider,
} from "@mui/material";
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

  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(
    null,
  );

  const profileMenuOpen = Boolean(profileAnchorEl);

  if (!user || !localStorage.getItem("token")) {
    return (
      <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
    );
  }

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();

    // Limpiamos la caché para evitar que otra cuenta reciba datos de la sesión anterior.
    queryClient.clear();
    logout();
  };

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
                fontFamily: "var(--font-sans)",
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
                color: "#F3D6DE",
                fontWeight: 700,
              }}
            >
              CALL FOR TALKS
            </Typography>
          </Box>

          <Typography
            sx={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.6rem",
              letterSpacing: "0.08em",
              color: "rgba(255, 253, 252, 0.66)",
              fontWeight: 200,
            }}
          >
            PLATAFORMA PARA CONGRESOS CIENTÍFICOS
          </Typography>
        </Box>

        {/* Acciones del usuario */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <ButtonBase
            id="profile-menu-button"
            onClick={(event) => setProfileAnchorEl(event.currentTarget)}
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen ? "true" : undefined}
            sx={{
              color: "common.white",
              borderRadius: 2,
              px: 1,
              py: 0.5,
              gap: 1,
              transition: "background-color 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.08)",
              },
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
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
              sx={{
                display: { xs: "none", sm: "inline" },
                fontWeight: 600,
                color: "common.white",
              }}
            >
              {user.firstName}
            </Typography>

            <Box
              component="span"
              aria-hidden="true"
              sx={{
                width: 8,
                height: 8,
                borderRight: "1.5px solid currentColor",
                borderBottom: "1.5px solid currentColor",
                transform: profileMenuOpen ? "rotate(225deg)" : "rotate(45deg)",
                transition: "transform 0.2s ease",
                ml: 0.5,
                mt: profileMenuOpen ? 0.5 : -0.5,
              }}
            />
          </ButtonBase>

          <Menu
            anchorEl={profileAnchorEl}
            open={profileMenuOpen}
            onClose={handleProfileMenuClose}
            slotProps={{
              list: {
                "aria-labelledby": "profile-menu-button",
              },
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            sx={{
              "& .MuiPaper-root": {
                mt: 1,
                minWidth: 220,
                borderRadius: 2,
              },
            }}
          >
            <MenuItem
              component={RouterLink}
              to="/profile"
              onClick={handleProfileMenuClose}
            >
              Mis datos personales
            </MenuItem>

            <Divider
              sx={{
                my: 0.5,
                mx: 1,
                borderColor: "rgba(0, 0, 0, 0.08)",
              }}
            />

            <MenuItem
              onClick={handleLogout}
              sx={{
                color: "error.main",
                fontWeight: 600,
              }}
            >
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Box>
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
