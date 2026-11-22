import { Box, Button, Chip, Paper, Tooltip, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { getCongressStatus } from "../lib/congressAvailability";
import type { MyCongressRole, MyCongressSummary } from "../types/congress";

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

function DisabledAction({
  label,
  message,
}: {
  label: string;
  message: string;
}) {
  return (
    <Tooltip title={message} arrow>
      <span>
        <Button fullWidth variant="outlined" disabled>
          {label}
        </Button>
      </span>
    </Tooltip>
  );
}

interface Props {
  congress: MyCongressSummary;
  now: Date;
  onCompleteInstitution: (congress: MyCongressSummary) => void;
}

export default function MyCongressCard({
  congress,
  now,
  onCompleteInstitution,
}: Props) {
  const status = getCongressStatus(congress, now);
  const needsInstitution =
    congress.role !== "SUPER_ADMIN" && !congress.institution?.trim();
  const canEnterParticipantHome =
    congress.role === "LISTENER" || congress.role === "EXPOSITOR";

  const action = status.disabled ? (
    <DisabledAction
      label="Congreso deshabilitado"
      message="Este congreso se encuentra deshabilitado y no admite acciones operativas."
    />
  ) : needsInstitution ? (
    <Button
      fullWidth
      variant="contained"
      onClick={() => onCompleteInstitution(congress)}
    >
      Completar institución
    </Button>
  ) : canEnterParticipantHome ? (
    <Button
      component={RouterLink}
      to={`/congresses/${encodeURIComponent(congress.code)}/home`}
      fullWidth
      variant={status.finished ? "outlined" : "contained"}
    >
      {status.finished ? "Ingresar al congreso →" : "Continuar →"}
    </Button>
  ) : congress.role === "EVALUATOR" ? (
    <DisabledAction
      label="Espacio de evaluación próximo"
      message="La vista de trabajo del evaluador todavía no está implementada."
    />
  ) : (
    <DisabledAction
      label="Gestionar congreso →"
      message="El inicio de gestión administrativa todavía no está integrado."
    />
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
        borderColor: status.disabled ? "divider" : undefined,
        opacity: status.disabled ? 0.72 : 1,
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
          label={status.label}
          size="small"
          color={
            status.disabled || status.finished
              ? "default"
              : status.label === "Recepción abierta"
                ? "success"
                : "default"
          }
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
      <Box sx={{ borderTop: 1, borderColor: "divider", pt: 2 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Tu rol
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {roleLabels[congress.role]}
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
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Período del congreso: {formatDate(congress.startDate)} –{" "}
          {formatDate(congress.endDate)}
        </Typography>
      </Box>
      <Box sx={{ mt: "auto" }}>{action}</Box>
    </Paper>
  );
}
