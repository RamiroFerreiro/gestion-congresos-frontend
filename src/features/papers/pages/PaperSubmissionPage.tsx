import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../../auth/context/AuthContext";
import { PaperSubmissionService } from "../api/PaperSubmissionService";
import PaperSummaryEditor from "../components/PaperSummaryEditor";
import {
  createPaperSubmissionSchema,
  parseKeywords,
} from "../schemas/paperSubmissionSchema";
import type {
  CreatePaperRequest,
  PaperCongressRules,
  PaperDetail,
  PaperEvaluation,
  PaperSubmissionFormValues,
  UpdatePaperRequest,
} from "../types/paperSubmission";

type SubmissionNotice = {
  message: string;
  severity: "success" | "error";
};

type SubmissionAvailability = {
  isOpen: boolean;
  message: string | null;
};

type SubmissionMode = "submission" | "correction";

function getLoadError(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 404) {
      return "No se encontró el congreso o no tenés una participación activa en él.";
    }
    if (error.response?.status === 401) {
      return "Tu sesión no es válida. Volvé a iniciar sesión para continuar.";
    }
    if (error.response?.status === 403) {
      return "No tenés permisos para crear trabajos en este congreso.";
    }
  }

  return "No se pudo cargar la información necesaria para operar el trabajo.";
}

function getMutationError(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    if (error.response?.status === 409) {
      return "El trabajo tiene solicitudes de coautoría pendientes.";
    }
    if (error.response?.data?.message) return error.response.data.message;
  }

  return "No se pudo completar la operación. Revisá los datos e intentá nuevamente.";
}

function hasPendingAuthorRequests(error: unknown) {
  return isAxiosError(error) && error.response?.status === 409;
}

function normalizeKeyword(keyword: string) {
  return keyword.trim().toLocaleLowerCase("es-AR");
}

function getSubmissionAvailability(
  congress: PaperCongressRules,
  now = new Date(),
): SubmissionAvailability {
  if (!congress.enabled) {
    return {
      isOpen: false,
      message:
        "El congreso se encuentra deshabilitado para la presentación de trabajos.",
    };
  }

  const start = new Date(congress.presentationStartDate);
  const end = new Date(congress.presentationEndDate);
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start > end
  ) {
    return {
      isOpen: false,
      message:
        "El período de presentación del congreso no tiene fechas válidas.",
    };
  }

  if (now < start) {
    return {
      isOpen: false,
      message:
        "La presentación de trabajos todavía no se encuentra habilitada.",
    };
  }

  if (now > end) {
    return {
      isOpen: false,
      message: "El período de presentación de trabajos ya finalizó.",
    };
  }

  return { isOpen: true, message: null };
}

