import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
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
import { PaymentService } from "../api/PaymentService";
import { getPaymentError } from "../lib/paymentErrors";
import { paymentRecordOptions } from "../lib/paymentQueries";
import PaymentStatusChip from "./PaymentStatusChip";
import AbstractBookPanel from "../../abstract-book/components/AbstractBookPanel";
import { abstractBookOptions } from "../../abstract-book/lib/abstractBookQueries";
import { authorName } from "../../abstract-book/lib/abstractBookExport";

export default function AdminPayments({
  congressCode,
  userId,
  free,
}: {
  congressCode: string;
  userId: number;
  free: boolean;
}) {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const book = useQuery(abstractBookOptions(userId, congressCode));
  const includedCodes = new Set(
    book.isError ? [] : book.data?.map((paper) => paper.code),
  );
  const papers = useQuery({
    queryKey: ["accepted-payment-papers", userId, congressCode, page, search],
    queryFn: ({ signal }) =>
      PaymentService.listAcceptedPapers(congressCode, page, search, signal),
    retry: false,
  });
  const records = useQueries({
    queries: (free ? [] : (papers.data?.content ?? [])).map((paper) =>
      paymentRecordOptions(userId, congressCode, paper.code),
    ),
  });

  return (
    <Stack spacing={2.5}>
      <Typography color="text.secondary">
        {free
          ? "Los trabajos aprobados se incluyen en el libro sin validación de pago, porque este congreso es gratuito."
          : "Solo los trabajos aprobados con pago confirmado se incluyen en el libro. Desde acá se revisan comprobantes y se genera la exportación final."}
      </Typography>
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(0);
          setSearch(searchInput.trim());
        }}
        sx={{ display: "flex", gap: 1 }}
      >
        <TextField
          label="Buscar por código o título"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          size="small"
          fullWidth
        />
        <Button variant="outlined" type="submit">
          Buscar
        </Button>
      </Box>
      {papers.isPending ? (
        <Box role="status" sx={{ display: "flex", gap: 2, py: 4 }}>
          <CircularProgress size={24} />
          <Typography>Cargando trabajos aceptados…</Typography>
        </Box>
      ) : papers.isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => void papers.refetch()}>
              Reintentar
            </Button>
          }
        >
          {getPaymentError(papers.error)}
        </Alert>
      ) : (
        <>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              El total del libro abarca todo el congreso. Los estados de pago
              corresponden a esta página.
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: free ? "1fr" : "repeat(3, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              {[
                {
                  label: "Listos para el Libro",
                  color: "success.main",
                  count:
                    book.isPending || book.isError ? "—" : book.data.length,
                  caption: "Todo el congreso",
                },
                ...(free
                  ? []
                  : [
                      {
                        label: "Comprobantes por revisar",
                        color: "#7154A1",
                        count: records.some(
                          (record) => record.isPending || record.isError,
                        )
                          ? "—"
                          : records.filter(
                              (record) =>
                                record.data?.payment.status ===
                                "PENDING_APPROVAL",
                            ).length,
                        caption: "Página actual",
                      },
                      {
                        label: "Sin comprobante o rechazados",
                        color: "warning.main",
                        count: records.some(
                          (record) => record.isPending || record.isError,
                        )
                          ? "—"
                          : records.filter(
                              (record) =>
                                record.data?.payment.status === null ||
                                record.data?.payment.status === "REJECTED",
                            ).length,
                        caption: "Página actual",
                      },
                    ]),
              ].map((state) => (
                <Paper
                  key={state.label}
                  variant="outlined"
                  sx={{ p: 2, textAlign: "center", borderRadius: 2 }}
                >
                  <Typography
                    sx={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.8rem",
                      color: state.color,
                    }}
                  >
                    {state.count}
                  </Typography>
                  <Typography variant="body2">{state.label}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {state.caption}
                  </Typography>
                </Paper>
              ))}
            </Box>
            {records.some((record) => record.isPending) && (
              <Typography
                role="status"
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Consultando estados de pago…
              </Typography>
            )}
            {records.some((record) => record.isError) && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                Algunos pagos no pudieron consultarse. Los contadores de pago se
                muestran como no disponibles hasta completar la consulta. Podés
                reintentar en la fila correspondiente.
              </Alert>
            )}
          </Box>
          {papers.data.content.length === 0 ? (
            <Alert severity="info">
              {search
                ? "No hay trabajos aceptados que coincidan con la búsqueda."
                : "Todavía no hay trabajos aceptados para gestionar pagos."}
            </Alert>
          ) : (
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              <Table aria-label="Estado de pago de trabajos aceptados">
                <TableHead sx={{ bgcolor: "action.hover" }}>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Trabajo</TableCell>
                    <TableCell>Presentador / autores</TableCell>
                    <TableCell>Pago</TableCell>
                    <TableCell align="center">Incluir en libro</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {papers.data.content.map((paper, index) => {
                    const record = records[index];
                    const authors = free
                      ? book.data
                          ?.find((included) => included.code === paper.code)
                          ?.authors.map(authorName)
                          .join("; ")
                      : record?.data?.paper.authors
                          .filter((author) => author.status === "ACCEPTED")
                          .map((author) => author.fullName)
                          .join("; ");
                    return (
                      <TableRow key={paper.code}>
                        <TableCell
                          sx={{
                            fontFamily: "var(--font-mono)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {paper.code}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500, maxWidth: 360 }}>
                          {paper.title}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {authors || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {free ? (
                            <Typography variant="body2" color="text.secondary">
                              No requiere pago
                            </Typography>
                          ) : record.isPending ? (
                            <Typography variant="body2">
                              Consultando…
                            </Typography>
                          ) : record.isError ? (
                            <Stack spacing={1}>
                              <Typography variant="body2" color="error">
                                {getPaymentError(record.error)}
                              </Typography>
                              <Button
                                size="small"
                                onClick={() => void record.refetch()}
                              >
                                Reintentar
                              </Button>
                            </Stack>
                          ) : (
                            <PaymentStatusChip
                              status={record.data.payment.status}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {book.isPending || book.isError ? (
                            <Typography variant="body2" color="text.secondary">
                              Sin confirmar
                            </Typography>
                          ) : (
                            <Checkbox
                              checked={includedCodes.has(paper.code)}
                              disabled
                              slotProps={{
                                input: {
                                  "aria-label": includedCodes.has(paper.code)
                                    ? `${paper.code}: incluido en el libro`
                                    : `${paper.code}: no cumple las condiciones del libro`,
                                },
                              }}
                              sx={{
                                "&.Mui-checked.Mui-disabled": {
                                  color: "success.main",
                                },
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {free ? (
                            <Button
                              component="a"
                              href="#abstract-book"
                              size="small"
                            >
                              Ver libro
                            </Button>
                          ) : (
                            <Button
                              component={RouterLink}
                              to={`/congresses/${encodeURIComponent(congressCode)}/payments/${encodeURIComponent(paper.code)}`}
                              variant="outlined"
                              size="small"
                            >
                              Ver detalle
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={papers.data.totalElements}
                page={page}
                rowsPerPage={10}
                rowsPerPageOptions={[10]}
                onPageChange={(_, next) => setPage(next)}
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}–${to} de ${count}`
                }
                getItemAriaLabel={(type) =>
                  ({
                    first: "Primera página",
                    last: "Última página",
                    next: "Página siguiente",
                    previous: "Página anterior",
                  })[type]
                }
              />
            </TableContainer>
          )}
        </>
      )}
      <Box id="abstract-book" sx={{ scrollMarginTop: 24 }}>
        <AbstractBookPanel
          congressCode={congressCode}
          userId={userId}
          free={free}
        />
      </Box>
    </Stack>
  );
}
