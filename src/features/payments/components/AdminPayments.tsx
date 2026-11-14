import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
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
import { paymentStates } from "../lib/paymentStates";

export default function AdminPayments({
  congressCode,
  userId,
}: {
  congressCode: string;
  userId: number;
}) {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const papers = useQuery({
    queryKey: ["accepted-payment-papers", userId, congressCode, page, search],
    queryFn: ({ signal }) =>
      PaymentService.listAcceptedPapers(congressCode, page, search, signal),
    retry: false,
  });
  const records = useQueries({
    queries: (papers.data?.content ?? []).map((paper) =>
      paymentRecordOptions(userId, congressCode, paper.code),
    ),
  });

  return (
    <Stack spacing={2.5}>
      <Typography color="text.secondary">
        Consultá los pagos de los trabajos académicamente aceptados y revisá los
        comprobantes recibidos.
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
              Estados de los trabajos en esta página
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 2,
              }}
            >
              {paymentStates.map((state) => (
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
                    {
                      records.filter(
                        (record) =>
                          record.isSuccess &&
                          !record.isError &&
                          record.data.payment.status === state.status,
                      ).length
                    }
                  </Typography>
                  <Typography variant="body2">{state.label}</Typography>
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
                Algunos pagos no pudieron consultarse y no se incluyen en los
                contadores. Podés reintentar en la fila correspondiente.
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
                    <TableCell>Pago</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {papers.data.content.map((paper, index) => {
                    const record = records[index];
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
                          {record.isPending ? (
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
                        <TableCell>
                          <Button
                            component={RouterLink}
                            to={`/congresses/${encodeURIComponent(congressCode)}/payments/${encodeURIComponent(paper.code)}`}
                            variant="outlined"
                            size="small"
                          >
                            {record.data?.payment.status === "PENDING_APPROVAL"
                              ? "Revisar comprobante"
                              : "Ver pago"}
                          </Button>
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
    </Stack>
  );
}
