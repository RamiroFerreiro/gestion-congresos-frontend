import { isAxiosError } from "axios";
import type {
  ReviewerInboxPaper,
  ReviewerInboxStatus,
} from "../types/reviewerInbox";

export const inboxStates: Record<
  ReviewerInboxStatus,
  { label: string; color: string; action: string; actionable: boolean }
> = {
  REVISION_PENDING: {
    label: "Revisión pendiente",
    color: "#66508B",
    action: "Reevaluar",
    actionable: true,
  },
  EVALUATION_PENDING: {
    label: "Pendiente de evaluación",
    color: "#765C30",
    action: "Evaluar",
    actionable: true,
  },
  PENDING_RELEASE: {
    label: "Dictamen pendiente de publicación",
    color: "#66508B",
    action: "Ver dictamen",
    actionable: false,
  },
  NEEDS_REVISION: {
    label: "Con observaciones",
    color: "#946119",
    action: "Ver dictamen",
    actionable: false,
  },
  ACCEPTED: {
    label: "Aprobado",
    color: "#2E7048",
    action: "Ver dictamen",
    actionable: false,
  },
  REJECTED: {
    label: "Desaprobado",
    color: "#B73545",
    action: "Ver dictamen",
    actionable: false,
  },
};

export function isInboxStatus(
  value: string | null,
): value is ReviewerInboxStatus {
  return (
    value !== null && Object.prototype.hasOwnProperty.call(inboxStates, value)
  );
}

export function getInboxActivity(paper: ReviewerInboxPaper): string {
  const label = {
    ASSIGNED: "Asignado",
    CORRECTION_RECEIVED: "Versión corregida recibida",
    EVALUATION_ISSUED: "Dictamen emitido",
  }[paper.lastActivity];
  if (!paper.lastActivityAt) return `${label} · fecha no registrada`;
  const date = new Date(paper.lastActivityAt);
  if (Number.isNaN(date.getTime())) return `${label} · fecha no registrada`;
  return `${label} el ${new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)}`;
}

export function getInboxError(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) {
    if (error.response?.status === 401)
      return "Tu sesión venció. Volvé a iniciar sesión.";
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) return message;
    if (error.response?.status === 403)
      return "Necesitás una participación activa como evaluador y tu institución completa para consultar esta bandeja.";
    if (error.response?.status === 404)
      return "No se encontró el congreso o tu participación activa.";
    if (!error.response)
      return "No pudimos conectar con el servidor. Intentá nuevamente.";
  }
  return "No pudimos cargar la bandeja de trabajos. Intentá nuevamente.";
}
