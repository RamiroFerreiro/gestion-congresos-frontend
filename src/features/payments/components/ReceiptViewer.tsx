import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { PaymentService } from "../api/PaymentService";
import { getPaymentError } from "../lib/paymentErrors";

interface Props {
  userId: number;
  paperCode: string;
  fileName: string | null;
}

/**
 * Visualizador inline del comprobante de pago.
 *
 * Renderiza el archivo embebido directamente en la pantalla (sin modal):
 * - PDF → <iframe> con altura fija
 * - Imagen → <img> responsive centrada
 *
 * El blob se obtiene a través de la instancia autenticada de Axios para
 * que el header Authorization: Bearer <token> sea enviado correctamente.
 * Las URLs temporales (createObjectURL) se revocan en el cleanup del ref
 * para evitar memory leaks.
 *
 * Incluye un botón de descarga que usa el fileName original del backend.
 *
 * Preparado para reutilización futura desde la vista de administrador
 * (solo lectura), ya que no contiene lógica de carga ni de roles.
 */
export default function ReceiptViewer({ userId, paperCode, fileName }: Props) {
  const receipt = useQuery({
    queryKey: ["payment-receipt", userId, paperCode],
    queryFn: ({ signal }) => PaymentService.getReceipt(paperCode, signal),
    retry: false,
    gcTime: 0,
  });

  const attachBlob = useCallback(
    (
      element:
        | HTMLImageElement
        | HTMLIFrameElement
        | HTMLAnchorElement
        | null,
    ) => {
      if (!element || !receipt.data) return;
      const objectUrl = URL.createObjectURL(receipt.data);
      if (element instanceof HTMLAnchorElement) {
        element.href = objectUrl;
      } else {
        element.src = objectUrl;
      }
      return () => URL.revokeObjectURL(objectUrl);
    },
    [receipt.data],
  );

  const extension = fileName?.split(".").pop()?.toLowerCase();
  const isImage =
    ["image/png", "image/jpeg"].includes(receipt.data?.type ?? "") ||
    ["png", "jpg", "jpeg"].includes(extension ?? "");
  const isPdf =
    receipt.data?.type === "application/pdf" || extension === "pdf";

  if (receipt.isPending) {
    return (
      <Box role="status" sx={{ display: "flex", alignItems: "center", gap: 2, py: 3 }}>
        <CircularProgress size={22} />
        <Typography color="text.secondary">Cargando comprobante…</Typography>
      </Box>
    );
  }

  if (receipt.isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void receipt.refetch()}>
            Reintentar
          </Button>
        }
      >
        {getPaymentError(receipt.error)}
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      {/* Visor embebido */}
      {isImage ? (
        <Box
          component="img"
          ref={attachBlob}
          alt={`Comprobante de pago — ${paperCode}`}
          sx={{
            display: "block",
            maxWidth: "100%",
            maxHeight: 480,
            mx: "auto",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
          }}
        />
      ) : isPdf ? (
        <Box
          component="iframe"
          ref={attachBlob}
          title={`Comprobante de pago — ${paperCode}`}
          sx={{
            width: "100%",
            height: 520,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
          }}
        />
      ) : (
        <Alert severity="info">
          La vista previa no está disponible para este formato. Podés descargarlo
          con el botón de abajo.
        </Alert>
      )}

      {/* Botón de descarga */}
      <Box>
        <Button
          component="a"
          ref={attachBlob}
          download={fileName ?? `comprobante-${paperCode}`}
          variant="outlined"
          startIcon={<DownloadIcon />}
          sx={{ fontWeight: 700 }}
        >
          Descargar comprobante
        </Button>
      </Box>
    </Stack>
  );
}
