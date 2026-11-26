import { Box, Button, Chip, Paper, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
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
  emphasized = false,
}: {
  label: string;
  message: string;
  emphasized?: boolean;
}) {
  return (
    <Tooltip title={message} arrow>
      <Box
        component="span"
        tabIndex={emphasized ? 0 : undefined}
        sx={{ display: "block" }}
      >
        <Button
          fullWidth
          variant={emphasized ? "contained" : "outlined"}
          disabled
          sx={
            emphasized
              ? {
                  minHeight: 48,
                  fontSize: "1rem",
                  "&.Mui-disabled": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    color: (theme) => alpha(theme.palette.primary.main, 0.65),
                  },
                }
              : undefined
          }
        >
          {label}
        </Button>
      </Box>
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
  const isSuperAdmin = congress.role === "SUPER_ADMIN";
  const startDate = formatDate(congress.startDate);
  const endDate = formatDate(congress.endDate);
  const needsInstitution =
    congress.role !== "SUPER_ADMIN" && !congress.institution?.trim();
  const canEnterParticipantHome =
    congress.role === "LISTENER" || congress.role === "EXPOSITOR";

  const action = status.disabled ? (
    <DisabledAction
      label="Congreso deshabilitado"
      message="Este congreso se encuentra deshabilitado y no admite acciones operativas."
      emphasized={isSuperAdmin}
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
    <Button
      component={RouterLink}
      to={`/congresses/${encodeURIComponent(congress.code)}/reviewer-inbox`}
      fullWidth
      variant={status.finished ? "outlined" : "contained"}
    >
      Ver bandeja de trabajos
    </Button>
  ) : (
    <Button
      component={RouterLink}
      to={`/admin/congresses/${encodeURIComponent(congress.code)}/home`}
      fullWidth
      variant={isSuperAdmin || !status.finished ? "contained" : "outlined"}
      sx={isSuperAdmin ? { minHeight: 48, fontSize: "1rem" } : undefined}
    >
      Gestionar congreso →
    </Button>
  );

  return (
    <Paper
      component="article"
      variant="outlined"
      sx={{
        p: isSuperAdmin ? 4 : 2.75,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        gap: isSuperAdmin ? 2.25 : 2,
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
            fontSize: isSuperAdmin ? "1.75rem" : "1.25rem",
            lineHeight: 1.25,
            fontWeight: 700,
            minWidth: 0,
            overflowWrap: "anywhere",
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
              : isSuperAdmin || status.label === "Recepción abierta"
                ? "success"
                : "default"
          }
          variant="outlined"
          sx={{
            fontFamily: isSuperAdmin ? "var(--font-sans)" : "var(--font-mono)",
            fontSize: isSuperAdmin ? "1rem" : "0.625rem",
            flexShrink: 0,
            bgcolor:
              isSuperAdmin && !status.disabled && !status.finished
                ? (theme) => alpha(theme.palette.success.main, 0.08)
                : undefined,
          }}
        />
      </Box>
      <Typography
        color="text.secondary"
        variant="body2"
        sx={{ fontSize: isSuperAdmin ? "1rem" : undefined }}
      >
        {congress.place}
      </Typography>
      <Box
        sx={{
          borderTop: 1,
          borderColor: "divider",
          pt: isSuperAdmin ? 2.5 : 2,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: isSuperAdmin ? "1rem" : undefined,
                mb: isSuperAdmin ? 1 : 0,
              }}
            >
              {isSuperAdmin ? "Rol" : "Tu rol"}
            </Typography>
            {isSuperAdmin ? (
              <Chip
                label={roleLabels[congress.role]}
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                }}
              />
            ) : (
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {roleLabels[congress.role]}
              </Typography>
            )}
          </Box>
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: isSuperAdmin ? "1rem" : undefined }}
            >
              {isSuperAdmin
                ? "Presentación de trabajos"
                : "Fin para presentar trabajos"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: isSuperAdmin ? 700 : 600,
                fontSize: isSuperAdmin ? "1rem" : undefined,
              }}
            >
              {isSuperAdmin && "Hasta el "}
              {formatDate(congress.presentationEndDate)}
            </Typography>
          </Box>
        </Box>
        {isSuperAdmin ? (
          <Box sx={{ mt: 2 }}>
            <Typography color="text.secondary" sx={{ fontSize: "1rem" }}>
              Congreso
            </Typography>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
              {startDate === endDate ? startDate : `${startDate} – ${endDate}`}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Período del congreso: {startDate} – {endDate}
          </Typography>
        )}
      </Box>
      <Box sx={{ mt: "auto" }}>{action}</Box>
    </Paper>
  );
}
