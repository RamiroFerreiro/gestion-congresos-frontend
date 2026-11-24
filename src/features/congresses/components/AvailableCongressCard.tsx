import { Box, Button, Chip, Divider, Paper, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { getCongressAvailability } from "../lib/congressAvailability";
import type {
  AvailableCongress,
  MyCongressRole,
  MyCongressSummary,
} from "../types/congress";

const roleLabels: Record<MyCongressRole, string> = {
  ADMINISTRATOR: "Administrador",
  EVALUATOR: "Evaluador",
  EXPOSITOR: "Presentador",
  LISTENER: "Oyente",
  SUPER_ADMIN: "Súper administrador",
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No disponible";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

interface Props {
  congress: AvailableCongress;
  participation: MyCongressSummary | undefined;
  now: Date;
  onInstitution: (congress: AvailableCongress, editing: boolean) => void;
}

export default function AvailableCongressCard({
  congress,
  participation,
  now,
  onInstitution,
}: Props) {
  const { canRegister, label } = getCongressAvailability(congress, now);
  const needsInstitution =
    participation &&
    participation.role !== "SUPER_ADMIN" &&
    !participation.institution?.trim();
  const canEnterParticipantHome =
    participation?.role === "LISTENER" || participation?.role === "EXPOSITOR";

  const action = participation ? (
    <>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Tu rol: {roleLabels[participation.role]}
      </Typography>
      {needsInstitution ? (
        <Button
          fullWidth
          variant="contained"
          onClick={() => onInstitution(congress, true)}
        >
          Completar institución
        </Button>
      ) : canEnterParticipantHome ? (
        <Box sx={{ display: "grid", gap: 1 }}>
          <Button
            component={RouterLink}
            to={`/congresses/${encodeURIComponent(congress.code)}/home`}
            fullWidth
            variant="contained"
          >
            Ingresar al congreso
          </Button>
          <Button
            component={RouterLink}
            to={`/congresses/${encodeURIComponent(congress.code)}/my-papers`}
            fullWidth
            variant="outlined"
          >
            Mis trabajos
          </Button>
        </Box>
      ) : (
        <Button
          component={RouterLink}
          to="/my-congresses"
          fullWidth
          variant="outlined"
        >
          Ver en Mis congresos
        </Button>
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
  );

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
      <Box sx={{ mt: "auto" }}>{action}</Box>
    </Paper>
  );
}
