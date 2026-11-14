export const paymentStates = [
  {
    status: null,
    label: "Sin comprobante",
    color: "#B08628",
    background: "#FBF3DF",
  },
  {
    status: "PENDING_APPROVAL",
    label: "Por revisar",
    color: "#6B4C9A",
    background: "#F0EAF8",
  },
  {
    status: "APPROVED",
    label: "Verificado",
    color: "#3E7A4B",
    background: "#EAF3EC",
  },
  {
    status: "REJECTED",
    label: "Rechazado",
    color: "#A63B3B",
    background: "#F9EAEA",
  },
] as const;
