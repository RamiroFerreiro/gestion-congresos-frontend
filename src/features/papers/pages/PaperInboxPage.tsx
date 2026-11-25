import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import CoauthorshipRequestsDialog from "../components/CoauthorshipRequestsDialog";
import { canManageCoauthorship } from "../lib/coauthorship";
import { isAxiosError } from "axios";
import {
  Link as RouterLink,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { ParticipantPaperInboxService } from "../api/ParticipantPaperInboxService";
import { PaperSubmissionService } from "../api/PaperSubmissionService";
import type {
  ParticipantPaperActivityType,
  ParticipantPaperSummary,
  ParticipantPaymentStatus,
} from "../types/participantPaperInbox";
import type { PaperStatus } from "../types/paperSubmission";
import { getSubmissionAvailability } from "../utils/submissionAvailability";

const statusOptions: Array<{ value: PaperStatus; label: string }> = [
  { value: "NOT_SUBMITTED", label: "Borrador" },
  { value: "UNDER_EVALUATION", label: "En evaluación" },
  { value: "NEEDS_REVISION", label: "Con observaciones" },
  { value: "ACCEPTED", label: "Aprobado" },
  { value: "REJECTED", label: "Desaprobado" },
];

const statusLabels: Record<PaperStatus, string> = {
  NOT_SUBMITTED: "Borrador",
  UNDER_EVALUATION: "Pendiente de evaluación",
  ACCEPTED: "Aprobado",
  REJECTED: "Desaprobado",
  NEEDS_REVISION: "Con observaciones",
};

const statusColors: Record<PaperStatus, string> = {
  NOT_SUBMITTED: "#6F6468",
  UNDER_EVALUATION: "#7A1F3A",
  ACCEPTED: "#2E6B4F",
  REJECTED: "#9D2F3E",
  NEEDS_REVISION: "#9B6B1F",
};

const paymentLabels: Record<ParticipantPaymentStatus, string> = {
  NOT_ENABLED: "No habilitado",
  PENDING_RECEIPT: "Sin comprobante",
  PENDING_APPROVAL: "En revisión",
  VERIFIED: "Verificado",
  REJECTED: "Comprobante rechazado",
};

const paymentColors: Record<ParticipantPaymentStatus, string> = {
  NOT_ENABLED: "#8A7279",
  PENDING_RECEIPT: "#9B6B1F",
  PENDING_APPROVAL: "#7A1F3A",
  VERIFIED: "#2E6B4F",
  REJECTED: "#9D2F3E",
};

const activityLabels: Record<ParticipantPaperActivityType, string> = {
  DRAFT_SAVED: "Borrador actualizado",
  PAPER_SUBMITTED: "Trabajo enviado",
  EVALUATION_RELEASED: "Dictamen emitido",
  CORRECTION_SUBMITTED: "Versión corregida enviada",
  PAYMENT_UPLOADED: "Comprobante cargado",
  PAYMENT_VERIFIED: "Pago verificado",
  PAYMENT_REJECTED: "Pago rechazado",
};

function isPaperStatus(value: string | null): value is PaperStatus {
  return statusOptions.some((option) => option.value === value);
}

function getPositiveInteger(value: string | null, fallback: number) {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue >= 0
    ? parsedValue
    : fallback;
}

function formatActivity(activity: ParticipantPaperSummary) {
  if (!activity.lastActivityType || !activity.lastActivityAt) {
    return "Actividad no disponible";
  }

  const date = new Date(activity.lastActivityAt);
  if (Number.isNaN(date.getTime())) return "Actividad no disponible";

  const label = activityLabels[activity.lastActivityType];
  const formattedDate = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

  return `${label} el ${formattedDate}`;
}

function getInboxError(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) {
      return "Tu sesión venció. Iniciá sesión nuevamente para consultar tus trabajos.";
    }
    if (error.response?.status === 403) {
      return "No podés consultar tus trabajos en este congreso. Verificá que tu participación esté activa y que tu institución esté completa.";
    }
    if (error.response?.status === 404) {
      return "No se encontró el congreso solicitado.";
    }
    if (error.response?.data?.message) return error.response.data.message;
  }

  return "No se pudo cargar la bandeja de trabajos. Intentá nuevamente.";
}

function PaperStatusChip({ status }: { status: PaperStatus }) {
  return (
    <Chip
      label={statusLabels[status]}
      size="small"
      variant="outlined"
      sx={{
        borderColor: statusColors[status],
        color: statusColors[status],
        bgcolor: "#FFFFFF",
        fontFamily: "var(--font-mono)",
        fontSize: "0.72rem",
        fontWeight: 600,
      }}
    />
  );
}

