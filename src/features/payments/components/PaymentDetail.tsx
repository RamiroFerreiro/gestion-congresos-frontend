import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useAuth } from "../../auth/context/AuthContext";
import { PaymentService } from "../api/PaymentService";
import { paymentRecordOptions } from "../lib/paymentQueries";
import { getPaymentError } from "../lib/paymentErrors";
import { receiptSchema, type ReceiptValues } from "../schemas/paymentSchemas";
import type { PaymentReview } from "../types/payment";
import PaymentStatusChip from "./PaymentStatusChip";
import PaymentReviewDialog from "./PaymentReviewDialog";
import ReceiptDialog from "./ReceiptDialog";

interface Props {
  congressCode: string;
  paperCode: string;
  isAdmin: boolean;
  isExpositor: boolean;
  userCode?: string;
}

export default function PaymentDetail({
  congressCode,
  paperCode,
  isAdmin,
  isExpositor,
  userCode,
}: Props) {
  const { user } = useAuth();
  const client = useQueryClient();
  const [showReceipt, setShowReceipt] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<
    PaymentReview["status"] | null
  >(null);
  const [success, setSuccess] = useState<string | null>(null);
  const form = useForm<ReceiptValues>({ resolver: zodResolver(receiptSchema) });
  const file = useWatch({ control: form.control, name: "file" });
  const options = paymentRecordOptions(user!.userId, congressCode, paperCode);
  const record = useQuery(options);
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: options.queryKey }),
      client.invalidateQueries({
        queryKey: ["accepted-payment-papers", user!.userId, congressCode],
      }),
      client.invalidateQueries({
        queryKey: ["payment-receipt", user!.userId, paperCode],
      }),
    ]);
  };
  const upload = useMutation({
    mutationFn: (values: ReceiptValues) =>
      PaymentService.upload(paperCode, values.file),
    onSuccess: async (payment) => {
      client.setQueryData(options.queryKey, (previous) =>
        previous ? { ...previous, payment } : previous,
      );
      form.reset();
      setSuccess("Comprobante enviado. El pago está pendiente de revisión.");
      await refresh();
    },
    onError: () => {
      void refresh();
    },
  });
  const review = useMutation({
    mutationFn: (values: PaymentReview) =>
      PaymentService.review(paperCode, values),
    onSuccess: async (payment) => {
      client.setQueryData(options.queryKey, (previous) =>
        previous ? { ...previous, payment } : previous,
      );
      setReviewStatus(null);
      setSuccess(
        payment.status === "APPROVED"
          ? "Pago verificado correctamente."
          : "Comprobante rechazado. El autor principal podrá enviar uno nuevo.",
      );
      await refresh();
    },
    onError: () => {
      void refresh();
    },
  });

  if (record.isPending)
    return (
      <Box role="status" sx={{ display: "flex", gap: 2, py: 4 }}>
        <CircularProgress size={24} />
        <Typography>Consultando el pago…</Typography>
      </Box>
    );
  if (record.isError)
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" onClick={() => void record.refetch()}>
            Reintentar
          </Button>
        }
      >
        {getPaymentError(record.error)}
      </Alert>
    );

  const { paper, payment } = record.data;
  const accepted = paper.status === "ACCEPTED";
  const mainAuthor = paper.authors.some(
    (author) =>
      author.mainAuthor &&
      author.status === "ACCEPTED" &&
      (userCode
        ? author.userCode === userCode
        : author.email.toLowerCase() === user!.email.toLowerCase()),
  );
  const canUpload =
    accepted &&
    isExpositor &&
    mainAuthor &&
    (payment.status === null || payment.status === "REJECTED");
  const canReview =
    accepted && isAdmin && payment.status === "PENDING_APPROVAL";
  const pending = upload.isPending || review.isPending;

  return (
    <Stack spacing={2.5}>
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "text.secondary",
                mb: 1,
              }}
            >
              {paper.code}
            </Typography>
            <Typography
              component="h2"
              sx={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.4rem",
                fontWeight: 600,
              }}
            >
              {paper.title}
            </Typography>
          </Box>
          {accepted ? (
            <PaymentStatusChip status={payment.status} />
          ) : (
            <Typography color="text.secondary">Pago no habilitado</Typography>
          )}
        </Stack>
        <Divider sx={{ my: 2 }} />
        {!accepted ? (
          <Alert severity="info">
            El pago se habilita cuando el trabajo está académicamente aceptado.
          </Alert>
        ) : (
          <>
            {payment.uploadDate && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                Último comprobante:{" "}
                {new Intl.DateTimeFormat("es-AR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(payment.uploadDate))}
              </Typography>
            )}
            {payment.observations && (
              <Alert
                severity={payment.status === "REJECTED" ? "error" : "info"}
                sx={{ mb: 2 }}
              >
                <b>
                  {payment.status === "REJECTED"
                    ? "Motivo del rechazo: "
                    : "Observaciones: "}
                </b>
                {payment.observations}
              </Alert>
            )}
            {payment.status === null && (
              <Typography color="text.secondary">
                Todavía no se cargó un comprobante para este trabajo.
              </Typography>
            )}
            {payment.status === "PENDING_APPROVAL" && (
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                El comprobante está pendiente de revisión por la administración
                del congreso.
              </Typography>
            )}
            {payment.status === "APPROVED" && (
              <Alert severity="success" sx={{ mb: 2 }}>
                El pago está verificado. El comprobante y su estado ya no pueden
                modificarse.
              </Alert>
            )}
            <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
              {payment.status !== null && (
                <Button
                  variant="outlined"
                  onClick={() => setShowReceipt(true)}
                  disabled={pending}
                >
                  Ver comprobante
                </Button>
              )}
              {canReview && (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={pending || record.isFetching}
                    onClick={() => {
                      review.reset();
                      setSuccess(null);
                      setReviewStatus("REJECTED");
                    }}
                  >
                    Rechazar
                  </Button>
                  <Button
                    variant="contained"
                    disabled={pending || record.isFetching}
                    onClick={() => {
                      review.reset();
                      setSuccess(null);
                      setReviewStatus("APPROVED");
                    }}
                  >
                    Aprobar pago
                  </Button>
                </>
              )}
            </Stack>
          </>
        )}
      </Paper>
      {canUpload && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography component="h2" sx={{ fontWeight: 700, mb: 1 }}>
            {payment.status === "REJECTED"
              ? "Enviar un nuevo comprobante"
              : "Cargar comprobante"}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Adjuntá el comprobante de pago en PDF, PNG o JPG. Será revisado por
            la administración del congreso.
          </Typography>
          <Box
            component="form"
            onSubmit={form.handleSubmit((values) => {
              setSuccess(null);
              upload.mutate(values);
            })}
            noValidate
          >
            <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
              <Button component="label" variant="outlined" disabled={pending}>
                Seleccionar archivo
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  aria-label="Seleccionar comprobante de pago"
                  hidden
                  onChange={(event) => {
                    upload.reset();
                    const selected = event.target.files?.[0];
                    if (selected)
                      form.setValue("file", selected, { shouldValidate: true });
                    event.target.value = "";
                  }}
                />
              </Button>
              {file && (
                <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
                  {file.name} · {Math.ceil(file.size / 1024)} KB
                </Typography>
              )}
              {form.formState.errors.file && (
                <Typography role="alert" color="error">
                  {form.formState.errors.file.message}
                </Typography>
              )}
              {upload.isError && (
                <Alert severity="error">{getPaymentError(upload.error)}</Alert>
              )}
              <Button
                variant="contained"
                type="submit"
                disabled={pending || record.isFetching}
              >
                {upload.isPending
                  ? "Enviando comprobante…"
                  : "Enviar comprobante"}
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}
      {accepted &&
        isExpositor &&
        !mainAuthor &&
        payment.status !== "APPROVED" && (
          <Alert severity="info">
            Solo el autor principal puede cargar o reemplazar el comprobante.
          </Alert>
        )}
      {showReceipt && (
        <ReceiptDialog
          userId={user!.userId}
          paperCode={paperCode}
          fileName={payment.fileName}
          onClose={() => setShowReceipt(false)}
        />
      )}
      {reviewStatus && (
        <PaymentReviewDialog
          key={reviewStatus}
          paperCode={paperCode}
          status={reviewStatus}
          pending={review.isPending}
          error={review.isError ? getPaymentError(review.error) : null}
          onClose={() => setReviewStatus(null)}
          onConfirm={(values) => review.mutate(values)}
        />
      )}
    </Stack>
  );
}
