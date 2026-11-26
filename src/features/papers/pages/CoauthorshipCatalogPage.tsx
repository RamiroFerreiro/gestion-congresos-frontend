import { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Link as RouterLink,
  Navigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../auth/context/AuthContext";
import { PaperSubmissionService } from "../api/PaperSubmissionService";
import { CoauthorshipService } from "../api/CoauthorshipService";
import {
  canApplyForCoauthorship,
  getCatalogPage,
  getCoauthorshipError,
} from "../lib/coauthorship";
import { invalidateCoauthorshipQueries } from "../lib/coauthorshipQueries";
import { getSubmissionAvailability } from "../utils/submissionAvailability";

const searchSchema = z.object({ search: z.string().trim() });
function CatalogSearch({
  search,
  onSearch,
}: {
  search: string;
  onSearch: (value: string) => void;
}) {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(searchSchema),
    defaultValues: { search },
  });
  return (
    <Box
      component="form"
      onSubmit={handleSubmit((values) => onSearch(values.search))}
      sx={{ display: "flex", gap: 2 }}
    >
      <TextField
        {...register("search")}
        label="Código o título del trabajo"
        size="small"
        sx={{ width: 420 }}
      />
      <Button type="submit" variant="contained">
        Buscar
      </Button>
      {search && (
        <Button type="button" onClick={() => onSearch("")}>
          Limpiar
        </Button>
      )}
    </Box>
  );
}