function PaymentStatusChip({ status }: { status: ParticipantPaymentStatus }) {
  return (
    <Chip
      label={paymentLabels[status]}
      size="small"
      sx={{
        bgcolor: "#F3EFEE",
        color: paymentColors[status],
        fontFamily: "var(--font-mono)",
        fontSize: "0.68rem",
        fontWeight: 600,
        height: "auto",
        "& .MuiChip-label": {
          display: "block",
          py: 0.35,
          whiteSpace: "normal",
        },
      }}
    />
  );
}

function getPaperAction(paper: ParticipantPaperSummary, congressCode: string) {
  const paperPath = `/congresses/${encodeURIComponent(congressCode)}/papers/${encodeURIComponent(paper.code)}`;

  if (paper.responsibleAuthor && paper.status === "NOT_SUBMITTED") {
    return {
      label: "Editar",
      to: `${paperPath}/edit`,
      variant: "contained" as const,
    };
  }

  if (paper.responsibleAuthor && paper.status === "NEEDS_REVISION") {
    return {
      label: "Corregir",
      to: `${paperPath}/correction`,
      variant: "contained" as const,
    };
  }

  if (paper.canUploadPayment) {
    return {
      label: "Subir comprobante",
      to: `/congresses/${encodeURIComponent(congressCode)}/payments/${encodeURIComponent(paper.code)}`,
      variant: "contained" as const,
    };
  }

  return { label: "Ver detalle", to: paperPath, variant: "outlined" as const };
}

function CreatePaperButton({
  congressCode,
  enabled,
  disabledMessage,
}: {
  congressCode: string;
  enabled: boolean;
  disabledMessage: string | null | undefined;
}) {
  if (enabled) {
    return (
      <Button
        component={RouterLink}
        to={`/congresses/${encodeURIComponent(congressCode)}/papers/new`}
        variant="contained"
        sx={{ whiteSpace: "nowrap" }}
      >
        + Crear nuevo trabajo
      </Button>
    );
  }

  return (
    <Tooltip title={disabledMessage ?? "No disponible"} arrow>
      <span>
        <Button variant="contained" disabled sx={{ whiteSpace: "nowrap" }}>
          + Crear nuevo trabajo
        </Button>
      </span>
    </Tooltip>
  );
}

