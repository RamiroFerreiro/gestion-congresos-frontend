import { useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useAuth } from "../../auth/context/AuthContext";
import { PaymentService } from "../api/PaymentService";
import { paymentRecordOptions } from "../lib/paymentQueries";
import { getPaymentError } from "../lib/paymentErrors";
import { receiptSchema, type ReceiptValues } from "../schemas/paymentSchemas";
import PaymentStatusChip from "../components/PaymentStatusChip";
import ReceiptViewer from "../components/ReceiptViewer";

/**
 * Pantalla de gestión del comprobante de pago para el expositor (autor principal).
 * Ruta: /congresses/:congressCode/payments/:paperCode
 *
 * Secciones:
 *  1. Encabezado de navegación  → "Volver a mis trabajos"
 *  2. Título del trabajo        → paperCode + paperTitle
 *  3. Tarjeta de metadatos      → estado, monto, archivo, fecha, autor, observaciones
 *  4. Visor del comprobante     → ReceiptViewer inline (PDF/imagen + descarga)
 *  5. Sección de carga          → formulario de subida/reemplazo (solo si canUpload)
 *
 * Preparada para reutilización futura desde la vista del administrador:
 * - Las secciones 3 y 4 son de solo lectura y no dependen del rol.
 * - La sección 5 (carga) está aislada bajo su propia guarda `canUpload`.
 * - Se podrá agregar una sección 6 de acciones admin (Aprobar / Rechazar)
 *   sin necesidad de refactorizar las secciones existentes.
 *   TODO: admin actions — agregar prop `isAdmin` y bloque de revisión aquí.
 */
