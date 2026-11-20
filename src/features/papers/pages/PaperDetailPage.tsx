import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
  Link as RouterLink,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useAuth } from "../../auth/context/AuthContext";
import { PaperSubmissionService } from "../api/PaperSubmissionService";
import type {
  PaperDetail,
  PaperEvaluation,
  PaperStatus,
} from "../types/paperSubmission";

const statusLabels: Record<PaperStatus, string> = {
  NOT_SUBMITTED: "Borrador",
  UNDER_EVALUATION: "En evaluación",
  ACCEPTED: "Aceptado",
  REJECTED: "Rechazado",
  NEEDS_REVISION: "Con observaciones",
};

const statusColors: Record<PaperStatus, string> = {
  NOT_SUBMITTED: "#6F6468",
  UNDER_EVALUATION: "#7A1F3A",
  ACCEPTED: "#2E6B4F",
  REJECTED: "#9D2F3E",
  NEEDS_REVISION: "#9B6B1F",
};

type DetailNotice = {
  message: string;
  severity: "success" | "error";
};

function formatDateTime(value: string | null) {
  if (!value) return "Aún no enviado";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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

function EvaluatedContent({ paper }: { paper: PaperDetail }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, p: 3.25 }}>
      <Typography
        component="h2"
        sx={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.35rem",
          fontWeight: 700,
        }}
      >
        Contenido evaluado · Versión {paper.version}
      </Typography>

      <Box sx={{ mt: 2.25 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          Título
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: "1rem", fontWeight: 700 }}>
          {paper.title}
        </Typography>
      </Box>

      <Box sx={{ mt: 2.25 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          Palabras clave
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
          {paper.keywords.map((keyword) => (
            <Chip
              key={keyword}
              label={keyword}
              size="small"
              sx={{
                bgcolor: "#F3E1E6",
                color: "text.primary",
                fontWeight: 600,
              }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ mt: 2.25 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
          Resumen
        </Typography>
        {/* El backend restringe y sanitiza este HTML antes de persistirlo. */}
        <Box
          sx={{
            bgcolor: "#F3EFEE",
            border: 1,
            borderColor: "divider",
            borderRadius: 1.5,
            px: 2,
            py: 1.5,
            lineHeight: 1.65,
            "& > :first-of-type": { mt: 0 },
            "& > :last-child": { mb: 0 },
            "& blockquote": {
              borderLeft: 3,
              borderColor: "primary.main",
              color: "text.secondary",
              m: 0,
              px: 1.5,
            },
          }}
          dangerouslySetInnerHTML={{ __html: paper.summary }}
        />
      </Box>
    </Paper>
  );
}

function ComplementaryData({ paper }: { paper: PaperDetail }) {
  const acceptedAuthors = [...(paper.authors ?? [])]
    .filter((author) => author.status === "ACCEPTED")
    .sort((first, second) => first.authorOrder - second.authorOrder);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, p: 3.25 }}>
      <Typography
        component="h2"
        sx={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.35rem",
          fontWeight: 700,
        }}
      >
        Datos complementarios
      </Typography>

      <Box sx={{ mt: 2.25 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          Área temática
        </Typography>
        <Typography sx={{ mt: 0.5, fontWeight: 600 }}>
          {paper.thematicArea}
        </Typography>
      </Box>

      <Box sx={{ mt: 2.25 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
          Autores
        </Typography>
        {acceptedAuthors.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            No hay autores aceptados para mostrar.
          </Typography>
        ) : (
          <Box
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1.5,
              overflow: "hidden",
            }}
          >
            {acceptedAuthors.map((author, index) => (
              <Box
                key={author.userCode}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 3,
                  px: 2,
                  py: 1.25,
                  borderBottom: index === acceptedAuthors.length - 1 ? 0 : 1,
                  borderColor: "divider",
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>
                    {author.fullName}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {author.institution || "Institución no informada"}
                  </Typography>
                </Box>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{
                    flexShrink: 0,
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                  }}
                >
                  {author.mainAuthor ? "Autor principal" : "Coautor"}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
}

function EvaluationHistory({
  evaluations,
}: {
  evaluations: PaperEvaluation[];
}) {
  if (evaluations.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        Todavía no hay evaluaciones liberadas para este trabajo.
      </Typography>
    );
  }

  return (
    <Stack spacing={2.5} sx={{ mt: 2.25 }}>
      {evaluations.map((evaluation, index) => (
        <Box
          key={`${evaluation.evaluatedVersion}-${evaluation.evaluationDate}`}
          sx={{
            borderBottom: index === evaluations.length - 1 ? 0 : 1,
            borderColor: "divider",
            pb: index === evaluations.length - 1 ? 0 : 2.5,
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
            <Box>
              <Typography sx={{ fontWeight: 700 }}>
                Evaluación {evaluations.length - index}
              </Typography>
              <Typography
                color="text.secondary"
                variant="body2"
                sx={{ mt: 0.5 }}
              >
                Versión {evaluation.evaluatedVersion} ·{" "}
                {formatDateTime(evaluation.evaluationDate)}
                {/* La identidad sólo se muestra si el backend la autoriza. */}
                {evaluation.evaluatorFullName
                  ? ` · ${evaluation.evaluatorFullName}`
                  : ""}
              </Typography>
            </Box>
            <PaperStatusChip status={evaluation.newStatus} />
          </Box>

          <Box
            sx={{
              bgcolor: "#F3EFEE",
              border: 1,
              borderColor: "divider",
              borderRadius: 1.5,
              mt: 1.5,
              px: 2,
              py: 1.5,
            }}
          >
            <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
              {evaluation.feedback}
            </Typography>
          </Box>

          {evaluation.newStatus === "NEEDS_REVISION" &&
            evaluation.newDeadline && (
              <Typography
                color="text.secondary"
                variant="body2"
                sx={{ mt: 1.25 }}
              >
                Fecha límite para corregir:{" "}
                {formatDateTime(evaluation.newDeadline)}
              </Typography>
            )}
        </Box>
      ))}
    </Stack>
  );
}

function getLoadError(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    if (error.response?.status === 401) {
      return "Tu sesión no es válida. Volvé a iniciar sesión para continuar.";
    }
    if (error.response?.status === 403) {
      return "No tenés permisos para consultar este trabajo o debés completar tu institución en el congreso.";
    }
    if (error.response?.status === 404) {
      return "No se encontró el trabajo solicitado.";
    }
    if (error.response?.data?.message) return error.response.data.message;
  }

  return "No se pudo cargar el detalle del trabajo. Intentá nuevamente.";
}

export default function PaperDetailPage() {
  const { congressCode = "", paperCode = "" } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const routeNotice = location.state?.paperDetailNotice as
    DetailNotice | undefined;
  const canLoad = !!user && !!congressCode && !!paperCode;

  const paper = useQuery({
    queryKey: ["paper-detail", user?.userId, paperCode],
    queryFn: ({ signal }) => PaperSubmissionService.getPaper(paperCode, signal),
    enabled: canLoad,
    retry: false,
  });

  const participation = useQuery({
    queryKey: ["paper-detail-participation", user?.userId, congressCode],
    queryFn: ({ signal }) =>
      PaperSubmissionService.getMyParticipation(congressCode, signal),
    enabled: !!user && !!congressCode,
    retry: false,
  });

  const paperMatchesCongress = paper.data?.congressCode === congressCode;
  const evaluations = useQuery({
    queryKey: ["paper-evaluations", user?.userId, paperCode],
    queryFn: ({ signal }) =>
      PaperSubmissionService.getEvaluations(paperCode, signal),
    enabled: canLoad && paperMatchesCongress,
    retry: false,
  });

  if (!user) return null;

  if (!congressCode || !paperCode) {
    return <Alert severity="error">La ruta del trabajo no es válida.</Alert>;
  }

  if (paper.isPending || participation.isPending) {
    return (
      <Box
        role="status"
        sx={{ display: "flex", alignItems: "center", gap: 2, py: 4 }}
      >
        <CircularProgress size={24} />
        <Typography>Cargando detalle del trabajo…</Typography>
      </Box>
    );
  }

  if (paper.isError || participation.isError) {
    const error = paper.error ?? participation.error;

    return (
      <Stack spacing={2} sx={{ width: "100%" }}>
        <Button
          component={RouterLink}
          to="/congresses"
          sx={{ alignSelf: "flex-start" }}
        >
          ← Volver a Mis trabajos
        </Button>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              onClick={() => {
                void paper.refetch();
                void participation.refetch();
              }}
            >
              Reintentar
            </Button>
          }
        >
          {getLoadError(error)}
        </Alert>
      </Stack>
    );
  }

  if (!paper.data || !paperMatchesCongress) {
    return (
      <Stack spacing={2} sx={{ width: "100%" }}>
        <Button
          component={RouterLink}
          to="/congresses"
          sx={{ alignSelf: "flex-start" }}
        >
          ← Volver a Mis trabajos
        </Button>
        <Alert severity="error">
          El trabajo no pertenece al congreso seleccionado.
        </Alert>
      </Stack>
    );
  }

  const isResponsibleAuthor = paper.data.authors?.some(
    (author) =>
      author.mainAuthor && author.userCode === participation.data?.user.code,
  );
  const canShowCorrectionAction =
    paper.data.status === "NEEDS_REVISION" && isResponsibleAuthor;

  return (
    <Stack spacing={2.5} sx={{ width: "100%" }}>
      <Box>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.8rem",
            fontWeight: 700,
          }}
        >
          Detalle del trabajo · {paper.data.code}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
          {paper.data.congressName} · Vista completa del trabajo, sus datos y
          observaciones.
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          p: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Dictamen:
            </Typography>
            <PaperStatusChip status={paper.data.status} />
          </Stack>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
            {paper.data.submittedAt
              ? `Enviado el ${formatDateTime(paper.data.submittedAt)}`
              : "El trabajo todavía no fue enviado a evaluación."}
          </Typography>
          {paper.data.reviewerFullName && (
            <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
              Evaluador asignado: {paper.data.reviewerFullName}
            </Typography>
          )}
        </Box>
        <Button
          component={RouterLink}
          to="/congresses"
          variant="outlined"
          sx={{ flexShrink: 0 }}
        >
          ← Volver a Mis trabajos
        </Button>
      </Paper>

      <EvaluatedContent paper={paper.data} />
      <ComplementaryData paper={paper.data} />

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderLeft: 3,
          borderLeftColor: "#B78422",
          p: 3.25,
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.35rem",
            fontWeight: 700,
          }}
        >
          Seguimiento de la revisión
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mt: 0.75 }}>
          Las evaluaciones liberadas se muestran desde la más reciente.
        </Typography>
        {evaluations.isPending && (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <CircularProgress size={20} />
            <Typography color="text.secondary">Cargando historial…</Typography>
          </Stack>
        )}
        {evaluations.isError && (
          <Alert
            severity="error"
            sx={{ mt: 2 }}
            action={
              <Button
                color="inherit"
                onClick={() => void evaluations.refetch()}
              >
                Reintentar
              </Button>
            }
          >
            {getLoadError(evaluations.error)}
          </Alert>
        )}
        {evaluations.isSuccess && (
          <EvaluationHistory evaluations={evaluations.data} />
        )}
        {canShowCorrectionAction && (
          <Box sx={{ mt: 2.5 }}>
            <Button
              component={RouterLink}
              to={`/congresses/${encodeURIComponent(congressCode)}/papers/${encodeURIComponent(paper.data.code)}/correction`}
              variant="contained"
            >
              Corregir y reenviar
            </Button>
          </Box>
        )}
      </Paper>
      <Snackbar
        open={!!routeNotice}
        autoHideDuration={6000}
        onClose={() =>
          navigate(location.pathname, { replace: true, state: null })
        }
      >
        <Alert
          severity={routeNotice?.severity}
          variant="filled"
          onClose={() =>
            navigate(location.pathname, { replace: true, state: null })
          }
          sx={{ width: "100%" }}
        >
          {routeNotice?.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