export default function PaperInboxPage() {
  const { congressCode = "" } = useParams();
  const { user } = useAuth();
  const [requestsPaper, setRequestsPaper] = useState<ParticipantPaperSummary | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get("status");
  const status = isPaperStatus(statusParam) ? statusParam : undefined;
  const page = getPositiveInteger(searchParams.get("page"), 0);
  const size = getPositiveInteger(searchParams.get("size"), 10) || 10;
  const canLoad = Boolean(user && congressCode);

  const papers = useQuery({
    queryKey: [
      "participant-paper-inbox",
      user?.userId,
      congressCode,
      status,
      page,
      size,
    ],
    queryFn: ({ signal }) =>
      ParticipantPaperInboxService.getMyPapers(
        congressCode,
        { status, page, size },
        signal,
      ),
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

  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    setSearchParams(next, { replace: true });
  };

  if (!user) return null;

  if (!congressCode) {
    return <Alert severity="error">La ruta del congreso no es válida.</Alert>;
  }

  if (papers.isPending) {
    return (
      <Box
        role="status"
        sx={{ display: "flex", alignItems: "center", gap: 2, py: 4 }}
      >
        <CircularProgress size={24} />
        <Typography>Cargando tus trabajos…</Typography>
      </Box>
    );
  }

  if (papers.isError) {
    return (
      <Stack spacing={2} sx={{ width: "100%" }}>
        <Button
          component={RouterLink}
          to="/my-congresses"
          sx={{ alignSelf: "flex-start" }}
        >
          ← Volver al inicio
        </Button>
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => void papers.refetch()}>
              Reintentar
            </Button>
          }
        >
          {getInboxError(papers.error)}
        </Alert>
      </Stack>
    );
  }

  const paperPage = papers.data;
  const from = paperPage.totalElements === 0 ? 0 : page * size + 1;
  const to = Math.min((page + 1) * size, paperPage.totalElements);
  const canCreateAsParticipant = Boolean(
    participation.data?.active &&
    Boolean(participation.data.institution?.trim()) &&
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
      ? "Validando la disponibilidad para crear un trabajo."
      : participation.isError || congressRules.isError
        ? "No se pudo verificar si podés crear un trabajo en este momento."
        : !canCreateAsParticipant
          ? "Para crear un trabajo necesitás una participación activa como LISTENER o EXPOSITOR y una institución informada."
          : submissionAvailability?.message;

  return (
    <Stack spacing={2.5} sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.8rem",
              fontWeight: 700,
            }}
          >
            Bandeja de trabajos
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Consultá todos tus trabajos y filtrá rápidamente por evaluación o
            situación del pago.
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/my-congresses"
          variant="outlined"
          sx={{ flexShrink: 0 }}
        >
          ← Volver al inicio
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.75 }}>
        <Button component={RouterLink} to={`/congresses/${encodeURIComponent(congressCode)}/coauthorship`} variant="outlined" sx={{ mb: 2, display: "block", width: "fit-content" }}>
          Buscar trabajo para unirme
        </Button>
        <FormControl sx={{ minWidth: 340 }} size="small">
          <InputLabel id="paper-status-filter-label">
            Filtrar por estado
          </InputLabel>
          <Select
            labelId="paper-status-filter-label"
            id="paper-status-filter"
            label="Filtrar por estado"
            value={status ?? ""}
            onChange={(event) =>
              updateSearchParams({ status: event.target.value, page: "0" })
            }
          >
            <MenuItem value="">Todos los estados</MenuItem>
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        {papers.isFetching && <LinearProgress />}
        {(participation.isError || congressRules.isError) && (
          <Alert severity="warning" sx={{ m: 2.5, mb: 0 }}>
            No se pudo verificar la disponibilidad para crear trabajos. La
            bandeja y sus acciones continúan disponibles.
          </Alert>
        )}
        {paperPage.empty ? (
          <Alert severity="info" sx={{ m: 2.5 }}>
            {status
              ? "No hay trabajos con el estado seleccionado."
              : "Todavía no tenés trabajos asociados a este congreso."}
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table aria-label="Bandeja de trabajos científicos">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Trabajo</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Versión</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Dictamen</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Pago</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      Última actividad
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paperPage.content.map((paper) => {
                    const action = getPaperAction(paper, congressCode);

                    return (
                      <TableRow key={paper.code} hover>
                        <TableCell
                          sx={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.75rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {paper.code}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, maxWidth: 300 }}>
                          {paper.title || "Sin título todavía"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.75rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {paper.version}
                        </TableCell>
                        <TableCell>
                          <PaperStatusChip status={paper.status} />
                        </TableCell>
                        <TableCell>
                          <PaymentStatusChip status={paper.paymentStatus} />
                        </TableCell>
                        <TableCell sx={{ minWidth: 185 }}>
                          <Typography variant="body2" color="text.secondary">
                            {formatActivity(paper)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {canManageCoauthorship(paper) && <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => setRequestsPaper(paper)}>Solicitudes</Button>}
                          <Button
                            component={RouterLink}
                            to={action.to}
                            size="small"
                            variant={action.variant}
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            {action.label}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                px: 2,
                py: 0.5,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {from}–{to} de {paperPage.totalElements} trabajos
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TablePagination
                  component="div"
                  count={paperPage.totalElements}
                  page={paperPage.number}
                  onPageChange={(_, nextPage) =>
                    updateSearchParams({ page: String(nextPage) })
                  }
                  rowsPerPage={paperPage.size}
                  onRowsPerPageChange={(event) =>
                    updateSearchParams({ size: event.target.value, page: "0" })
                  }
                  rowsPerPageOptions={[5, 10, 20]}
                  labelRowsPerPage="Filas por página:"
                  labelDisplayedRows={({ from: first, to: last, count }) =>
                    `${first}–${last} de ${count}`
                  }
                  sx={{ borderTop: "none" }}
                />
                <CreatePaperButton
                  congressCode={congressCode}
                  enabled={canCreatePaper}
                  disabledMessage={createPaperDisabledMessage}
                />
              </Box>
            </Box>
          </>
        )}
        {paperPage.empty && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              px: 2,
              pb: 2,
            }}
          >
            <CreatePaperButton
              congressCode={congressCode}
              enabled={canCreatePaper}
              disabledMessage={createPaperDisabledMessage}
            />
          </Box>
        )}
      </Paper>
      {requestsPaper && <CoauthorshipRequestsDialog key={`${congressCode}:${requestsPaper.code}`} congressCode={congressCode} paperCode={requestsPaper.code} title={requestsPaper.title} onClose={() => setRequestsPaper(null)} />}
    </Stack>
  );
}
