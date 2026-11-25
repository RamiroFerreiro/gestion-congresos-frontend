import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { PaperSubmissionService } from "../../papers/api/PaperSubmissionService";
import { getSubmissionAvailability } from "../../papers/utils/submissionAvailability";
import { PresenterHomeService } from "../api/PresenterHomeService";

type SummaryMetricProps = {
  count: number;
  label: string;
  description: string;
  to?: string;
};

function SummaryMetric({ count, label, description, to }: SummaryMetricProps) {
  const content = (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              minWidth: 36,
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: "#F3EFEE",
              color: "primary.main",
              fontFamily: "var(--font-serif)",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            {count}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700 }}>{label}</Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.25 }}
            >
              {description}
            </Typography>
          </Box>
        </Box>
        <Typography
          aria-hidden
          sx={{ color: "primary.main", fontSize: "1.1rem" }}
        >
          →
        </Typography>
      </Box>
    </>
  );

  if (!to) return <Box sx={{ py: 1.5 }}>{content}</Box>;

  return (
    <Button
      component={RouterLink}
      to={to}
      color="inherit"
      sx={{
        display: "block",
        width: "100%",
        px: 0,
        py: 1.5,
        textAlign: "left",
        borderRadius: 0,
        "&:hover": { bgcolor: "transparent", color: "primary.main" },
      }}
    >
      {content}
    </Button>
  );
}

function CreatePaperButton({
  congressCode,
  enabled,
  disabledMessage,
}: {
  congressCode: string;
  enabled: boolean;
  disabledMessage: string;
}) {
  if (enabled) {
    return (
      <Button
        component={RouterLink}
        to={`/congresses/${encodeURIComponent(congressCode)}/papers/new`}
        variant="contained"
      >
        + Crear nuevo trabajo
      </Button>
    );
  }

  return (
    <Tooltip title={disabledMessage} arrow>
      <span>
        <Button variant="contained" disabled>
          + Crear nuevo trabajo
        </Button>
      </span>
    </Tooltip>
  );
}

function getPresenterHomeError(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) {
      return "Tu sesión venció. Iniciá sesión nuevamente para consultar el inicio del congreso.";
    }
    if (error.response?.status === 403) {
      return "No podés acceder a este inicio. Verificá que tu participación esté activa, que tu institución esté completa y que tu rol sea LISTENER o EXPOSITOR.";
    }
    if (error.response?.status === 404) {
      return "No se encontró el congreso solicitado.";
    }
    if (error.response?.data?.message) return error.response.data.message;
  }

  return "No se pudo cargar el inicio del congreso. Intentá nuevamente.";
}