export default function CoauthorshipCatalogPage() {
  const { congressCode = "" } = useParams();
  const { user } = useAuth();
  const client = useQueryClient();
  const [params, setParams] = useSearchParams();
  const search = params.get("search")?.trim() ?? "";
  const page = getCatalogPage(params.get("page"));
  const [notice, setNotice] = useState<{
    severity: "success" | "error";
    message: string;
  } | null>(null);
  const sending = useRef(false);
  const participation = useQuery({
    queryKey: ["paper-submission-participation", user?.userId, congressCode],
    queryFn: ({ signal }) =>
      PaperSubmissionService.getMyParticipation(congressCode, signal),
    enabled: !!user && !!congressCode,
    retry: false,
  });
  const rules = useQuery({
    queryKey: ["paper-submission-rules", user?.userId, congressCode],
    queryFn: ({ signal }) =>
      PaperSubmissionService.getCongressRules(congressCode, signal),
    enabled: !!user && !!congressCode,
    retry: false,
  });
  const eligible = canApplyForCoauthorship(
    participation.data,
    user?.superAdmin,
  );
  const catalog = useQuery({
    queryKey: [
      "coauthorship-catalog",
      user?.userId,
      congressCode,
      search,
      page,
    ],
    queryFn: ({ signal }) =>
      CoauthorshipService.getCatalog(congressCode, search, page, signal),
    enabled:
      !!user &&
      !!congressCode &&
      participation.isSuccess &&
      rules.isSuccess &&
      eligible,
    retry: false,
  });
  const request = useMutation({
    mutationFn: (paperCode: string) =>
      CoauthorshipService.request(paperCode, participation.data!.user.code),
    retry: false,
  });
  const updatePage = (nextPage: number, nextSearch = search) => {
    const next = new URLSearchParams();
    if (nextSearch) next.set("search", nextSearch);
    if (nextPage) next.set("page", String(nextPage));
    setParams(next);
  };
  const apply = async (paperCode: string) => {
    if (
      sending.current ||
      !user ||
      !eligible ||
      !rules.data ||
      !getSubmissionAvailability(rules.data).isOpen
    )
      return;
    sending.current = true;
    setNotice(null);
    try {
      await request.mutateAsync(paperCode);
      setNotice({
        severity: "success",
        message: `Solicitud enviada para ${paperCode}. El responsable debe responderla antes de que formes parte del trabajo.`,
      });
    } catch (error) {
      setNotice({ severity: "error", message: getCoauthorshipError(error) });
    } finally {
      await invalidateCoauthorshipQueries(
        client,
        user.userId,
        congressCode,
        paperCode,
      );
      sending.current = false;
    }
  };
  const availability = rules.data
    ? getSubmissionAvailability(rules.data)
    : null;
  const prerequisitesError = participation.error ?? rules.error;
  if (
    catalog.data &&
    !catalog.isError &&
    !catalog.isFetching &&
    page > 0 &&
    page >= catalog.data.totalPages
  ) {
    const next = new URLSearchParams(params);
    next.set("page", String(Math.max(0, catalog.data.totalPages - 1)));
    return <Navigate replace to={{ search: next.toString() }} />;
  }
  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.8rem",
              fontWeight: 700,
            }}
          >
            Buscar trabajo para unirme
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Explorá borradores con cupo y solicitá incorporarte como coautor.
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to={`/congresses/${encodeURIComponent(congressCode)}/my-papers`}
          variant="outlined"
        >
          ← Mis trabajos
        </Button>
      </Box>
      {notice && (
        <Alert severity={notice.severity} onClose={() => setNotice(null)}>
          {notice.message}
        </Alert>
      )}
      {(participation.isPending || rules.isPending) && (
        <Box role="status">
          <CircularProgress size={24} /> Verificando tu participación…
        </Box>
      )}
      {prerequisitesError && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              onClick={() => {
                void participation.refetch();
                void rules.refetch();
              }}
            >
              Reintentar
            </Button>
          }
        >
          {getCoauthorshipError(prerequisitesError)}
        </Alert>
      )}
      {!participation.isPending && !prerequisitesError && !eligible && (
        <Alert severity="warning">
          Necesitás una participación activa como oyente o expositor y una
          institución completa para solicitar coautoría.
        </Alert>
      )}
      {eligible && rules.isSuccess && !prerequisitesError && (
        <>
          {!availability?.isOpen && (
            <Alert severity="info">
              La incorporación de coautores está cerrada.{" "}
              {availability?.message}
            </Alert>
          )}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <CatalogSearch
              key={search}
              search={search}
              onSearch={(value) => updatePage(0, value)}
            />
          </Paper>
          {catalog.isPending && (
            <Box role="status">
              <CircularProgress size={24} /> Cargando trabajos disponibles…
            </Box>
          )}
          {catalog.isError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" onClick={() => void catalog.refetch()}>
                  Reintentar
                </Button>
              }
            >
              {getCoauthorshipError(catalog.error)}
            </Alert>
          )}
          {catalog.data && !catalog.isError && (
            <Paper
              variant="outlined"
              sx={{ overflow: "hidden", borderRadius: 2 }}
            >
              {catalog.isFetching && <LinearProgress />}
              {catalog.data.empty ? (
                <Alert severity="info" sx={{ m: 2.5 }}>
                  {search
                    ? "No encontramos trabajos disponibles para esa búsqueda."
                    : "No hay trabajos disponibles para solicitar incorporación en este momento."}
                </Alert>
              ) : (
                <TableContainer>
                  <Table aria-label="Trabajos disponibles para coautoría">
                    <TableHead>
                      <TableRow>
                        <TableCell>Código</TableCell>
                        <TableCell>Trabajo</TableCell>
                        <TableCell>Área temática</TableCell>
                        <TableCell>Autores</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {catalog.data.content.map((paper) => (
                        <TableRow key={paper.code} hover>
                          <TableCell sx={{ fontFamily: "var(--font-mono)" }}>
                            {paper.code}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {paper.title}
                          </TableCell>
                          <TableCell>{paper.thematicArea}</TableCell>
                          <TableCell>
                            {paper.acceptedAuthorCount} /{" "}
                            {paper.maxNumberOfAuthors ?? "Sin límite"}
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant="contained"
                              size="small"
                              disabled={
                                request.isPending ||
                                catalog.isFetching ||
                                !availability?.isOpen
                              }
                              onClick={() => void apply(paper.code)}
                            >
                              {request.isPending &&
                              request.variables === paper.code
                                ? "Enviando…"
                                : "Solicitar incorporación"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              <TablePagination
                component="div"
                count={catalog.data.totalElements}
                page={Math.min(page, Math.max(0, catalog.data.totalPages - 1))}
                rowsPerPage={10}
                rowsPerPageOptions={[10]}
                onPageChange={(_, value) => updatePage(value)}
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}–${to} de ${count} trabajos`
                }
              />
            </Paper>
          )}
        </>
      )}
    </Stack>
  );
}
