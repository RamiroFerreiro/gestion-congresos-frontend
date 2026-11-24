import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { reviewSchema, type ReviewValues } from "../schemas/paymentSchemas";
import type { PaymentReview } from "../types/payment";

interface Props {
  paperCode: string;
  status: PaymentReview["status"];
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (review: PaymentReview) => void;
}

export default function PaymentReviewDialog({
  paperCode,
  status,
  pending,
  error,
  onClose,
  onConfirm,
}: Props) {
  const rejecting = status === "REJECTED";
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { status, observations: "" },
  });
  const observations = useWatch({ control, name: "observations" });
  return (
    <Dialog
      open
      onClose={() => {
        if (!pending) onClose();
      }}
      fullWidth
      maxWidth="sm"
      aria-labelledby="review-title"
    >
      <form onSubmit={handleSubmit(onConfirm)} noValidate>
        <DialogTitle id="review-title">
          {rejecting ? "Rechazar comprobante" : "Aprobar pago"}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {" "}
            {rejecting
              ? `Indicá por qué no puede aprobarse el comprobante de ${paperCode}.`
              : `¿Confirmás que el comprobante de ${paperCode} es válido? El pago quedará verificado y no podrá modificarse.`}
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {rejecting && (
            <TextField
              {...register("observations")}
              label="Motivo del rechazo"
              required
              fullWidth
              multiline
              minRows={3}
              autoFocus
              disabled={pending}
              error={!!errors.observations}
              helperText={
                errors.observations?.message ??
                `${observations.length}/255 caracteres`
              }
              slotProps={{ htmlInput: { maxLength: 255 } }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={pending}>
            Volver
          </Button>
          <Button
            type="submit"
            variant="contained"
            color={rejecting ? "error" : "primary"}
            disabled={pending}
          >
            {pending
              ? "Guardando…"
              : rejecting
                ? "Confirmar rechazo"
                : "Confirmar aprobación"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
