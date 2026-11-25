import { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/context/AuthContext";
import { CoauthorshipService } from "../api/CoauthorshipService";
import { PaperSubmissionService } from "../api/PaperSubmissionService";
import { getCoauthorshipError } from "../lib/coauthorship";
import { invalidateCoauthorshipQueries } from "../lib/coauthorshipQueries";
import { getSubmissionAvailability } from "../utils/submissionAvailability";

export default function CoauthorshipRequestsDialog({
  congressCode,
  paperCode,
  title,
  onClose,
}: {
  congressCode: string;
  paperCode: string;
  title: string;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const client = useQueryClient();
  const sending = useRef(false);
  const [notice, setNotice] = useState<{
    severity: "success" | "error";
    message: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const enabled = !!user && !!paperCode;
  const pending = useQuery({
    queryKey: ["paper-author-requests", user?.userId, congressCode, paperCode],
    queryFn: ({ signal }) => CoauthorshipService.getPending(paperCode, signal),
    enabled,
    retry: false,
  });
  const detail = useQuery({
    queryKey: ["paper-detail", user?.userId, paperCode],
    queryFn: ({ signal }) => PaperSubmissionService.getPaper(paperCode, signal),
    enabled,
    retry: false,
  });
  const rules = useQuery({
    queryKey: ["paper-submission-rules", user?.userId, congressCode],
    queryFn: ({ signal }) =>
      PaperSubmissionService.getCongressRules(congressCode, signal),
    enabled,
    retry: false,
  });
  const participation = useQuery({
    queryKey: ["paper-submission-participation", user?.userId, congressCode],
    queryFn: ({ signal }) =>
      PaperSubmissionService.getMyParticipation(congressCode, signal),
    enabled,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: ({
      userCode,
      decision,
    }: {
      userCode: string;
      decision: "accept" | "reject";
    }) => CoauthorshipService.decide(paperCode, userCode, decision),
    retry: false,
  });
  const availability = rules.data
    ? getSubmissionAvailability(rules.data)
    : null;
  const queries = [pending, detail, rules, participation];
  const loading = queries.some((query) => query.isPending);
  const fetching = queries.some((query) => query.isFetching);
  const error = queries.find((query) => query.isError)?.error;
  const responsible =
    !!participation.data?.active &&
    !!participation.data.institution?.trim() &&
    detail.data?.authors.some(
      (author) =>
        author.mainAuthor &&
        author.status === "ACCEPTED" &&
        author.userCode === participation.data?.user.code,
    );
  const correctCongress = detail.data?.congressCode === congressCode;
  const editable =
    correctCongress && responsible && detail.data?.status === "NOT_SUBMITTED";
  const canDecide =
    editable && availability?.isOpen && !fetching && !error && !busy;

  const decide = async (userCode: string, decision: "accept" | "reject") => {
    if (sending.current || !user || !canDecide) return;
    sending.current = true;
    setBusy(true);
    setNotice(null);
    try {
      await mutation.mutateAsync({ userCode, decision });
      setNotice({
        severity: "success",
        message:
          decision === "accept"
            ? "Solicitud aceptada. El participante ya forma parte del trabajo."
            : "Solicitud rechazada correctamente.",
      });
    } catch (cause) {
      setNotice({ severity: "error", message: getCoauthorshipError(cause) });
    } finally {
      await invalidateCoauthorshipQueries(
        client,
        user.userId,
        congressCode,
        paperCode,
      );
      await rules.refetch();
      sending.current = false;
      setBusy(false);
    }
  };
  const retry = () => {
    void pending.refetch();
    void detail.refetch();
    void rules.refetch();
    void participation.refetch();
  };
  return (
    <Dialog
      open
      fullWidth
      maxWidth="md"
      onClose={busy ? undefined : onClose}
      aria-labelledby="coauthorship-requests-title"
    >
      <DialogTitle
        id="coauthorship-requests-title"
        sx={{ fontFamily: "var(--font-serif)" }}
      >
        Solicitudes de coautoría
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Box>
            <Typography
              sx={{
                fontFamily: "var(--font-mono)",
                color: "primary.main",
                fontSize: "0.8rem",
              }}
            >
              {paperCode}
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
          </Box>
          {notice && <Alert severity={notice.severity}>{notice.message}</Alert>}
          {loading && (
            <Box role="status">
              <CircularProgress size={22} /> Cargando solicitudes…
            </Box>
          )}
          {error && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" onClick={retry}>
                  Reintentar
                </Button>
              }
            >
              {getCoauthorshipError(error)}
            </Alert>
          )}
          {!loading && !error && !editable && (
            <Alert severity="warning">
              Este trabajo ya no está disponible para gestionar solicitudes.
              Debés ser su autor responsable y el trabajo debe continuar en
              borrador.
            </Alert>
          )}
          {!loading && !error && !availability?.isOpen && (
            <Alert severity="info">
              Las solicitudes se muestran en modo de lectura.{" "}
              {availability?.message}
            </Alert>
          )}
          {pending.data &&
            !error &&
            (pending.data.length === 0 ? (
              <Alert severity="info">
                No hay solicitudes pendientes para este trabajo.
              </Alert>
            ) : (
              <TableContainer>
                <Table aria-label="Solicitudes pendientes">
                  <TableHead>
                    <TableRow>
                      <TableCell>Solicitante</TableCell>
                      <TableCell>Institución</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pending.data.map((request) => (
                      <TableRow key={request.userCode}>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600 }}>
                            {request.fullName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {request.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {request.institution || "Institución no informada"}
                        </TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              justifyContent: "flex-end",
                            }}
                          >
                            <Button
                              variant="contained"
                              size="small"
                              disabled={!canDecide}
                              onClick={() =>
                                void decide(request.userCode, "accept")
                              }
                            >
                              Aceptar
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              disabled={!canDecide}
                              onClick={() =>
                                void decide(request.userCode, "reject")
                              }
                            >
                              Rechazar
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ))}
          {busy && (
            <Typography role="status" variant="body2">
              Guardando respuesta…
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
