import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  AbstractBookService,
  getAbstractBookError,
} from "../api/AbstractBookService";
import { abstractBookOptions } from "../lib/abstractBookQueries";
import {
  abstractBookCsv,
  authorName,
  downloadBook,
  summaryText,
} from "../lib/abstractBookExport";

interface Props {
  congressCode: string;
  userId: number;
  free: boolean;
}

export default function AbstractBookPanel({
  congressCode,
  userId,
  free,
}: Props) {
  const [preview, setPreview] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const client = useQueryClient();
  const options = abstractBookOptions(userId, congressCode);
  const papers = useQuery(options);
  const exporting = useMutation({
    mutationFn: async (format: "docx" | "csv") => {
      setSuccess(null);
      const blob =
        format === "docx"
          ? await AbstractBookService.downloadWord(congressCode)
          : abstractBookCsv(
              await client.fetchQuery({ ...options, staleTime: 0 }),
            );
      downloadBook(blob, congressCode, format);
      return format;
    },
    onSuccess: (format) => {
      setSuccess(
        format === "docx"
          ? "La descarga del Libro de Resúmenes en Word está lista."
          : "La exportación CSV está lista.",
      );
      void client.invalidateQueries({ queryKey: options.queryKey });
    },
  });
  const disabled =
    papers.isPending ||
    papers.isError ||
    papers.isFetching ||
    !papers.data?.length ||
    exporting.isPending;

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Typography
          component="h2"
          sx={{
            fontFamily: "var(--font-serif)",
            fontWeight: 600,
            fontSize: "1.2rem",
          }}
        >
          Generar Libro de Resúmenes
        </Typography>
        <Typography color="text.secondary">
          {free
            ? "Se incluyen los trabajos aprobados. Este congreso es gratuito y no requiere pago."
            : "Se incluyen únicamente los trabajos aprobados con pago verificado."}
          {papers.isSuccess &&
            !papers.isError &&
            ` Trabajos listos en todo el congreso: ${papers.data.length}.`}{" "}
          El documento Word contiene código, título, área temática, autores,
          instituciones, palabras clave y resumen.
        </Typography>
        {papers.isPending && (
          <Stack direction="row" spacing={1} role="status">
            <CircularProgress size={20} />
            <Typography>Consultando trabajos para el libro…</Typography>
          </Stack>
        )}
        {papers.isError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={() => void papers.refetch()}>
                Reintentar
              </Button>
            }
          >
            {getAbstractBookError(papers.error)}
          </Alert>
        )}
        {papers.isSuccess && papers.data.length === 0 && (
          <Alert severity="info">
            Todavía no hay trabajos que cumplan las condiciones para generar el
            libro.
          </Alert>
        )}
        {exporting.isError && (
          <Alert severity="error">
            {getAbstractBookError(exporting.error)}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          useFlexGap
          sx={{ flexWrap: "wrap" }}
        >
          <Button
            variant="contained"
            disabled={disabled}
            onClick={() => exporting.mutate("docx")}
          >
            {exporting.isPending && exporting.variables === "docx"
              ? "Generando Word…"
              : "Generar Libro de Resúmenes (.docx)"}
          </Button>
          <Button
            variant="outlined"
            disabled={disabled}
            onClick={() => exporting.mutate("csv")}
          >
            {exporting.isPending && exporting.variables === "csv"
              ? "Exportando…"
              : "Exportar datos estructurados (.csv)"}
          </Button>
          <Button disabled={disabled} onClick={() => setPreview(true)}>
            Ver trabajos incluidos
          </Button>
          <Button
            disabled={papers.isFetching || exporting.isPending}
            onClick={() => void papers.refetch()}
          >
            Actualizar libro
          </Button>
        </Stack>
      </Stack>
      <Dialog
        open={preview}
        onClose={() => setPreview(false)}
        fullWidth
        maxWidth="md"
        aria-labelledby="abstract-book-title"
      >
        <DialogTitle id="abstract-book-title">
          Trabajos incluidos en el Libro de Resúmenes
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} divider={<Divider />}>
            {papers.isError ? (
              <Alert severity="error">
                {getAbstractBookError(papers.error)}
              </Alert>
            ) : papers.data?.length === 0 ? (
              <Alert severity="info">
                No hay trabajos elegibles en este momento.
              </Alert>
            ) : (
              papers.data?.map((paper) => (
                <Box component="article" key={paper.code}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontFamily: "var(--font-mono)", mb: 1 }}
                  >
                    {paper.code} · {paper.thematicArea}
                  </Typography>
                  <Typography
                    component="h3"
                    sx={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.3rem",
                      mb: 2,
                    }}
                  >
                    {paper.title}
                  </Typography>
                  {paper.authors.map((author, index) => (
                    <Typography key={index} sx={{ mb: 0.5 }}>
                      {[authorName(author), author.institution, author.email]
                        .filter(Boolean)
                        .join(" · ")}
                    </Typography>
                  ))}
                  <Typography color="text.secondary" sx={{ my: 2 }}>
                    <strong>Palabras clave: </strong>
                    {paper.keywords.join("; ") || "Sin palabras clave"}
                  </Typography>
                  <Typography
                    sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                  >
                    {summaryText(paper.summary)}
                  </Typography>
                </Box>
              ))
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreview(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
