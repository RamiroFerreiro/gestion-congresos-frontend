import { isAxiosError } from "axios";
import type { CongressParticipation } from "../../congresses/types/congress";

export function canApplyForCoauthorship(
  participant: CongressParticipation | undefined,
  superAdmin = false,
) {
  return (
    !superAdmin &&
    !!participant?.active &&
    !!participant.institution?.trim() &&
    (participant.role === "LISTENER" || participant.role === "EXPOSITOR")
  );
}

export function canManageCoauthorship(paper: {
  responsibleAuthor: boolean;
  status: string;
}) {
  return paper.responsibleAuthor && paper.status === "NOT_SUBMITTED";
}

export function getCoauthorshipError(error: unknown): string {
  if (isAxiosError<{ message?: unknown }>(error)) {
    if (error.response?.status === 401)
      return "Tu sesión venció. Volvé a iniciar sesión.";
    if (error.response?.status === 428)
      return "Completá el primer ingreso antes de continuar.";
    if (!error.response)
      return "No pudimos conectar con el servidor. Intentá nuevamente.";
    if (error.response.status >= 500)
      return "No pudimos completar la operación. Intentá nuevamente más tarde.";
    if (typeof error.response.data?.message === "string")
      return error.response.data.message;
    if (error.response.status === 403)
      return "No tenés permisos para realizar esta operación. Verificá tu participación e institución.";
    if (error.response.status === 404)
      return "No se encontró el trabajo o la solicitud. Actualizá la información.";
    if (error.response.status === 409)
      return "Ya existe una solicitud o participación para ese trabajo.";
  }
  return "No pudimos completar la operación. Intentá nuevamente.";
}

export function getCatalogPage(value: string | null): number {
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 0 ? page : 0;
}
