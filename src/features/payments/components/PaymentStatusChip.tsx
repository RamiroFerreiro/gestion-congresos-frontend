import { Chip } from "@mui/material";
import type { PaymentStatus } from "../types/payment";
import { paymentStates } from "../lib/paymentStates";

export default function PaymentStatusChip({
  status,
}: {
  status: PaymentStatus | null;
}) {
  const state = paymentStates.find((item) => item.status === status);
  return (
    <Chip
      label={state?.label ?? "Estado desconocido"}
      size="small"
      variant="outlined"
      sx={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.65rem",
        color: state?.color,
        bgcolor: state?.background,
        borderColor: "currentColor",
      }}
    />
  );
}