function formatSubmissionDeadline(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No disponible";

  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function PresenterHomePage() {
  const { congressCode = "" } = useParams();
  const { user } = useAuth();
  const canLoad = Boolean(user && congressCode);
  const summary = useQuery({
    queryKey: ["presenter-home", user?.userId, congressCode],
    queryFn: ({ signal }) =>
      PresenterHomeService.getSummary(congressCode, signal),
    enabled: canLoad,
    retry: false,
  });
  const congressRules = useQuery({
    queryKey: ["paper-submission-rules", user?.userId, congressCode],
    queryFn: ({ signal }) =>
      PaperSubmissionService.getCongressRules(congressCode, signal),
    enabled: canLoad,
    retry: false,
  });
  const participation = useQuery({
    queryKey: ["paper-submission-participation", user?.userId, congressCode],
    queryFn: ({ signal }) =>
      PaperSubmissionService.getMyParticipation(congressCode, signal),
    enabled: canLoad,
    retry: false,
  });

  if (!user) return null;

  if (!congressCode) {
    return <Alert severity="error">La ruta del congreso no es válida.</Alert>;
  }

  if (summary.isPending) {
    return (
      <Box
        role="status"
        sx={{ display: "flex", alignItems: "center", gap: 2, py: 4 }}
      >
        <CircularProgress size={24} />
        <Typography>Cargando el inicio del congreso…</Typography>
      </Box>
    );
  }

  if (summary.isError) {
    return (
      <Stack spacing={2} sx={{ width: "100%" }}>
        <Button
          component={RouterLink}
          to="/my-congresses"
          sx={{ alignSelf: "flex-start" }}
        >
          ← Cambiar congreso
        </Button>
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => void summary.refetch()}>
              Reintentar
            </Button>
          }
        >
          {getPresenterHomeError(summary.error)}
        </Alert>
      </Stack>
    );
  }

  const home = summary.data;
  const canCreateAsParticipant = Boolean(
    participation.data?.active &&
    participation.data.institution?.trim() &&
    (participation.data.role === "LISTENER" ||
      participation.data.role === "EXPOSITOR"),
  );
  const submissionAvailability = congressRules.data
    ? getSubmissionAvailability(congressRules.data)
    : null;
  const canCreatePaper = Boolean(
    canCreateAsParticipant && submissionAvailability?.isOpen,
  );
  const createPaperDisabledMessage =
    participation.isPending || congressRules.isPending
      ? "Verificando la disponibilidad para crear un trabajo."
      : participation.isError || congressRules.isError
        ? "No se pudo verificar si podés crear un trabajo en este momento."
        : !canCreateAsParticipant
          ? "Para crear un trabajo necesitás una participación activa como LISTENER o EXPOSITOR y una institución informada."
          : (submissionAvailability?.message ?? "No disponible.");

  return (
    <Stack spacing={2.5} sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.9rem",
              fontWeight: 700,
            }}
          >
            Inicio — Mis trabajos
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Consultá el estado de tus trabajos y las acciones pendientes.
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/my-congresses"
          variant="outlined"
          sx={{ flexShrink: 0 }}
        >
          Cambiar congreso ↔
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.75 }}>
        <Typography sx={{ fontWeight: 700 }}>Hola, {user.firstName}</Typography>
        <Box sx={{ borderTop: 1, borderColor: "divider", mt: 2, pt: 2 }}>
          <Typography
            sx={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              letterSpacing: "0.08em",
              color: "text.secondary",
              textTransform: "uppercase",
            }}
          >
            Tu congreso
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 3,
              mt: 1,
            }}
          >
            <Typography>{`${home.congressName} · ${home.place}`}</Typography>
            <Typography variant="body2" sx={{ flexShrink: 0 }}>
              <Box component="span" sx={{ fontWeight: 700 }}>
                Fin para presentar trabajos:
              </Box>
              {formatSubmissionDeadline(home.presentationEndDate)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.75 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}>
          <Typography
            sx={{
              fontFamily: "var(--font-serif)",
              fontSize: "2.1rem",
              fontWeight: 700,
            }}
          >
            {home.totalAssociatedPapers}
          </Typography>
          <Typography sx={{ fontWeight: 700 }}>Trabajos asociados</Typography>
        </Box>
      </Paper>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.75 }}>
          <Typography
            component="h2"
            sx={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.25rem",
              fontWeight: 700,
            }}
          >
            Trabajos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Envíos, correcciones y seguimiento de la evaluación.
          </Typography>
          <Box sx={{ mt: 1.25, borderTop: 1, borderColor: "divider" }}>
            <SummaryMetric
              count={home.drafts}
              label="Borradores"
              description="Trabajos que todavía no fueron enviados"
              to={`/congresses/${encodeURIComponent(congressCode)}/my-papers?status=NOT_SUBMITTED`}
            />
            <Box sx={{ borderTop: 1, borderColor: "divider" }} />
            <SummaryMetric
              count={home.needsRevision}
              label="Con observaciones"
              description="Esperan que envíes una versión corregida"
              to={`/congresses/${encodeURIComponent(congressCode)}/my-papers?status=NEEDS_REVISION`}
            />
            <Box sx={{ borderTop: 1, borderColor: "divider" }} />
            <SummaryMetric
              count={home.underEvaluation}
              label="Revisión pendiente"
              description="Versiones esperando un nuevo dictamen"
              to={`/congresses/${encodeURIComponent(congressCode)}/my-papers?status=UNDER_EVALUATION`}
            />
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.75 }}>
          <Typography
            component="h2"
            sx={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.25rem",
              fontWeight: 700,
            }}
          >
            Pagos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Seguimiento habilitado únicamente para trabajos aprobados.
          </Typography>
          <Box sx={{ mt: 1.25, borderTop: 1, borderColor: "divider" }}>
            <SummaryMetric
              count={home.paymentsWithoutValidReceipt}
              label="Sin comprobante"
              description="Trabajos aprobados que requieren un comprobante válido"
            />
            <Box sx={{ borderTop: 1, borderColor: "divider" }} />
            <SummaryMetric
              count={home.paymentsPendingApproval}
              label="Comprobantes por revisar"
              description="Pagos enviados esperando validación"
            />
            <Box sx={{ borderTop: 1, borderColor: "divider" }} />
            <SummaryMetric
              count={home.paymentsVerified}
              label="Pagos verificados"
              description="Trabajos habilitados para el Libro de Resúmenes"
            />
          </Box>
        </Paper>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <CreatePaperButton
          congressCode={congressCode}
          enabled={canCreatePaper}
          disabledMessage={createPaperDisabledMessage}
        />
        <Button
          component={RouterLink}
          to={`/congresses/${encodeURIComponent(congressCode)}/my-papers`}
          variant="outlined"
        >
          Ver bandeja de trabajos →
        </Button>
        <Button component={RouterLink} to={`/congresses/${encodeURIComponent(congressCode)}/coauthorship`} variant="outlined">Buscar trabajo para unirme</Button>
      </Box>

      {(participation.isError || congressRules.isError) && (
        <Alert severity="warning">
          No se pudo verificar la disponibilidad para crear trabajos. La
          información de tu inicio continúa disponible.
        </Alert>
      )}

      <Paper
        variant="outlined"
        sx={{ borderRadius: 2, p: 2.75, bgcolor: "#F3EFEE" }}
      >
        <Typography sx={{ fontWeight: 700 }}>
          Ciclo de vida del trabajo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          Borrador → Enviado → En evaluación → Aceptado / Con observaciones /
          Rechazado
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          En Borrador podés editar todo. Una vez enviado, el trabajo se bloquea.
          Si recibís observaciones, se habilita la corrección.
        </Typography>
      </Paper>
    </Stack>
  );
}