function getCorrectionAvailability(
  congress: PaperCongressRules,
  evaluation: PaperEvaluation | undefined,
  now = new Date(),
): SubmissionAvailability {
  if (!congress.enabled) {
    return {
      isOpen: false,
      message: "El congreso se encuentra deshabilitado para corregir trabajos.",
    };
  }

  if (!evaluation || !evaluation.newDeadline) {
    return {
      isOpen: false,
      message:
        "No hay una evaluación liberada con fecha límite disponible para esta corrección.",
    };
  }

  const deadline = new Date(evaluation.newDeadline);
  if (Number.isNaN(deadline.getTime())) {
    return {
      isOpen: false,
      message: "La fecha límite de corrección no es válida.",
    };
  }

  if (now > deadline) {
    return {
      isOpen: false,
      message: "La fecha límite para reenviar la corrección ya venció.",
    };
  }

  return { isOpen: true, message: null };
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

interface PaperSubmissionFormProps {
  congress: PaperCongressRules;
  responsibleAuthor: {
    fullName: string;
    institution: string | null;
  };
  paper?: PaperDetail;
  mode: SubmissionMode;
  correctionEvaluation?: PaperEvaluation;
  canSave: boolean;
  canSubmit: boolean;
  canRemoveAuthors: boolean;
  isSaving: boolean;
  isRemovingAuthor: boolean;
  onSave: (values: PaperSubmissionFormValues) => Promise<void>;
  onSubmitPaper: (values: PaperSubmissionFormValues) => Promise<void>;
  onRemoveAuthor: (authorUserCode: string) => Promise<void>;
}

function getKeywordRule(congress: PaperCongressRules) {
  const min = congress.minKeywords;
  const max = congress.maxKeywords;
  const titleRule = congress.keywordRepetition ? ", sin repetir el título" : "";

  if (min && max) return `Entre ${min} y ${max}${titleRule}`;
  if (min) return `Mínimo ${min}${titleRule}`;
  if (max) return `Hasta ${max}${titleRule}`;

  return congress.keywordRepetition
    ? "Sin repetir el título"
    : "Sin límite definido";
}

function CongressRequirements({ congress }: { congress: PaperCongressRules }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderColor: "divider",
        borderLeft: 3,
        borderLeftColor: "primary.main",
        borderRadius: 1.5,
        px: 2.75,
        py: 2.25,
      }}
    >
      <Typography
        component="h2"
        sx={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.2rem",
          fontWeight: 600,
        }}
      >
        Requisitos del congreso
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
        Estas condiciones fueron definidas por la organización y se validarán al
        enviar el trabajo.
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 3,
          mt: 2,
        }}
      >
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Palabras clave
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.25 }}>
            {getKeywordRule(congress)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Autores
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.25 }}>
            Hasta {congress.maxNumberOfAuthors} por trabajo
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function PaperAuthors({
  maxNumberOfAuthors,
  responsibleAuthor,
  paper,
  canRemoveAuthors,
  showAuthorActions,
  readOnly,
  isBusy,
  onRemoveAuthor,
}: {
  maxNumberOfAuthors: number;
  responsibleAuthor: PaperSubmissionFormProps["responsibleAuthor"];
  paper?: PaperDetail;
  canRemoveAuthors: boolean;
  showAuthorActions: boolean;
  readOnly: boolean;
  isBusy: boolean;
  onRemoveAuthor: (authorUserCode: string) => Promise<void>;
}) {
  const acceptedAuthors = paper
    ? [...paper.authors]
        .filter((author) => author.status === "ACCEPTED")
        .sort((first, second) => first.authorOrder - second.authorOrder)
    : [];
  const authors =
    acceptedAuthors.length > 0
      ? acceptedAuthors
      : [
          {
            userCode: "responsible-author",
            fullName: responsibleAuthor.fullName,
            institution:
              responsibleAuthor.institution || "Institución sin informar",
            mainAuthor: true,
          },
        ];

  return (
    <Paper
      variant="outlined"
      sx={{ borderColor: "divider", borderRadius: 2, p: 3 }}
    >
      <Typography
        component="h2"
        sx={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.45rem",
          fontWeight: 600,
        }}
      >
        Autores
        <Box
          component="span"
          sx={{ color: "text.secondary", fontSize: "1.1rem" }}
        >
          {" "}
          — {authors.length} de {maxNumberOfAuthors} autores
        </Box>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
        {readOnly
          ? "Los autores aceptados se conservan sin cambios durante la corrección del trabajo."
          : paper
            ? "Se muestran los autores aceptados. Los coautores se incorporan mediante solicitudes externas al trabajo."
            : "Al crear el borrador, figurás como autor responsable. Los demás autores podrán solicitar incorporarse al trabajo y deberás aceptar su solicitud."}
      </Typography>
      <Stack spacing={1.5} sx={{ mt: 2.25 }}>
        {authors.map((author) => (
          <Box
            key={author.userCode}
            sx={{
              display: "grid",
              gridTemplateColumns: showAuthorActions
                ? "minmax(0, 1fr) minmax(0, 1fr) auto"
                : "minmax(0, 1fr) minmax(0, 1fr)",
              gap: 2,
              alignItems: "center",
            }}
          >
            <TextField
              label={author.mainAuthor ? "Autor responsable" : "Coautor"}
              value={author.fullName}
              fullWidth
              slotProps={{ input: { readOnly: true } }}
            />
            <TextField
              label="Institución"
              value={author.institution || "Institución sin informar"}
              fullWidth
              slotProps={{ input: { readOnly: true } }}
            />
            {!author.mainAuthor && paper && showAuthorActions && (
              <Button
                aria-label={`Quitar a ${author.fullName} del trabajo`}
                color="error"
                disabled={!canRemoveAuthors || isBusy}
                onClick={() => void onRemoveAuthor(author.userCode)}
                sx={{ minWidth: 40, px: 1, fontSize: "1.5rem" }}
              >
                ×
              </Button>
            )}
            {author.mainAuthor && showAuthorActions && (
              <Box aria-hidden="true" sx={{ width: 40 }} />
            )}
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

function CorrectionReview({ evaluation }: { evaluation: PaperEvaluation }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderColor: "#B78422",
        borderLeft: 3,
        borderRadius: 1.5,
        p: 2.75,
      }}
    >
      <Typography
        component="h2"
        sx={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.2rem",
          fontWeight: 600,
        }}
      >
        Observación a corregir
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
        Evaluación de la versión {evaluation.evaluatedVersion} ·{" "}
        {formatDateTime(evaluation.evaluationDate)}
        {evaluation.evaluatorFullName
          ? ` · ${evaluation.evaluatorFullName}`
          : ""}
      </Typography>
      <Box
        sx={{
          bgcolor: "#F3EFEE",
          border: 1,
          borderColor: "divider",
          borderRadius: 1.5,
          mt: 1.75,
          px: 2,
          py: 1.5,
        }}
      >
        <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
          {evaluation.feedback}
        </Typography>
      </Box>
      {evaluation.newDeadline && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25 }}>
          Fecha límite para corregir: {formatDateTime(evaluation.newDeadline)}
        </Typography>
      )}
    </Paper>
  );
}

