import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import CongressService from "../api/CongressService";
import { getCongressAvailability } from "../lib/congressAvailability";
import { getCongressError } from "../lib/congressErrors";
import type { AvailableCongress, ParticipantRole } from "../types/congress";

const roleLabels: Record<ParticipantRole, string> = {
  UNKNOWN: "Sin rol asignado",
  ADMINISTRATOR: "Administrador",
  EVALUATOR: "Evaluador",
  EXPOSITOR: "Presentador",
  LISTENER: "Oyente",
};
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

interface Props {
  congress: AvailableCongress;
  userId: number;
  now: Date;
  onInstitution: (congress: AvailableCongress, editing: boolean) => void;
}

export default function AvailableCongressCard({
  congress,
  userId,
  now,
  onInstitution,
}: Props) {
  const { user } = useAuth();
  const participation = useQuery({
    queryKey: ["congress-participation", userId, congress.code],
    queryFn: async ({ signal }) => {
      try {
        return (await CongressService.getMyParticipation(congress.code, signal))
          .data;
      } catch (error) {
        // 404 también puede indicar una baja previa: el backend valida la inscripción.
        if (isAxiosError(error) && error.response?.status === 404) return null;
        throw error;
      }
    },
    retry: false,
  });
  const { canRegister, label } = getCongressAvailability(congress, now);
  const participant = participation.data?.active ? participation.data : null;
  const needsInstitution = participant && !participant.institution?.trim();

  return (
    <Paper
      component="article"
      variant="outlined"
      sx={{
        p: 2.75,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.25rem",
            lineHeight: 1.25,
            fontWeight: 700,
          }}
        >
          {congress.name}
        </Typography>
        <Chip
          label={label}
          size="small"
          color={canRegister ? "success" : "default"}
          variant="outlined"
          sx={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.625rem",
            flexShrink: 0,
          }}
        />
      </Box>
      <Typography color="text.secondary" variant="body2">
        {congress.place}
      </Typography>
      <Divider />
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Período del congreso
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {formatDate(congress.startDate)} – {formatDate(congress.endDate)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Fin para presentar trabajos
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {formatDate(congress.presentationEndDate)}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary">
        Inscripción: {formatDate(congress.registrationStartDate)} –{" "}
        {formatDate(congress.registrationEndDate)}
      </Typography>
      <Box sx={{ mt: "auto" }}>
        {participation.isPending || participation.isFetching ? (
          <Typography role="status" variant="body2">
            Consultando tu participación…
          </Typography>
        ) : participation.isError ? (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => void participation.refetch()}
              >
                Reintentar
              </Button>
            }
          >
            {getCongressError(participation.error)}
          </Alert>
        ) : participant ? (
          <>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Tu rol: {roleLabels[participant.role] ?? "Sin rol asignado"}
            </Typography>
            {needsInstitution ? (
              <Button
                fullWidth
                variant="contained"
                onClick={() => onInstitution(congress, true)}
              >
                Completar institución
              </Button>
            ) : participant.role === "ADMINISTRATOR" ? (
              <Button
                component={RouterLink}
                to={`/congresses/${encodeURIComponent(congress.code)}/payments`}
                fullWidth
                variant="outlined"
              >
                Pagos y Libro de Resúmenes
              </Button>
            ) : participant.role === "EXPOSITOR" ||
              participant.role === "LISTENER" ? (
              <Box sx={{ display: "grid", gap: 1 }}>
                <Button
                  component={RouterLink}
                  to={`/congresses/${encodeURIComponent(congress.code)}/my-papers`}
                  fullWidth
                  variant="contained"
                >
                  Mis trabajos
                </Button>
                {participant.role === "EXPOSITOR" && (
                  <Button
                    component={RouterLink}
                    to={`/congresses/${encodeURIComponent(congress.code)}/payments`}
                    fullWidth
                    variant="outlined"
                  >
                    Consultar estado de pago
                  </Button>
                )}
              </Box>
            ) : (
              <>
                <Button fullWidth variant="outlined" disabled>
                  Ingresar al congreso
                </Button>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Tu inscripción está activa. El acceso estará disponible
                  próximamente.
                </Typography>
              </>
            )}
          </>
        ) : canRegister ? (
          <Button
            fullWidth
            variant="contained"
            onClick={() => onInstitution(congress, false)}
          >
            Inscribirme
          </Button>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No hay inscripciones disponibles en este momento.
          </Typography>
        )}
      </Box>
      {user?.superAdmin && participant?.role !== "ADMINISTRATOR" && (
        <Button
          component={RouterLink}
          to={`/congresses/${encodeURIComponent(congress.code)}/payments`}
          fullWidth
          variant="outlined"
        >
          Pagos y Libro de Resúmenes
        </Button>
      )}
    </Paper>
  );
}
