import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import CongressService from "../../congresses/api/CongressService";
import { UserService } from "../api/UserService";
import CongressParticipationCard from "../components/CongressParticipationCard";
import UserProfileCard from "../components/UserProfileCard";

export default function CongressParticipantProfilePage() {
  const { congressCode = "" } = useParams<{ congressCode: string }>();

  // Consulta de la participación en el congreso
  const participationQuery = useQuery({
    queryKey: ["congress-participation", congressCode],
    queryFn: async ({ signal }) => {
      const response = await CongressService.getMyParticipation(
        congressCode,
        signal,
      );
      return response.data;
    },
    enabled: Boolean(congressCode),
    retry: false,
  });

  // Consulta de los datos del congreso (para obtener el nombre)
  const congressQuery = useQuery({
    queryKey: ["congress", congressCode],
    queryFn: async ({ signal }) => {
      const response = await CongressService.getCongressByCode(
        congressCode,
        signal,
      );
      return response.data;
    },
    enabled: Boolean(congressCode),
    retry: false,
  });

  // Consulta de los datos personales globales del usuario
  const userQuery = useQuery({
    queryKey: ["user", "me"],
    queryFn: ({ signal }) => UserService.getMe(signal),
    retry: false,
  });

  const isLoading =
    participationQuery.isLoading ||
    userQuery.isLoading ||
    congressQuery.isLoading;

  const isParticipation404 =
    isAxiosError(participationQuery.error) &&
    participationQuery.error.response?.status === 404;

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", py: 1 }}>
      {/* Botón superior de retorno */}
      <Box sx={{ mb: 2 }}>
        <Button
          component={RouterLink}
          to="/congresses"
          color="inherit"
          variant="text"
          sx={{
            textTransform: "none",
            color: "text.secondary",
            px: 0,
            "&:hover": { color: "primary.main", bgcolor: "transparent" },
          }}
        >
          ← Volver a Mis congresos
        </Button>
      </Box>

      {/* Encabezado editorial */}
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
          Perfil en el Congreso
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Revisá tu condición de participante en este congreso y mantené
          actualizada tu información personal.
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

      {/* Caso: No inscripto o congreso no encontrado */}
      {isParticipation404 && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          action={
            <Button
              component={RouterLink}
              to="/congresses"
              color="inherit"
              size="small"
            >
              Ver congresos
            </Button>
          }
        >
          No encontramos una inscripción para tu usuario en el congreso{" "}
          <strong>{congressCode}</strong>. Verificá que estés inscripto desde la
          sección de congresos.
        </Alert>
      )}

      {/* Errores de carga generales */}
      {!isParticipation404 && participationQuery.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Ocurrió un error al cargar los datos de participación en el congreso.
          Por favor, reintentá más tarde.
        </Alert>
      )}

      {/* Contenido principal cuando la participación y el usuario están disponibles */}
      {!isLoading && participationQuery.data && userQuery.data && (
        <>
          {/* Tarjeta 1: Datos específicos de la participación en el congreso */}
          <CongressParticipationCard
            congressCode={congressCode}
            congressName={congressQuery.data?.name}
            participation={participationQuery.data}
          />

          {/* Tarjeta 2: Ficha unificada de datos personales globales */}
          <Box sx={{ mt: 3 }}>
            <Typography
              component="h3"
              sx={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.2rem",
                fontWeight: 600,
                color: "text.primary",
                mb: 1.5,
              }}
            >
              Datos personales del usuario
            </Typography>
            <UserProfileCard user={userQuery.data} />
          </Box>
        </>
      )}
    </Box>
  );
}