function PaperSubmissionForm({
  congress,
  responsibleAuthor,
  paper,
  mode,
  correctionEvaluation,
  canSave,
  canSubmit,
  canRemoveAuthors,
  isSaving,
  isRemovingAuthor,
  onSave,
  onSubmitPaper,
  onRemoveAuthor,
}: PaperSubmissionFormProps) {
  const form = useForm<PaperSubmissionFormValues>({
    resolver: zodResolver(createPaperSubmissionSchema(congress)),
    defaultValues: {
      title: "",
      thematicArea: "",
      keywords: "",
      summary: "",
    },
  });

  useEffect(() => {
    if (!paper) return;

    form.reset({
      title: paper.title,
      thematicArea: paper.thematicArea,
      keywords: paper.keywords.join(", "),
      summary: paper.summary,
    });
  }, [form, paper]);

  const handleSubmitPaper = async (values: PaperSubmissionFormValues) => {
    const strictValidation = createPaperSubmissionSchema(congress, {
      enforceMinimumKeywords: true,
    }).safeParse(values);

    if (!strictValidation.success) {
      for (const issue of strictValidation.error.issues) {
        const field = issue.path[0];
        if (
          field === "title" ||
          field === "thematicArea" ||
          field === "keywords" ||
          field === "summary"
        ) {
          form.setError(field, { message: issue.message });
        }
      }
      return;
    }

    await onSubmitPaper(values);
  };
  const isBusy = isSaving || isRemovingAuthor;
  const isCorrection = mode === "correction";
  const cancelPath = paper
    ? `/congresses/${encodeURIComponent(paper.congressCode)}/papers/${encodeURIComponent(paper.code)}`
    : "/congresses";

  return (
    <Stack
      component="form"
      noValidate
      spacing={3}
      onSubmit={(event) => event.preventDefault()}
    >
      <Box>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.04em",
            mb: 0.75,
          }}
        >
          {congress.name}
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-serif)",
            fontSize: "2rem",
            fontWeight: 600,
          }}
        >
          {isCorrection
            ? "Corrección del trabajo"
            : "Envío de trabajo científico"}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
          {isCorrection
            ? "Actualizá la versión solicitada antes de la fecha límite de corrección."
            : "Completá la información que será evaluada por el congreso."}
        </Typography>
      </Box>

      {isCorrection && correctionEvaluation && (
        <CorrectionReview evaluation={correctionEvaluation} />
      )}

      <CongressRequirements congress={congress} />

      <Paper
        variant="outlined"
        sx={{ borderColor: "divider", borderRadius: 2, p: 3 }}
      >
        <Stack spacing={2.5}>
          <Typography
            component="h2"
            sx={{ fontFamily: "var(--font-serif)", fontSize: "1.45rem" }}
          >
            Datos del trabajo
          </Typography>
          <TextField
            {...form.register("title")}
            label="Título del trabajo"
            placeholder="Ej.: Efecto del envasado activo en frutas mínimamente procesadas"
            required
            fullWidth
            disabled={!canSave || isBusy}
            error={!!form.formState.errors.title}
            helperText={form.formState.errors.title?.message}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
              gap: 2,
            }}
          >
            <Controller
              control={form.control}
              name="thematicArea"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Área temática"
                  required
                  fullWidth
                  disabled={!canSave || isBusy}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  {congress.thematicAreas.map((area) => (
                    <MenuItem key={area} value={area}>
                      {area}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <TextField
              {...form.register("keywords")}
              label="Palabras clave"
              required
              fullWidth
              disabled={!canSave || isBusy}
              error={!!form.formState.errors.keywords}
              helperText={
                form.formState.errors.keywords?.message ||
                `Separalas con comas. ${getKeywordRule(congress)}.`
              }
            />
          </Box>
        </Stack>
      </Paper>

      <PaperAuthors
        maxNumberOfAuthors={congress.maxNumberOfAuthors}
        responsibleAuthor={responsibleAuthor}
        paper={paper}
        canRemoveAuthors={canRemoveAuthors}
        showAuthorActions={!!paper && !isCorrection}
        readOnly={isCorrection}
        isBusy={isBusy}
        onRemoveAuthor={onRemoveAuthor}
      />

      <Paper
        variant="outlined"
        sx={{ borderColor: "divider", borderRadius: 2, p: 3 }}
      >
        <Typography
          component="h2"
          sx={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.45rem",
            fontWeight: 600,
          }}
        >
          Resumen
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Controller
            control={form.control}
            name="summary"
            render={({ field, fieldState }) => (
              <PaperSummaryEditor
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                disabled={!canSave || isBusy}
              />
            )}
          />
        </Box>
      </Paper>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Button
          variant="contained"
          disabled={!canSubmit || isBusy}
          onClick={() => void form.handleSubmit(handleSubmitPaper)()}
        >
          {isCorrection ? "Reenviar versión corregida" : "Enviar trabajo"}
        </Button>
        <Button
          variant="outlined"
          disabled={!canSave || isBusy}
          onClick={() => void form.handleSubmit(onSave)()}
        >
          {isCorrection ? "Guardar cambios" : "Guardar borrador"}
        </Button>
        <Button component={RouterLink} to={cancelPath} color="inherit">
          Cancelar
        </Button>
      </Box>
    </Stack>
  );
}

