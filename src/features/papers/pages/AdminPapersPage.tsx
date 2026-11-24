import { useEffect, useState } from "react";
import {
  Link as RouterLink,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../../auth/context/AuthContext";
import CongressService from "../../congresses/api/CongressService";
import PaperService from "../api/PaperService";
import type { PaperStatus } from "../types/paper";

const STATUS_LABELS: Record<
  PaperStatus,
  { label: string; color: "default" | "info" | "warning" | "success" | "error" }
> = {
  NOT_SUBMITTED: { label: "No enviado", color: "default" },
  UNDER_EVALUATION: { label: "En evaluación", color: "warning" },
  ACCEPTED: { label: "Aceptado", color: "success" },
  REJECTED: { label: "Rechazado", color: "error" },
  NEEDS_REVISION: { label: "Re-entregar", color: "info" },
};

function formatDateTime(isoDate?: string) {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function AdminPapersPage() {
  const { congressCode = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Lectura de filtros desde Query Params (soporta drill-down desde el Dashboard)
  const statusParam = (searchParams.get("status") as PaperStatus | "") ?? "";
  const unassignedParam = searchParams.get("unassigned") ?? "";
  const payParam = searchParams.get("pay") ?? "";
  const thematicAreaParam = searchParams.get("thematicArea") ?? "";
  const searchParam = searchParams.get("search") ?? "";
  const sortParam = searchParams.get("sort") ?? "submittedAt,desc";
  const pageParam = Number(searchParams.get("page") ?? 0);
  const sizeParam = Number(searchParams.get("size") ?? 10);

  // Input controlado con debounce para la búsqueda por texto
  const [searchInput, setSearchInput] = useState(searchParam);

  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput !== searchParam) {
        updateParam("search", searchInput);
      }
    }, 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    if (key !== "page") {
      next.set("page", "0");
    }
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchParams({}, { replace: true });
  };

  // Navegación temporal al detalle (redirige a /congresses hasta crear la vista de detalle)
  const handleOpenPaperDetail = () => {
    navigate("/congresses");
  };

  // 1. Obtener el congreso puntual por su código
  const congress = useQuery({
    queryKey: ["congress-detail", user?.userId, congressCode],
    queryFn: async ({ signal }) =>
      (await CongressService.getCongressByCode(congressCode, signal)).data,
    enabled: !!user && !!congressCode,
    retry: false,
  });

  // 2. Verificar participación y rol del usuario en el congreso
  const participation = useQuery({
    queryKey: ["congress-participation", user?.userId, congressCode],
    queryFn: async ({ signal }) => {
      try {
        return (await CongressService.getMyParticipation(congressCode, signal))
          .data;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) return null;
        throw error;
      }
    },
    enabled: !!user && !!congressCode,
    retry: false,
  });

  const participant = participation.data?.active ? participation.data : null;
  const isAdmin =
    user?.superAdmin === true || participant?.role === "ADMINISTRATOR";

  // 3. Listado paginado, filtrado y ordenado de trabajos
  const papersQuery = useQuery({
    queryKey: [
      "admin-congress-papers",
      user?.userId,
      congressCode,
      statusParam,
      unassignedParam,
      payParam,
      thematicAreaParam,
      searchParam,
      sortParam,
      pageParam,
      sizeParam,
    ],
    queryFn: async ({ signal }) =>
      (
        await PaperService.listCongressPapersAdmin(
          congressCode,
          {
            status: statusParam,
            unassigned:
              unassignedParam === "" ? "" : unassignedParam === "true",
            pay: payParam === "" ? "" : payParam === "true",
            thematicArea: thematicAreaParam,
            search: searchParam,
            sort: sortParam,
            page: pageParam,
            size: sizeParam,
          },
          signal,
        )
      ).data,
    enabled: !!user && !!congressCode && isAdmin,
    retry: false,
  });

  if (!user) return null;

  if (congress.isPending || participation.isPending) {
    return (
      <Box role="status" sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <CircularProgress size={24} />
        <Typography>Cargando información del congreso…</Typography>
      </Box>
    );
  }

  if (congress.isError || participation.isError) {
    return (
      <Stack spacing={2}>
        <Button
          component={RouterLink}
          to="/congresses"
          sx={{ alignSelf: "flex-start" }}
        >
          Volver a mis congresos
        </Button>
        <Alert severity="error">
          No se pudo cargar la información del congreso.
        </Alert>
      </Stack>
    );
  }

  const thematicAreas = congress.data.thematicAreas ?? [];

  const hasActiveFilters =
    Boolean(statusParam) ||
    Boolean(unassignedParam) ||
    Boolean(payParam) ||
    Boolean(thematicAreaParam) ||
    Boolean(searchParam);

  return (
    <Stack spacing={3}>
      {/* Encabezado */}
      <Box>
        <Button component={RouterLink} to="/congresses" sx={{ mb: 2 }}>
          Volver a mis congresos
        </Button>
        <Typography
          variant="body2"
          sx={{
            fontFamily: "var(--font-mono)",
            color: "text.secondary",
            mb: 0.5,
          }}
        >
          {congress.data.name} ({congressCode})
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-serif)",
            fontWeight: 600,
            fontSize: "1.7rem",
          }}
        >
          Gestión de trabajos
        </Typography>
        <Typography color="text.secondary">
          Consultá, filtrá y supervisá todos los trabajos presentados en el
          congreso.
        </Typography>
      </Box>

      {!isAdmin ? (
        <Alert severity="warning">
          Esta sección está disponible únicamente para administradores del
          congreso.
        </Alert>
      ) : (
        <>
          {/* Barra de Filtros */}
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 2,
                }}
              >
                <TextField
                  label="Buscar por título o código"
                  placeholder="Ej: Microservicios o PAPER-2026..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  size="small"
                  fullWidth
                />

                <TextField
                  select
                  label="Estado"
                  value={statusParam}
                  onChange={(e) => updateParam("status", e.target.value)}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="NOT_SUBMITTED">No enviado</MenuItem>
                  <MenuItem value="UNDER_EVALUATION">En evaluación</MenuItem>
                  <MenuItem value="NEEDS_REVISION">Re-entregar</MenuItem>
                  <MenuItem value="ACCEPTED">Aceptado</MenuItem>
                  <MenuItem value="REJECTED">Rechazado</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Evaluador"
                  value={unassignedParam}
                  onChange={(e) => updateParam("unassigned", e.target.value)}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="true">Sin evaluador</MenuItem>
                  <MenuItem value="false">Con evaluador</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Pago"
                  value={payParam}
                  onChange={(e) => updateParam("pay", e.target.value)}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="true">Pagado</MenuItem>
                  <MenuItem value="false">Pendiente</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Área temática"
                  value={thematicAreaParam}
                  onChange={(e) => updateParam("thematicArea", e.target.value)}
                  size="small"
                  fullWidth
                  disabled={thematicAreas.length === 0}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {thematicAreas.map((area) => (
                    <MenuItem key={area} value={area}>
                      {area}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Ordenar por"
                  value={sortParam}
                  onChange={(e) => updateParam("sort", e.target.value)}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="submittedAt,desc">
                    Fecha de envío (más recientes)
                  </MenuItem>
                  <MenuItem value="submittedAt,asc">
                    Fecha de envío (más antiguos)
                  </MenuItem>
                  <MenuItem value="title,asc">Título (A - Z)</MenuItem>
                  <MenuItem value="title,desc">Título (Z - A)</MenuItem>
                  <MenuItem value="code,asc">Código (A - Z)</MenuItem>
                  <MenuItem value="status,asc">Estado</MenuItem>
                  <MenuItem value="userReviewer.firstName,asc">
                    Evaluador (A - Z)
                  </MenuItem>
                </TextField>
              </Box>

              {hasActiveFilters && (
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button size="small" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                </Box>
              )}
            </Stack>
          </Paper>

          {/* Tabla de Resultados */}
          {papersQuery.isPending ? (
            <Box
              role="status"
              sx={{ display: "flex", alignItems: "center", gap: 2, py: 4 }}
            >
              <CircularProgress size={24} />
              <Typography>Cargando trabajos…</Typography>
            </Box>
          ) : papersQuery.isError ? (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  onClick={() => void papersQuery.refetch()}
                >
                  Reintentar
                </Button>
              }
            >
              Ocurrió un error al obtener los trabajos del congreso.
            </Alert>
          ) : papersQuery.data.content.length === 0 ? (
            <Alert severity="info">
              No se encontraron trabajos con los criterios seleccionados.
            </Alert>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F3EFEE" }}>
                      <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Título</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Área temática
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Evaluador</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Pago</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Envío</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {papersQuery.data.content.map((paper) => {
                      const statusConfig = STATUS_LABELS[paper.status] ?? {
                        label: paper.status,
                        color: "default" as const,
                      };

                      return (
                        <TableRow
                          key={paper.code}
                          hover
                          onClick={handleOpenPaperDetail}
                          sx={{ cursor: "pointer" }}
                        >
                          <TableCell
                            sx={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.75rem",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {paper.code}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, maxWidth: 280 }}>
                            {paper.title}
                          </TableCell>
                          <TableCell>{paper.thematicArea}</TableCell>
                          <TableCell
                            sx={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.75rem",
                            }}
                          >
                            {paper.congressPaperType}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={statusConfig.label}
                              color={statusConfig.color}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {paper.reviewerName ? (
                              paper.reviewerName
                            ) : (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "text.secondary",
                                  fontStyle: "italic",
                                }}
                              >
                                Sin asignar
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={paper.pay ? "Pagado" : "Pendiente"}
                              color={paper.pay ? "success" : "default"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {formatDateTime(paper.submittedAt)}
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPaperDetail();
                              }}
                              sx={{ whiteSpace: "nowrap" }}
                            >
                              Ver detalle
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
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  px: 2,
                  py: 0.5,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate("/congresses")}
                >
                  Generar libro de resúmenes
                </Button>

                <TablePagination
                  component="div"
                  count={papersQuery.data.totalElements}
                  page={papersQuery.data.number}
                  onPageChange={(_, newPage) =>
                    updateParam("page", String(newPage))
                  }
                  rowsPerPage={papersQuery.data.size}
                  onRowsPerPageChange={(e) => {
                    const next = new URLSearchParams(searchParams);
                    next.set("size", e.target.value);
                    next.set("page", "0");
                    setSearchParams(next, { replace: true });
                  }}
                  rowsPerPageOptions={[5, 10, 20, 50]}
                  labelRowsPerPage="Filas por página:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}–${to} de ${count}`
                  }
                  sx={{ borderTop: "none", ml: "auto" }}
                />
              </Box>
            </Paper>
            
          )}
        </>
      )}
    </Stack>
  );
}