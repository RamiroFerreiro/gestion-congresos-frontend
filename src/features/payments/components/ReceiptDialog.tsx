import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { PaymentService } from "../api/PaymentService";
import { getPaymentError } from "../lib/paymentErrors";

interface Props {
  userId: number;
  paperCode: string;
  fileName: string | null;
  onClose: () => void;
}

export default function ReceiptDialog({
  userId,
  paperCode,
  fileName,
  onClose,
}: Props) {
  const receipt = useQuery({
    queryKey: ["payment-receipt", userId, paperCode],
    queryFn: ({ signal }) => PaymentService.getReceipt(paperCode, signal),
    retry: false,
    gcTime: 0,
  });
  const attachReceipt = useCallback(
    (
      element: HTMLImageElement | HTMLIFrameElement | HTMLAnchorElement | null,
    ) => {
      if (!element || !receipt.data) return;
      const objectUrl = URL.createObjectURL(receipt.data);
      if (element instanceof HTMLAnchorElement) element.href = objectUrl;
      else element.src = objectUrl;
      return () => URL.revokeObjectURL(objectUrl);
    },
    [receipt.data],
  );
  const extension = fileName?.split(".").pop()?.toLowerCase();
  const isImage =
    ["image/png", "image/jpeg"].includes(receipt.data?.type ?? "") ||
    ["png", "jpg", "jpeg"].includes(extension ?? "");
  const isPdf = receipt.data?.type === "application/pdf" || extension === "pdf";

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="receipt-title"
    >
      <DialogTitle id="receipt-title">
        Comprobante de pago · {paperCode}
      </DialogTitle>
      <DialogContent dividers>
        {receipt.isPending ? (
          <Box role="status" sx={{ display: "flex", gap: 2, py: 4 }}>
            <CircularProgress size={24} />
            <Typography>Cargando comprobante…</Typography>
          </Box>
        ) : receipt.isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={() => void receipt.refetch()}>
                Reintentar
              </Button>
            }
          >
            {getPaymentError(receipt.error)}
          </Alert>
        ) : isImage ? (
          <Box
            component="img"
            ref={attachReceipt}
            alt={`Comprobante de pago de ${paperCode}`}
            sx={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "65vh",
              mx: "auto",
            }}
          />
        ) : isPdf ? (
          <Box
            component="iframe"
            ref={attachReceipt}
            title={`Comprobante de pago de ${paperCode}`}
            sx={{ width: "100%", height: "60vh", border: 0 }}
          />
        ) : (
          <Alert severity="info">
            La vista previa no está disponible para este formato. Podés
            descargar el comprobante.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        {receipt.isSuccess && (
          <Button
            component="a"
            ref={attachReceipt}
            download={fileName || `comprobante-${paperCode}`}
            variant="contained"
          >
            Descargar comprobante
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