export default function PaperPaymentPage() {
  const { congressCode = "", paperCode = "" } = useParams();
  const { user } = useAuth();
  const client = useQueryClient();
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const form = useForm<ReceiptValues>({ resolver: zodResolver(receiptSchema) });
  const selectedFile = useWatch({ control: form.control, name: "file" });

  // ── Datos principales ────────────────────────────────────────────────────────
  const options = paymentRecordOptions(user!.userId, congressCode, paperCode);
  const record = useQuery(options);

  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: options.queryKey }),
      client.invalidateQueries({
        queryKey: ["payment-receipt", user!.userId, paperCode],
      }),
      client.invalidateQueries({
        queryKey: ["participant-paper-inbox", user!.userId, congressCode],
      }),
    ]);
  };

  // ── Mutación de subida ───────────────────────────────────────────────────────
  const upload = useMutation({
    mutationFn: (values: ReceiptValues) =>
      PaymentService.upload(paperCode, values.file),
    onSuccess: async (payment) => {
      client.setQueryData(options.queryKey, (prev) =>
        prev ? { ...prev, payment } : prev,
      );
      form.reset();
      setUploadSuccess(
        "Comprobante enviado correctamente. Está pendiente de revisión por la administración.",
      );
      await refresh();
    },
    onError: () => {
      void refresh();
    },
  });

  // ── Estados de carga / error de la query principal ──────────────────────────
  if (!user || !congressCode || !paperCode) return null;

  if (record.isPending) {
    return (
      <Box role="status" sx={{ display: "flex", alignItems: "center", gap: 2, py: 6 }}>
        <CircularProgress size={24} />
        <Typography>Consultando el comprobante…</Typography>
      </Box>
    );
  }

  if (record.isError) {
    const is403 =
      isAxiosError(record.error) && record.error.response?.status === 403;
    return (
      <Stack spacing={2}>
        <Button
          component={RouterLink}
          to={`/congresses/${encodeURIComponent(congressCode)}/my-papers`}
          startIcon={<ArrowBackIcon />}
          sx={{ alignSelf: "flex-start" }}
        >
          Volver a mis trabajos
        </Button>
        <Alert
          severity="error"
          action={
            !is403 && (
              <Button color="inherit" size="small" onClick={() => void record.refetch()}>
                Reintentar
              </Button>
            )
          }
        >
          {getPaymentError(record.error)}
        </Alert>
      </Stack>
    );
  }

  // ── Lógica de roles y permisos ───────────────────────────────────────────────
  const { paper, payment } = record.data;

  const isMainAuthor = paper.authors.some(
    (a) =>
      a.mainAuthor &&
      a.status === "ACCEPTED" &&
      a.email.toLowerCase() === user.email.toLowerCase(),
  );

  const isCoauthor =
    paper.authors.some(
      (a) =>
        !a.mainAuthor &&
        a.status === "ACCEPTED" &&
        a.email.toLowerCase() === user.email.toLowerCase(),
    );

  /**
   * El expositor puede subir/reemplazar si:
   * - El trabajo está ACCEPTED
   * - Es el autor principal del trabajo
   * - El pago no está APPROVED (definitivo)
   */
  const canUpload =
    paper.status === "ACCEPTED" &&
    isMainAuthor &&
    payment.status !== "APPROVED";

  const hasFile = payment.status !== null && payment.fileName !== null;
  const isReplacing = hasFile && canUpload;

  // ── Helpers de formato ───────────────────────────────────────────────────────
  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatAmount = (amount: number | null) => {
    if (amount === null) return "—";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Stack spacing={3} sx={{ maxWidth: 860, width: "100%", mx: "auto" }}>

      {/* ① Encabezado de navegación */}
      <Box>
        <Button
          component={RouterLink}
          to={`/congresses/${encodeURIComponent(congressCode)}/my-papers`}
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Volver a mis trabajos
        </Button>

        {/* ② Título del trabajo */}
        <Typography
          sx={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.78rem",
            color: "text.secondary",
            mb: 0.5,
          }}
        >
          {paper.code}
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.6rem",
            fontWeight: 600,
            lineHeight: 1.3,
          }}
        >
          {paper.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          Comprobante de pago
        </Typography>
      </Box>

      {/* Alerta de éxito tras subida */}
      {uploadSuccess && (
        <Alert severity="success" onClose={() => setUploadSuccess(null)}>
          {uploadSuccess}
        </Alert>
      )}

      {/* ③ Tarjeta de metadatos + estado */}
      <Paper variant="outlined" sx={{ p: 3, borderColor: "divider", borderRadius: 1 }}>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "flex-start", gap: 2, mb: 2 }}
        >
          <Typography component="h2" sx={{ fontWeight: 700, fontSize: "1rem" }}>
            Estado del pago
          </Typography>
          <PaymentStatusChip status={payment.status} />
        </Stack>

        <Divider sx={{ mb: 2.5 }} />

        {/* Metadatos en grilla */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 600, mb: 0.25 }}
            >
              Monto abonado
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}
            >
              {formatAmount(payment.amountPaid)}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 600, mb: 0.25 }}
            >
              Nombre del archivo
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.82rem",
                overflowWrap: "anywhere",
              }}
            >
              {payment.fileName ?? "—"}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 600, mb: 0.25 }}
            >
              Fecha de subida
            </Typography>
            <Typography variant="body1" sx={{ fontSize: "0.9rem" }}>
              {formatDate(payment.uploadDate)}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 600, mb: 0.25 }}
            >
              Subido por
            </Typography>
            <Typography variant="body1" sx={{ fontSize: "0.9rem" }}>
              {payment.createdBy ?? "—"}
            </Typography>
          </Box>
        </Box>

        {/* Observaciones del administrador — destacadas cuando hay rechazo */}
        {payment.observations && (
          <Alert
            severity={payment.status === "REJECTED" ? "error" : "info"}
            sx={{ mt: 2.5 }}
          >
            <Typography component="span" sx={{ fontWeight: 700 }}>
              {payment.status === "REJECTED"
                ? "Motivo del rechazo: "
                : "Observaciones del administrador: "}
            </Typography>
            {payment.observations}
          </Alert>
        )}

        {/* Aviso de pago definitivo */}
        {payment.status === "APPROVED" && (
          <Alert severity="success" sx={{ mt: 2.5 }}>
            El pago fue verificado y aprobado. El comprobante y su estado son
            definitivos y no pueden modificarse.
          </Alert>
        )}

        {/* Sin comprobante todavía */}
        {payment.status === null && (
          <Alert severity="info" sx={{ mt: 2.5 }}>
            Todavía no se cargó ningún comprobante para este trabajo.
          </Alert>
        )}
      </Paper>

      {/* ④ Visor del comprobante — solo si existe un archivo */}
      {hasFile && (
        <Paper variant="outlined" sx={{ p: 3, borderColor: "divider", borderRadius: 1 }}>
          <Typography component="h2" sx={{ fontWeight: 700, fontSize: "1rem", mb: 2 }}>
            Comprobante cargado
          </Typography>
          <ReceiptViewer
            userId={user.userId}
            paperCode={paperCode}
            fileName={payment.fileName}
          />
        </Paper>
      )}

      {/* ⑤ Sección de carga / reemplazo — visible solo si canUpload */}
      {canUpload && (
        <Paper variant="outlined" sx={{ p: 3, borderColor: "divider", borderRadius: 1 }}>
          <Typography component="h2" sx={{ fontWeight: 700, fontSize: "1rem", mb: 1 }}>
            {isReplacing ? "Reemplazar comprobante" : "Cargar comprobante"}
          </Typography>

          {isReplacing && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Al subir un nuevo archivo reemplazarás el comprobante actual y el
              pago volverá a estado <strong>Pendiente de revisión</strong>.
            </Alert>
          )}

          {!isReplacing && (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Adjuntá el comprobante de pago en PDF, PNG o JPG. Será revisado
              por la administración del congreso.
            </Typography>
          )}

          <Box
            component="form"
            onSubmit={form.handleSubmit((values) => {
              setUploadSuccess(null);
              upload.mutate(values);
            })}
            noValidate
          >
            <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
              {/* Selector de archivo estilizado */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  disabled={upload.isPending}
                >
                  Seleccionar archivo
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    aria-label="Seleccionar comprobante de pago"
                    hidden
                    onChange={(e) => {
                      upload.reset();
                      setUploadSuccess(null);
                      const selected = e.target.files?.[0];
                      if (selected)
                        form.setValue("file", selected, { shouldValidate: true });
                      e.target.value = "";
                    }}
                  />
                </Button>

                {selectedFile && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.78rem",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      · {Math.ceil(selectedFile.size / 1024)} KB
                    </Typography>
                    <Button
                      size="small"
                      color="inherit"
                      disabled={upload.isPending}
                      onClick={() => {
                        form.reset();
                        upload.reset();
                      }}
                      sx={{ minWidth: "auto", px: 0.75, fontSize: "0.72rem" }}
                    >
                      Quitar
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Error de validación del campo file */}
              {form.formState.errors.file && (
                <Typography role="alert" variant="body2" color="error">
                  {form.formState.errors.file.message}
                </Typography>
              )}

              {/* Error de la mutación */}
              {upload.isError && (
                <Alert severity="error">
                  {getPaymentError(upload.error)}
                </Alert>
              )}

              {/* Botón de envío */}
              <Button
                type="submit"
                variant="contained"
                disabled={upload.isPending || record.isFetching}
                startIcon={
                  upload.isPending ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
              >
                {upload.isPending
                  ? "Enviando…"
                  : isReplacing
                    ? "Reemplazar comprobante"
                    : "Subir comprobante"}
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Aviso para coautores (no mainAuthor) cuando el pago no está aprobado */}
      {isCoauthor && !isMainAuthor && payment.status !== "APPROVED" && (
        <Alert severity="info">
          Solo el autor principal puede cargar o reemplazar el comprobante de
          pago.
        </Alert>
      )}
    </Stack>
  );
}
