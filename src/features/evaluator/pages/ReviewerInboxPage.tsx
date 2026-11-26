import { useQuery } from "@tanstack/react-query";
import {
  Link as RouterLink,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useAuth } from "../../auth/context/AuthContext";
import { ReviewerInboxService } from "../api/ReviewerInboxService";
import {
  getInboxActivity,
  getInboxError,
  inboxStates,
  isInboxStatus,
} from "../lib/reviewerInbox";
import type { ReviewerInboxStatus } from "../types/reviewerInbox";

export default function ReviewerInboxPage() {
  const { congressCode = "" } = useParams();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedStatus = searchParams.get("status");
  const status = isInboxStatus(requestedStatus) ? requestedStatus : "";
  const inbox = useQuery({
    queryKey: ["reviewer-inbox", user?.userId, congressCode, status],
    queryFn: ({ signal }) =>
      ReviewerInboxService.getMyInbox(congressCode, status, signal),
    enabled: !!user && !!congressCode,
    retry: false,
    refetchOnWindowFocus: "always",
  });

  return (
    <Stack spacing={3} sx={{ maxWidth: 1120, mx: "auto", pb: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontFamily: "var(--font-mono)", color: "text.secondary" }}
        >
          <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
            Evaluador
          </Box>
          {" / Bandeja asignada"}
        </Typography>
        <Chip
          label="EVA-01"
          size="small"
          sx={{
            bgcolor: "#F3E4E9",
            color: "primary.main",
            borderRadius: 1,
            fontFamily: "var(--font-mono)",
          }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          {inbox.data && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Congreso activo: {inbox.data.congressName}
            </Typography>
          )}
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.75rem",
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            Bandeja de trabajos
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: "1rem" }}>
            Consultá todos los trabajos que te asignaron y filtrá rápidamente
            según el estado de la evaluación.
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/congresses"
          variant="outlined"
          size="small"
        >
          Volver a mis congresos
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2 }}>
        <FormControl size="small" sx={{ width: { xs: "100%", sm: 320 } }}>
          <InputLabel id="inbox-status-label" shrink>
            Filtrar por estado
          </InputLabel>
          <Select
            labelId="inbox-status-label"
            label="Filtrar por estado"
            value={status}
            displayEmpty
            onChange={(event) => {
              const next = new URLSearchParams(searchParams);
              if (event.target.value) next.set("status", event.target.value);
              else next.delete("status");
              setSearchParams(next);
            }}
          >
            <MenuItem value="">Todos los estados</MenuItem>
            {(Object.keys(inboxStates) as ReviewerInboxStatus[]).map(
              (value) => (
                <MenuItem key={value} value={value}>
                  {inboxStates[value].label}
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>
      </Paper>

      {inbox.isPending ? (
        <Box
          role="status"
          aria-live="polite"
          sx={{ display: "flex", alignItems: "center", gap: 2, py: 4 }}
        >
          <CircularProgress size={24} />
          <Typography>Cargando trabajos asignados…</Typography>
        </Box>
      ) : inbox.isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => void inbox.refetch()}>
              Reintentar
            </Button>
          }
        >
          {getInboxError(inbox.error)}
        </Alert>
      ) : (
        <>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            <Table
              aria-label="Trabajos asignados al evaluador"
              sx={{ minWidth: 780 }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      color: "text.secondary",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.8125rem",
                      fontWeight: 400,
                      py: 1.5,
                    },
                  }}
                >
                  <TableCell>CÓDIGO</TableCell>
                  <TableCell>TRABAJO</TableCell>
                  <TableCell>VERSIÓN</TableCell>
                  <TableCell>ESTADO</TableCell>
                  <TableCell>ÚLTIMA ACTIVIDAD</TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        position: "absolute",
                        width: 1,
                        height: 1,
                        overflow: "hidden",
                        clipPath: "inset(50%)",
                      }}
                    >
                      Acciones
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inbox.data.papers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 6, textAlign: "center" }}>
                      <Typography sx={{ fontWeight: 600, mb: 1 }}>
                        {inbox.data.totalAssigned === 0
                          ? "Todavía no tenés trabajos asignados"
                          : "No hay trabajos con este estado"}
                      </Typography>
                      <Typography color="text.secondary">
                        {inbox.data.totalAssigned === 0
                          ? "Cuando te asignen un trabajo en este congreso, aparecerá en esta bandeja."
                          : "Elegí otro estado o consultá todos los trabajos."}
                      </Typography>
                      {status && (
                        <Button
                          sx={{ mt: 2 }}
                          onClick={() => {
                            const next = new URLSearchParams(searchParams);
                            next.delete("status");
                            setSearchParams(next);
                          }}
                        >
                          Ver todos los estados
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  inbox.data.papers.map((paper) => {
                    const state = inboxStates[paper.status];
                    return (
                      <TableRow
                        key={paper.code}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            borderBottom: 0,
                          },
                          "& td, & th": { py: 2 },
                        }}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.8125rem",
                            color: "primary.main",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {paper.code}
                        </TableCell>
                        <TableCell sx={{ width: "34%", minWidth: 210 }}>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.9375rem",
                              lineHeight: 1.4,
                            }}
                          >
                            {paper.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {paper.thematicArea}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.8125rem",
                          }}
                        >
                          v{paper.version}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={state.label}
                            variant="outlined"
                            size="small"
                            sx={{
                              height: "auto",
                              maxWidth: 190,
                              color: state.color,
                              borderColor: state.color,
                              borderStyle: "dashed",
                              borderRadius: 1,
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.8125rem",
                              "& .MuiChip-label": {
                                whiteSpace: "normal",
                                py: 0.5,
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 160 }}>
                          <Typography variant="body2" color="text.secondary">
                            {getInboxActivity(paper)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip
                            title={`${state.action}: pantalla disponible próximamente.`}
                          >
                            <Box
                              component="span"
                              tabIndex={0}
                              aria-label={`${state.action} ${paper.code}. Pantalla disponible próximamente.`}
                              sx={{ display: "inline-flex" }}
                            >
                              <Button
                                disabled
                                variant={
                                  state.actionable ? "contained" : "outlined"
                                }
                                size="small"
                                sx={{
                                  minWidth: 95,
                                  "&.Mui-disabled": {
                                    color: state.actionable
                                      ? "#FFFFFF"
                                      : "primary.dark",
                                    bgcolor: state.actionable
                                      ? "primary.main"
                                      : "transparent",
                                    borderColor: "divider",
                                    opacity: 0.65,
                                  },
                                }}
                              >
                                {state.action}
                              </Button>
                            </Box>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography
            role="status"
            aria-live="polite"
            variant="body2"
            color="text.secondary"
          >
            {inbox.data.papers.length} de {inbox.data.totalAssigned} trabajos
          </Typography>
        </>
      )}
    </Stack>
  );
}
