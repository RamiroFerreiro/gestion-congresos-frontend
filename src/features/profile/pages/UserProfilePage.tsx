import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { UserService } from "../api/UserService";
import UserProfileCard from "../components/UserProfileCard";
import ChangePasswordCard from "../components/ChangePasswordCard";
import ChangeEmailCard from "../components/ChangeEmailCard";

export default function UserProfilePage() {
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["user", "me"],
    queryFn: ({ signal }) => UserService.getMe(signal),
    retry: false,
  });

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", py: 1 }}>
      {/* Encabezado editorial de la página */}
      <Box sx={{ mb: 3 }}>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.6rem",
            fontWeight: 600,
            color: "text.primary",
            mb: 0.5,
          }}
        >
          Mi perfil
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Consultá y gestioná tus datos personales vinculados a la plataforma.
        </Typography>
      </Box>

      {/* Estado de carga */}
      {isLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 8,
          }}
        >
          <CircularProgress size={36} color="primary" />
        </Box>
      )}

      {/* Estado de error */}
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error
            ? error.message
            : "No se pudo obtener la información de tu perfil. Por favor, recargá la página o intentá más tarde."}
        </Alert>
      )}

      {/* Tres secciones del perfil */}
      {!isLoading && !isError && user && (
        <Stack spacing={3}>
          {/* Sección A: Datos personales */}
          <UserProfileCard user={user} />

          {/* Sección B: Seguridad / Contraseña */}
          <ChangePasswordCard />

          {/* Sección C: Correo electrónico */}
          <ChangeEmailCard user={user} />
        </Stack>
      )}
    </Box>
  );
}