export default function PaperSubmissionPage() {
  const { congressCode = "", paperCode } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isCorrection = !!paperCode && location.pathname.endsWith("/correction");
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState<SubmissionNotice | null>(null);
  const [pendingSubmissionCode, setPendingSubmissionCode] = useState<
    string | null
  >(null);
  const routeNotice = location.state?.paperSubmissionNotice as
    SubmissionNotice | undefined;
  const routePendingSubmissionCode = location.state
    ?.paperSubmissionPendingCode as string | undefined;
  const paperQueryKey = ["paper-submission-paper", user?.userId, paperCode];
  const congress = useQuery({
    queryKey: ["paper-submission-congress", user?.userId, congressCode],
    queryFn: ({ signal }) =>
      PaperSubmissionService.getCongressRules(congressCode, signal),
    enabled: !!user && !!congressCode,
    retry: false,
  });
  const paper = useQuery({
    queryKey: paperQueryKey,
    queryFn: ({ signal }) =>
      PaperSubmissionService.getPaper(paperCode!, signal),
    enabled: !!user && !!paperCode,
    retry: false,
  });
  const correctionEvaluations = useQuery({
    queryKey: ["paper-correction-evaluations", user?.userId, paperCode],
    queryFn: ({ signal }) =>
      PaperSubmissionService.getEvaluations(paperCode!, signal),
    enabled:
      !!user &&
      !!paperCode &&
      isCorrection &&
      paper.isSuccess &&
      paper.data?.congressCode === congressCode,
    retry: false,
  });
  const participation = useQuery({
    queryKey: ["paper-submission-participation", user?.userId, congressCode],
    queryFn: ({ signal }) =>
      PaperSubmissionService.getMyParticipation(congressCode, signal),
    enabled: !!user && !!congressCode,
    retry: false,
  });
  const createPaper = useMutation({
    mutationFn: (payload: CreatePaperRequest) =>
      PaperSubmissionService.createPaper(payload),
  });
  const updatePaper = useMutation({
    mutationFn: ({
      paperCode: code,
      payload,
    }: {
      paperCode: string;
      payload: UpdatePaperRequest;
    }) => PaperSubmissionService.updatePaper(code, payload),
  });
  const removeAuthor = useMutation({
    mutationFn: ({
      paperCode: code,
      authorUserCode,
    }: {
      paperCode: string;
      authorUserCode: string;
    }) => PaperSubmissionService.removeAuthor(code, authorUserCode),
  });
  const submitPaper = useMutation({
    mutationFn: ({
      paperCode: code,
      confirmDiscardPendingRequests = false,
    }: {
      paperCode: string;
      confirmDiscardPendingRequests?: boolean;
    }) =>
      PaperSubmissionService.submitPaper(code, confirmDiscardPendingRequests),
  });

  if (!user) return null;

  if (
    congress.isPending ||
    participation.isPending ||
    (!!paperCode && paper.isPending) ||
    (isCorrection && correctionEvaluations.isPending)
  ) {
    return (
      <Box
        role="status"
        sx={{ display: "flex", alignItems: "center", gap: 2, py: 4 }}
      >
        <CircularProgress size={24} />
        <Typography>Cargando información del congreso…</Typography>
      </Box>
    );
  }

  if (
    congress.isError ||
    participation.isError ||
    (!!paperCode && paper.isError) ||
    (isCorrection && correctionEvaluations.isError)
  ) {
    return (
      <Stack spacing={2}>
        <Button
          component={RouterLink}
          to="/congresses"
          sx={{ alignSelf: "flex-start" }}
        >
          Volver a mis congresos
        </Button>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              onClick={() => {
                void congress.refetch();
                void participation.refetch();
                void paper.refetch();
                void correctionEvaluations.refetch();
              }}
            >
              Reintentar
            </Button>
          }
        >
          {getLoadError(
            congress.error ??
              participation.error ??
              paper.error ??
              correctionEvaluations.error,
          )}
        </Alert>
      </Stack>
    );
  }

  const participant = participation.data;
  const canAccessSubmission =
    participant.active &&
    !!participant.institution?.trim() &&
    (participant.role === "LISTENER" || participant.role === "EXPOSITOR");

  if (!canAccessSubmission) {
    return (
      <Stack spacing={2}>
        <Button
          component={RouterLink}
          to="/congresses"
          sx={{ alignSelf: "flex-start" }}
        >
          Volver a mis congresos
        </Button>
        <Alert severity="warning">
          Para crear un trabajo necesitás una participación activa como LISTENER
          o EXPOSITOR y una institución informada en este congreso.
        </Alert>
      </Stack>
    );
  }

  if (paper.data && paper.data.congressCode !== congressCode) {
    return (
      <Alert severity="error">
        El trabajo no pertenece al congreso seleccionado.
      </Alert>
    );
  }

  const isResponsible =
    !paper.data ||
    paper.data.authors.some(
      (author) =>
        author.mainAuthor && author.userCode === participant.user.code,
    );
  const latestCorrectionEvaluation = correctionEvaluations.data?.find(
    (evaluation) => evaluation.newStatus === "NEEDS_REVISION",
  );
  const canEditPaper =
    (!isCorrection && !paper.data) ||
    (!isCorrection &&
      paper.data?.status === "NOT_SUBMITTED" &&
      isResponsible) ||
    (isCorrection && paper.data?.status === "NEEDS_REVISION" && isResponsible);
  const submissionAvailability = isCorrection
    ? getCorrectionAvailability(congress.data, latestCorrectionEvaluation)
    : getSubmissionAvailability(congress.data);
  const acceptedAuthorCount = paper.data
    ? paper.data.authors.filter((author) => author.status === "ACCEPTED").length
    : 1;
  const exceedsAuthorLimit =
    acceptedAuthorCount > congress.data.maxNumberOfAuthors;
  const canSave = canEditPaper && submissionAvailability.isOpen;
  const canSubmit = canSave && !exceedsAuthorLimit;
  const canRemoveAuthors = canSave && !isCorrection;
  const isBusy =
    createPaper.isPending ||
    updatePaper.isPending ||
    removeAuthor.isPending ||
    submitPaper.isPending;
  const displayedNotice = notice ?? routeNotice;
  const displayedPendingSubmissionCode =
    pendingSubmissionCode ?? routePendingSubmissionCode;
  const editPath = (newPaperCode: string) =>
    `/congresses/${encodeURIComponent(congressCode)}/papers/${encodeURIComponent(newPaperCode)}/edit`;
  const detailPath = (currentPaperCode: string) =>
    `/congresses/${encodeURIComponent(congressCode)}/papers/${encodeURIComponent(currentPaperCode)}`;
  const refreshPaper = async () => {
    await queryClient.invalidateQueries({ queryKey: paperQueryKey });
    await paper.refetch();
  };
  const clearRoutePendingSubmission = () => {
    if (!routePendingSubmissionCode) return;
    navigate(location.pathname, {
      replace: true,
      state: routeNotice ? { paperSubmissionNotice: routeNotice } : null,
    });
  };
  const closeNotice = () => {
    setNotice(null);
    if (routeNotice) {
      navigate(location.pathname, {
        replace: true,
        state: routePendingSubmissionCode
          ? { paperSubmissionPendingCode: routePendingSubmissionCode }
          : null,
      });
    }
  };
  const buildCreatePayload = (
    values: PaperSubmissionFormValues,
  ): CreatePaperRequest => ({
    title: values.title.trim(),
    thematicArea: values.thematicArea,
    summary: values.summary,
    keywords: parseKeywords(values.keywords),
    congressCode,
    authorUserCodes: [participant.user.code],
  });
  const moveToCreatedPaper = (
    createdPaper: PaperDetail,
    nextNotice: SubmissionNotice,
  ) => {
    navigate(editPath(createdPaper.code), {
      replace: true,
      state: { paperSubmissionNotice: nextNotice },
    });
  };
  const persistExistingDraft = async (values: PaperSubmissionFormValues) => {
    if (!paper.data) return;

    const currentPaper = paper.data;
    const nextKeywords = parseKeywords(values.keywords);
    const currentKeywordValues = new Set(
      currentPaper.keywords.map(normalizeKeyword),
    );
    const nextKeywordValues = new Set(nextKeywords.map(normalizeKeyword));
    const keywordsToRemove = currentPaper.keywords.filter(
      (keyword) => !nextKeywordValues.has(normalizeKeyword(keyword)),
    );
    const keywordsToAdd = nextKeywords.filter(
      (keyword) => !currentKeywordValues.has(normalizeKeyword(keyword)),
    );

    try {
      await updatePaper.mutateAsync({
        paperCode: currentPaper.code,
        payload: {
          title: values.title.trim(),
          thematicArea: values.thematicArea,
          summary: values.summary,
        },
      });
      await Promise.all(
        keywordsToRemove.map((keyword) =>
          PaperSubmissionService.removeKeyword(currentPaper.code, keyword),
        ),
      );
      await Promise.all(
        keywordsToAdd.map((keyword) =>
          PaperSubmissionService.addKeyword(currentPaper.code, keyword),
        ),
      );
    } finally {
      await refreshPaper();
    }
  };
  const completeSubmission = async (
    code: string,
    createdPaper?: PaperDetail,
  ) => {
    await submitPaper.mutateAsync({ paperCode: code });

    if (createdPaper) {
      moveToCreatedPaper(createdPaper, {
        message: "El trabajo se envió a evaluación correctamente.",
        severity: "success",
      });
      return;
    }

    await refreshPaper();
    setNotice({
      message: "El trabajo se envió a evaluación correctamente.",
      severity: "success",
    });
  };
  const requestSubmission = async (
    code: string,
    createdPaper?: PaperDetail,
  ) => {
    try {
      await completeSubmission(code, createdPaper);
    } catch (error) {
      if (hasPendingAuthorRequests(error)) {
        if (createdPaper) {
          navigate(editPath(code), {
            replace: true,
            state: { paperSubmissionPendingCode: code },
          });
        } else {
          setPendingSubmissionCode(code);
        }
        return;
      }
      throw error;
    }
  };
  const handleSave = async (values: PaperSubmissionFormValues) => {
    try {
      if (paper.data) {
        await persistExistingDraft(values);
        setNotice({
          message: isCorrection
            ? "Los cambios de la corrección se guardaron correctamente."
            : "El borrador se actualizó correctamente.",
          severity: "success",
        });
        return;
      }

      const createdPaper = await createPaper.mutateAsync(
        buildCreatePayload(values),
      );
      moveToCreatedPaper(createdPaper, {
        message: "El borrador se guardó correctamente.",
        severity: "success",
      });
    } catch (error) {
      setNotice({ message: getMutationError(error), severity: "error" });
    }
  };
  const handleSubmitPaper = async (values: PaperSubmissionFormValues) => {
    try {
      if (paper.data) {
        await persistExistingDraft(values);
        if (isCorrection) {
          await submitPaper.mutateAsync({ paperCode: paper.data.code });
          navigate(detailPath(paper.data.code), {
            replace: true,
            state: {
              paperDetailNotice: {
                message:
                  "La versión corregida se envió a evaluación correctamente.",
                severity: "success",
              },
            },
          });
          return;
        }
        await requestSubmission(paper.data.code);
        return;
      }

      const createdPaper = await createPaper.mutateAsync(
        buildCreatePayload(values),
      );
      await requestSubmission(createdPaper.code, createdPaper);
    } catch (error) {
      setNotice({ message: getMutationError(error), severity: "error" });
    }
  };
  const handleRemoveAuthor = async (authorUserCode: string) => {
    if (!paper.data) return;

    try {
      await removeAuthor.mutateAsync({
        paperCode: paper.data.code,
        authorUserCode,
      });
      await refreshPaper();
      setNotice({ message: "El coautor fue eliminado.", severity: "success" });
    } catch (error) {
      setNotice({ message: getMutationError(error), severity: "error" });
    }
  };
  const closePendingSubmissionDialog = () => {
    setPendingSubmissionCode(null);
    clearRoutePendingSubmission();
  };
  const confirmPendingSubmission = async () => {
    if (!displayedPendingSubmissionCode) return;

    try {
      await submitPaper.mutateAsync({
        paperCode: displayedPendingSubmissionCode,
        confirmDiscardPendingRequests: true,
      });
      setPendingSubmissionCode(null);

      if (paperCode === displayedPendingSubmissionCode) {
        clearRoutePendingSubmission();
        await refreshPaper();
        setNotice({
          message: "El trabajo se envió a evaluación correctamente.",
          severity: "success",
        });
        return;
      }

      navigate(editPath(displayedPendingSubmissionCode), {
        replace: true,
        state: {
          paperSubmissionNotice: {
            message: "El trabajo se envió a evaluación correctamente.",
            severity: "success",
          },
        },
      });
    } catch (error) {
      setNotice({ message: getMutationError(error), severity: "error" });
    }
  };

  return (
    <>
      {!submissionAvailability.isOpen && submissionAvailability.message && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {submissionAvailability.message}
        </Alert>
      )}
      {exceedsAuthorLimit && (
        <Alert severity="error" sx={{ mb: 3 }}>
          El trabajo tiene {acceptedAuthorCount} autores aceptados y el congreso
          admite un máximo de {congress.data.maxNumberOfAuthors}.
        </Alert>
      )}
      {paper.data && !canEditPaper && (
        <Alert
          severity={
            paper.data.status === "UNDER_EVALUATION" ? "success" : "info"
          }
          sx={{ mb: 3 }}
        >
          {isCorrection
            ? paper.data.status !== "NEEDS_REVISION"
              ? "Este trabajo no se encuentra disponible para corrección."
              : "Sólo el autor responsable puede corregir y reenviar este trabajo."
            : paper.data.status === "UNDER_EVALUATION"
              ? "Este trabajo ya fue enviado a evaluación y no admite cambios."
              : "Sólo el autor responsable puede editar este borrador."}
        </Alert>
      )}
      <PaperSubmissionForm
        congress={congress.data}
        responsibleAuthor={{
          fullName: `${participant.user.lastName}, ${participant.user.firstName}`,
          institution: participant.institution,
        }}
        paper={paper.data}
        mode={isCorrection ? "correction" : "submission"}
        correctionEvaluation={latestCorrectionEvaluation}
        canSave={canSave}
        canSubmit={canSubmit}
        canRemoveAuthors={canRemoveAuthors}
        isSaving={isBusy}
        isRemovingAuthor={removeAuthor.isPending}
        onSave={handleSave}
        onSubmitPaper={handleSubmitPaper}
        onRemoveAuthor={handleRemoveAuthor}
      />
      <Dialog
        open={!isCorrection && !!displayedPendingSubmissionCode}
        onClose={isBusy ? undefined : closePendingSubmissionDialog}
      >
        <DialogTitle>Solicitudes de coautoría pendientes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Hay solicitudes de incorporación pendientes. Si continuás, se
            descartarán y el trabajo se enviará a evaluación.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={isBusy} onClick={closePendingSubmissionDialog}>
            Volver al borrador
          </Button>
          <Button
            variant="contained"
            disabled={isBusy}
            onClick={() => void confirmPendingSubmission()}
          >
            Descartar y enviar
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!displayedNotice}
        autoHideDuration={6000}
        onClose={closeNotice}
      >
        <Alert
          severity={displayedNotice?.severity}
          variant="filled"
          onClose={closeNotice}
          sx={{ width: "100%" }}
        >
          {displayedNotice?.message}
        </Alert>
      </Snackbar>
    </>
  );
}
